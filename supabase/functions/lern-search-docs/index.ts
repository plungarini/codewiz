import { serve } from 'https://deno.land/std@0.170.0/http/server.ts'
import 'https://deno.land/x/xhr@0.2.1/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import { codeBlock, oneLine } from 'https://esm.sh/common-tags@1.8.2'
import {
	ChatCompletionRequestMessage,
	ChatCompletionRequestMessageRoleEnum,
	Configuration,
	CreateChatCompletionRequest,
	OpenAIApi
} from 'https://esm.sh/openai@3.2.1'
import { Database } from '../common/database-types.ts'
import { ApplicationError, UserError } from '../common/errors.ts'
import { getChatRequestTokenCount, getMaxTokenCount } from '../common/tokenizer.ts'

const firebaseKey = Deno.env.get('FIREBASE_FUNCTIONS_KEY')
const openAiKey = Deno.env.get('OPENAI_KEY')
const openAiOrg = Deno.env.get('OPENAI_ORG')
const supabaseUrl = Deno.env.get('SB_URL')
const supabaseServiceKey = Deno.env.get('SB_SERVICE_ROLE_KEY')

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    if (!openAiKey) {
      throw new ApplicationError('Missing environment variable OPENAI_KEY')
    }

    if (!supabaseUrl) {
      throw new ApplicationError('Missing environment variable SB_URL')
    }

    if (!supabaseServiceKey) {
      throw new ApplicationError('Missing environment variable SB_SERVICE_ROLE_KEY')
    }

    const requestData = await req.json()

    if (!requestData) {
			throw new UserError('Missing request data', { code: 'INVALID_REQUEST_DATA' })
		}

		let { query, repo, uid, environment, availableRepos } = requestData;

		if (!uid) {
			throw new UserError('Missing uid in request data', { code: 'MISSING_UID' })
		}

		const tableName = repo?.replace(/^\/|\/$/g, '')?.split('/')?.pop();

		if (!tableName) {
			throw new ApplicationError('Failed to sanitize table name', { repo })
		}

    if (!query) {
      throw new UserError('Missing query in request data')
		} else {
			query = `I want to learn ${query}`;
		}
		
		const canUserQueryUrl = environment === 'production' ? 'https://canuserquery-ytzgrgrjxq-ew.a.run.app' : 'https://canuserquery-ik2jh2ngra-ew.a.run.app';
		const res = await fetch(canUserQueryUrl, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({
				uid: uid,
				authorization: firebaseKey,
			}),
		});

		let canQueryJson = false;
		try {
			canQueryJson = await res.json();
			console.log({ canQuery: canQueryJson, uid });
			
			if (!canQueryJson) {
				throw new UserError('Subscription reached maximum limit', { code: 'SUBSCRIPTION_LIMIT_REACHED' });
			}
		} catch (err) {
			throw new ApplicationError('Error checking subscription, user cannot query');
		}

    // Intentionally log the request data
		console.log({ requestData })

    const sanitizedQuery = query.trim()

		const supabaseClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
			auth: {
				persistSession: false,
			},
		})

    const configuration = new Configuration({ apiKey: openAiKey, organization: openAiOrg })
    const openai = new OpenAIApi(configuration)

    // Moderate the content to comply with OpenAI T&C
    const moderationResponse = await openai.createModeration({ input: sanitizedQuery })

    const [results] = moderationResponse.data.results

    if (results.flagged) {
      throw new UserError('Flagged content', {
        flagged: true,
        categories: results.categories,
      })
    }

    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: sanitizedQuery.replaceAll('\n', ' '),
    })

    if (embeddingResponse.status !== 200) {
      throw new ApplicationError('Failed to create embedding for question', embeddingResponse)
    }

    const [{ embedding }] = embeddingResponse.data.data
		const { error: matchError, data: pageSections } = await supabaseClient
			.rpc('search_embeddings', {
				table_custom_name: tableName,
				embed_query: embedding,
				match_threshold: 0.78,
				min_content_length: 50,
			})
			.select('id, content, title')
			.limit(10);
		
		const normPageSections = pageSections as {
			id: string;
			title: string;
			content: string;
		}[] | undefined;

    if (matchError || !normPageSections) {
      throw new ApplicationError('Failed to match page sections', matchError ?? undefined)
		}

		const contextText = normPageSections.map((section) => {
			return (`${section.title}\n${section.content}`).trim();
		}).join('---').trim();

		const initMessages: ChatCompletionRequestMessage[] = [
			{
				role: ChatCompletionRequestMessageRoleEnum.System,
				content: codeBlock`
					${oneLine`
						You are an expert on the ${tableName} documentation provided.
						The user will ask questions related to this documentation.
						You need to determine if the user's question is relevant to
						the ${tableName} documentation. If it isn't relevant, suggest
						the most appropriate documentation that should be consulted.
						Use the 'canFindAnswers' function to indicate your decision
						and recommendation.
					`}
				`,
			},
			{
				role: ChatCompletionRequestMessageRoleEnum.User,
				content: codeBlock`
					Based on the provided ${tableName} documentation:
					"""
					${contextText.length < 10 ? '[No documentation found]' : contextText}
					"""

					Can the following question be answered using this documentation,
					or is there a more relevant documentation topic?
					"""
					${query}
					"""

					Please use the 'canFindAnswers' function to indicate if this question
					is relevant or not and suggest a better documentation topic if needed.
				`,
			},
		];

		const model = 'gpt-3.5-turbo-0613';
		const maxCompletionTokenCount = 1024;

		const completionMessages: ChatCompletionRequestMessage[] = capMessages(
			initMessages,
			[],
			maxCompletionTokenCount,
			model
		);

		const functions = [
			{
				name: 'canFindAnswers',
				description: oneLine`
					Determine if the user's question can be answered using the provided
					documentation. Returns "Yes" or "No" for relevance and suggests a
					more fitting documentation topic if the question is not relevant.
				`,
				parameters: {
					type: 'object',
					properties: {
						isQuestionRelevant: {
							type: 'boolean',
							description: 'True if the question of the user can be answered using the documentation provided. False if the question is not relevant to the documentation.',
						},
						suggestedDocumentation: {
							type: 'string',
							enum: [...availableRepos.filter((r: string) => !!r)],
							description: `Suggests a more appropriate documentation topic if the question is not relevant to the current documentation.`,
						}
					},
					required: ['isQuestionRelevant', 'suggestedDocumentation'],
				}
			}
		];
		
		const completionOptions: CreateChatCompletionRequest = {
			model,
			functions,
			messages: completionMessages,
			max_tokens: 50,
			temperature: 0.75,
			stream: false,
		}

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${openAiKey}`,
				'OpenAI-Organization': openAiOrg,
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify(completionOptions),
		});

		if (!response.ok || !response.body) {
			const error = await response.json()
			throw new ApplicationError('Failed to generate completion', error)
		};

		let data = { choices: [ { message: { function_call: { name: 'canFindAnswers', arguments: '{ isQuestionRelevant: false }' } } } ], usage: { } };
		try {
			data = await response.json();
			console.log('OpenAi response', data);
		} catch (err) {
			console.warn(err);
		}
		const message = data?.choices?.at(0)?.message;
		const function_call = message?.function_call;
		const args = function_call?.arguments ?? '{ isQuestionRelevant: false }';

		let can = false;
		let suggested = '';
		try {
			can = !!JSON.parse(args)?.isQuestionRelevant;
			suggested = JSON.parse(args)?.suggestedDocumentation;
		} catch (err) {
			console.warn(err);
			can = can || false;
		}

		// Console log usage
		console.log({ usage: data?.usage });
		// TODO: Set openai tokens on db for prompt and response

		return new Response(JSON.stringify({
			can,
			pages: normPageSections,
			suggested,
		}), {
			headers: {
				...corsHeaders,
				'Content-Type': 'application/json',
			},
		});
  } catch (err: unknown) {
    if (err instanceof UserError) {
      return new Response(
        JSON.stringify({
          error: (err as any)?.message,
          data: (err as any)?.data,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else if (err instanceof ApplicationError) {
      // Print out application errors with their additional data
      console.error(`${(err as any)?.message}: ${JSON.stringify((err as any)?.data)}`)
    } else {
      // Print out unexpected errors as is to help with debugging
      console.error(err)
    }

    // TODO: include more response info in debug environments
    return new Response(
      JSON.stringify({
        error: 'There was an error processing your request',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/**
	* Remove context messages until the entire request fits
	* the max total token count for that model.
	*
	* Accounts for both message and completion token counts.
	*/
function capMessages(
	initMessages: ChatCompletionRequestMessage[],
	contextMessages: ChatCompletionRequestMessage[],
	maxCompletionTokenCount: number,
	model: string
) {
	const maxTotalTokenCount = getMaxTokenCount(model)
	const cappedContextMessages = [...contextMessages]
	let tokenCount =
		getChatRequestTokenCount([...initMessages, ...cappedContextMessages], model) +
		maxCompletionTokenCount

	// Remove earlier context messages until we fit
	while (tokenCount >= maxTotalTokenCount) {
		cappedContextMessages.shift()
		tokenCount =
			getChatRequestTokenCount([...initMessages, ...cappedContextMessages], model) +
			maxCompletionTokenCount
	}

	return [...initMessages, ...cappedContextMessages]
}
