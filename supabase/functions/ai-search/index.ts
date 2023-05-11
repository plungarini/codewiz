import { serve } from 'https://deno.land/std@0.170.0/http/server.ts'
import 'https://deno.land/x/xhr@0.2.1/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'
import { oneLine, stripIndent } from 'https://esm.sh/common-tags@1.8.2'
import GPT3Tokenizer from 'https://esm.sh/gpt3-tokenizer@1.1.5'
import { Configuration, CreateCompletionRequest, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import { ApplicationError, UserError } from './errors.ts'

const openAiKey = Deno.env.get('OPENAI_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

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
      throw new ApplicationError('Missing environment variable SUPABASE_URL')
		}

    if (!supabaseServiceKey) {
      throw new ApplicationError('Missing environment variable SUPABASE_SERVICE_ROLE_KEY')
		}

		const requestData = await req.json();

    if (!requestData) {
      throw new UserError('Missing request data')
    }

    const { query, onlyPrompt, stream } = requestData

    if (!query) {
      throw new UserError('Missing query in request data')
    }

    const sanitizedQuery = query.trim()

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const configuration = new Configuration({ apiKey: openAiKey })
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

    const { error: matchError, data: pageSections } = await supabaseClient.rpc(
      'match_page_sections',
      {
        embedding,
        match_threshold: 0.78,
        match_count: 10,
        min_content_length: 50,
      }
		)
		

    if (matchError) {
      throw new ApplicationError('Failed to match page sections', matchError)
    }

    const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
    let tokenCount = 0
    let contextText = ''

    for (let i = 0; i < pageSections.length; i++) {
      const pageSection = pageSections[i]
      const content = pageSection.content
      const encoded = tokenizer.encode(content)
      tokenCount += encoded.text.length

      if (tokenCount >= 1500) {
        break
      }

      contextText += `${content.trim()}\n---\n`
		}

		const prompt = {
			system: {
				content: stripIndent`
					${oneLine`
						You are a very enthusiastic Hypixel Skyblock user who loves
						to help people! You impersonate a funny, expert and very egocentric
						wizard who knows almost everything. You were created by the great @wheresbebo.
						Given the following sections from the Hypixel Skyblock wiki, answer
						the question using only that information, outputted in markdown format
						with line breaks, paragraphs or titles if needed. If you are unsure and
						the answer is not explicitly written in the wiki, say "No results found".
						Always reply in the question language but don't translate names of important things else
						the user cannot find them in Hypixel Skyblock. Be a lot concise and summarize if the
						answer is too long.	Don't include links or images urls if they don't include the host.
						Provide the source of your answer if appropriate, like the link of the wiki page.
					`}
				`,
				role: 'system',
			},
			user: {
				content: stripIndent`
					\n\n
					Context sections: """
					${contextText}
					"""
					Question: """
					${sanitizedQuery}
					"""
					Answer as markdown format (use line breaks, paragraphs, titles or styled text to make the content more readable and cute):
				`,
				role: 'user'
			}
		}

		if (onlyPrompt) {
			return new Response(JSON.stringify({messages: [prompt.system, prompt.user]}), {
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json',
				},
			})
		}

    const completionOptions: CreateCompletionRequest = {
      model: 'gpt-3.5-turbo',
      max_tokens: 512,
      temperature: 0,
			stream: stream,
			messages: [prompt.system, prompt.user],
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        Authorization: `Bearer ${openAiKey}`,
				'Content-Type': 'application/json',
      },
			method: 'POST',
      body: JSON.stringify(completionOptions),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new ApplicationError('Failed to generate completion', error)
    }

    // Proxy the streamed SSE response from OpenAI
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    })
  } catch (err: unknown) {
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
      console.error(`${err.message}: ${JSON.stringify(err.data)}`)
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