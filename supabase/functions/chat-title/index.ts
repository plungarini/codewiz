import { serve } from 'https://deno.land/std@0.170.0/http/server.ts'
import 'https://deno.land/x/xhr@0.2.1/mod.ts'
import { codeBlock, oneLine } from 'https://esm.sh/common-tags@1.8.2'
import {
	ChatCompletionRequestMessage,
	ChatCompletionRequestMessageRoleEnum,
	Configuration,
	CreateChatCompletionRequest,
	OpenAIApi
} from 'https://esm.sh/openai@3.2.1'
import { ApplicationError, UserError } from '../common/errors.ts'
import { getChatRequestTokenCount, getMaxTokenCount } from '../common/tokenizer.ts'

enum MessageRole {
	User = 'user',
	Assistant = 'assistant',
}

interface Message {
	role: MessageRole
	content: string
}

interface RequestData {
	messages: Message[];
	stream: boolean;
}

const firebaseKey = Deno.env.get('FIREBASE_FUNCTIONS_KEY')
const openAiKey = Deno.env.get('OPENAI_KEY')

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

		const requestData: RequestData = await req.json()

		if (!requestData) {
			throw new UserError('Missing request data')
		}

		const { messages, stream } = requestData

		if (!messages) {
			throw new UserError('Missing messages in request data')
		}

		// Intentionally log the request data
		console.log({ requestData })

		// TODO: better sanitization
		const contextMessages: ChatCompletionRequestMessage[] = messages.map(({ role, content }) => {
			if (
				![
					ChatCompletionRequestMessageRoleEnum.User,
					ChatCompletionRequestMessageRoleEnum.Assistant,
				].includes(role)
			) {
				throw new Error(`Invalid message role '${role}'`)
			}

			return {
				role,
				content: content.trim(),
			}
		})

		const [userMessage] = contextMessages.filter(({ role }) => role === MessageRole.User).slice(-1)

		if (!userMessage) {
			throw new Error("No message with role 'user'")
		}

		const configuration = new Configuration({ apiKey: openAiKey })
		const openai = new OpenAIApi(configuration)

		// Moderate the content to comply with OpenAI T&C
		const moderationResponses = await Promise.all(
			contextMessages.map((message) => openai.createModeration({ input: message.content }))
		)

		for (const moderationResponse of moderationResponses) {
			const [results] = moderationResponse.data.results

			if (results.flagged) {
				throw new UserError('Flagged content', {
					flagged: true,
					categories: results.categories,
				})
			}
		}

		const initMessages: ChatCompletionRequestMessage[] = [
			{
				role: ChatCompletionRequestMessageRoleEnum.System,
				content: codeBlock`
					${oneLine`
						Now generate a short and concise title that accurately represents
						the key argument discussed in this chat's message. The title should be
						no longer than 30 characters.
					`}
					${oneLine`
						Avoid including any unnecessary details or context from the
						message. Output just the title as a plain text without any
						additional formatting or quotes.
					`}
					${oneLine`
						Make the title extremely short
					`}
					${oneLine`
						Title:
					`}
				`,
			},
		];

		const model = 'gpt-3.5-turbo-0613';
		const maxCompletionTokenCount = 10;

		const completionMessages: ChatCompletionRequestMessage[] = capMessages(
			initMessages,
			contextMessages,
			maxCompletionTokenCount,
			model
		);

		const completionOptions: CreateChatCompletionRequest = {
			model,
			messages: completionMessages,
			max_tokens: maxCompletionTokenCount,
			temperature: 0.75,
			stream: !!stream,
		}

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${openAiKey}`,
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify(completionOptions),
		})

		if (!response.ok || !response.body) {
			const error = await response.json()
			throw new ApplicationError('Failed to generate completion', error)
		}

		return new Response(response.body, {
			headers: {
			...corsHeaders,
			'Content-Type': 'text/event-stream',
			},
		});
	} catch (err: unknown) {
		let type = '';
		let message = '';

		if (err instanceof UserError) {
			return new Response(
				JSON.stringify({
					error: err.message,
					data: err.data,
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			)
		} else if (err instanceof ApplicationError) {
			// Print out application errors with their additional data
			console.error(`${err.message}: ${JSON.stringify(err.data)}`);
			type = err.data['error']['type'];
			message = err.data['error']['message'];
		} else {
			// Print out unexpected errors as is to help with debugging
			console.error(err)
		}

		return new Response(
			JSON.stringify({
		error: 'There was an error processing your request',
		debug: {
			type: type || '',
			message
		}
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

	return [...cappedContextMessages, ...initMessages];
}
