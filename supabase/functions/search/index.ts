import { serve } from 'https://deno.land/std@0.170.0/http/server.ts'
import 'https://deno.land/x/xhr@0.2.1/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import { Database } from '../common/database-types.ts'
import { ApplicationError, UserError } from '../common/errors.ts'

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
      throw new UserError('Missing request data')
    }

    const { query, repo } = requestData

    if (!query) {
      throw new UserError('Missing query in request data')
		}
		
		if (!repo) {
			throw new UserError('Missing repo in request data')
		}

		const tableName = repo?.replace(/^\/|\/$/g, '')?.split('/')?.pop();

		if (!tableName) {
			throw new ApplicationError('Failed to sanitize table name', { repo })
		}

    // Intentionally log the request data
		console.log({ requestData })
		
    const sanitizedQuery = query.trim()

		const supabaseClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
			auth: {
				persistSession: false,
			},
		})

    const configuration = new Configuration({ apiKey: openAiKey, organization: openAiOrg, })
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

		const combinedPages = normPageSections
			.map((pageSection, index) => ({ ...pageSection, rank: index }))
      .sort((a, b) => a.rank - b.rank)

    return new Response(JSON.stringify(combinedPages), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
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
