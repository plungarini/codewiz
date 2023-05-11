import { createClient } from '@supabase/supabase-js';
import * as functions from 'firebase-functions';
import { Configuration, OpenAIApi } from 'openai';
import { warn } from 'firebase-functions/logger';

const MAX_CHARS = 30_000;

const openAiTokenSanitizer = (
  input: string,
  charsMultiplier = 1,
  tries = 1
): string[] => {
  if (tries > 3) {
    throw new Error(
      'OpenAi Token Sanitizer has done too many tries... Can\'t find a valid title to split the section.'
    );
  }

  if (input.length < MAX_CHARS) {
    return [input];
  }

  const titleIndex = input.indexOf('\n==', MAX_CHARS - 5_000 * charsMultiplier);
  if (titleIndex > MAX_CHARS) {
    return openAiTokenSanitizer(input, charsMultiplier + 1, tries + 1);
  }

  const sections = [input.slice(0, titleIndex), input.slice(titleIndex + 1)];

  if (sections[1].length > MAX_CHARS) {
    const sections2 = openAiTokenSanitizer(sections[1]);
    sections.splice(1, 1);
    sections.push(...sections2);
  }

  functions.logger.warn('Finished Token Sanitizer');

  return sections;
};

export const elaborateEmbeddings = async (req: {
  title: string;
  link: string;
  content: string;
  id: string;
}) => {
  const supabasePublicUrl = process.env.SUPABASE_PUBLIC_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_KEY;

  warn(supabasePublicUrl, supabaseServiceRoleKey, openaiKey);

  if (!supabasePublicUrl || !supabaseServiceRoleKey || !openaiKey) {
    return functions.logger.error(
      'Environment variables SUPABASE_PUBLIC_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_KEY are required: skipping embeddings generation'
    );
  }

  warn(1);

  const supabase = createClient(supabasePublicUrl, supabaseServiceRoleKey);

  warn(2);

  // Check for existing page in DB and compare checksums
  const { error: fetchPageError, data: existingPage } = await supabase
    .from('page')
    .select()
    .filter('id', 'eq', req.id)
    .limit(1)
    .maybeSingle();

  if (fetchPageError) {
    throw fetchPageError;
  }

  warn(3);

  // Create/update page record.
  const { error: upsertPageError, data: page } = await supabase
    .from('page')
    .upsert({
      id: req.id,
      createdAt: existingPage?.createdAt || new Date(),
      updatedAt: new Date(),
      link: req.link,
      title: decodeURIComponent(req.title),
    })
    .select()
    .limit(1)
    .single();

  if (upsertPageError) {
    throw upsertPageError;
  }

  warn(4);

  try {
    const configuration = new Configuration({ apiKey: openaiKey });
    const openai = new OpenAIApi(configuration);

    const sanitizedInput = openAiTokenSanitizer(req.content);

    for (let i = 0; i < sanitizedInput.length; i++) {
      // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
      const sanInput = sanitizedInput[i].replace(/\n/g, ' ');

      const embeddingResponse = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: sanInput,
      });

      if (embeddingResponse.status !== 200) {
        functions.logger.error(embeddingResponse.data);
        throw new Error(JSON.stringify(embeddingResponse.data));
      }

      const [responseData] = embeddingResponse.data.data;

      const { error: insertPageSectionError } = await supabase
        .from('page_section')
        .upsert({
          uuid:
            sanitizedInput.length < 2
              ? page.id.toString()
              : `${page.id}_${i + 1}`,
          page_id: page.id,
          content: sanInput,
          token_count: embeddingResponse.data.usage.total_tokens,
          embedding: responseData.embedding,
          createdAt: existingPage?.createdAt || new Date(),
          updatedAt: new Date(),
        })
        .select()
        .limit(1)
        .single();

      if (insertPageSectionError) {
        throw insertPageSectionError;
      }
    }
  } catch (error) {
    // TODO: decide how to better handle failed embeddings
    functions.logger.error(
      `Failed to generate embeddings for '${
        req.id
      }' page section starting with '${req.content.slice(0, 40)}...'`
    );
    functions.logger.error(error);

    throw error;
  }

  return true;
};
