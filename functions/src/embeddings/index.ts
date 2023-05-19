import { createClient } from '@supabase/supabase-js';
import { error, warn } from 'firebase-functions/logger';
import { Configuration, OpenAIApi } from 'openai';

const MAX_CHARS = 10_000;
const MIN_SECTION_LENGTH = 5;

const splitInput = (input: string): string[] => {
  const sections: string[] = [];
  let currentSection = '';

  while (input.length > 0) {
    const splitIndex = input.lastIndexOf('##') || input.lastIndexOf('======') || input.lastIndexOf('-------');

    if (splitIndex !== -1 && input.length > MAX_CHARS) {
      const newSection = input.slice(splitIndex);
      const totalLength = currentSection.length + newSection.length;

      if (totalLength > MAX_CHARS) {
        if (currentSection.length > MIN_SECTION_LENGTH) sections.unshift(currentSection);
        currentSection = newSection;
        input = input.slice(0, splitIndex);
      } else {
        currentSection = newSection + currentSection;
        input = input.slice(0, splitIndex);
      }
    } else {
      if (currentSection.length > MIN_SECTION_LENGTH) sections.unshift(currentSection);
      if (input.length > MIN_SECTION_LENGTH) sections.unshift(input);
      currentSection = '';
      input = '';
    }
  }

  sections.forEach((section) => {
    if (section.length > MAX_CHARS) throw new Error('One of the sections is too long.');
  });

  warn('Sections:', sections.length, sections.map((v, i) => `[Section ${i + 1}: ${v.length} chars]`));
  return sections;
};

const openAiTokenSanitizer = (input: string): string[] => {
  if (input.length < MAX_CHARS) {
    warn(`Input length (${input.length}) is less than MAX_CHARS (${MAX_CHARS})`);
    return [input];
  }

  return splitInput(input);
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

  if (!supabasePublicUrl || !supabaseServiceRoleKey || !openaiKey) {
    return error(
      'Environment variables SUPABASE_PUBLIC_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_KEY are required: skipping embeddings generation'
    );
  }

	const supabase = createClient(supabasePublicUrl, supabaseServiceRoleKey);

  // Check for existing page in DB
  const { error: fetchPageError, data: existingPage } = await supabase
    .from('page')
    .select('id, path, createdAt')
		.filter('path', 'eq', req.link)
    .limit(1)
		.maybeSingle();

  if (fetchPageError) {
    throw fetchPageError;
	}

  // Create/update page record.
	const pageRecord = {
		id: req.id,
		path: req.link,
		title: decodeURIComponent(req.title),
		createdAt: existingPage?.createdAt || new Date(),
		updatedAt: new Date(),
	};

	warn('pageRecord', pageRecord);
  const { error: upsertPageError, data: page } = await supabase
    .from('page')
		.upsert(pageRecord)
    .select()
    .limit(1)
		.single();

	if (upsertPageError) {
		error('upsertPageError', upsertPageError.code, upsertPageError.hint, upsertPageError.details);
    throw upsertPageError;
	}

	try {
    const configuration = new Configuration({ apiKey: openaiKey });
    const openai = new OpenAIApi(configuration);
		warn('Configuring OpenAI - COMPLETED');

    const sanitizedInput = openAiTokenSanitizer(req.content);

    for (let i = 0; i < sanitizedInput.length; i++) {
      // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
      const sanInput = sanitizedInput[i].replace(/\n/g, ' ');

      const embeddingResponse = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: sanInput,
			});

			if (embeddingResponse.status !== 200) {
        error(embeddingResponse.data);
        throw new Error(JSON.stringify(embeddingResponse.data));
			}

      const [responseData] = embeddingResponse.data.data;

      const { error: insertPageSectionError } = await supabase
        .from('page_section')
        .upsert({
          id:
            sanitizedInput.length < 2
              ? `${page.id}[1]`
              : `${page.id}[${i + 1}]`,
          path: page.path,
          content: sanInput,
          token_count: embeddingResponse.data.usage.total_tokens,
					embedding: responseData.embedding,
					section: i + 1,
          createdAt: existingPage?.createdAt || new Date(),
          updatedAt: new Date(),
        })
        .select()
        .limit(1)
				.single();

			if (insertPageSectionError) {
				error('upsertPageError', insertPageSectionError.code, insertPageSectionError.hint, insertPageSectionError.details);
        throw insertPageSectionError;
      }
    }
  } catch (err) {
    // TODO: decide how to better handle failed embeddings
    error(
      `Failed to generate embeddings for '${
        req.id
      }' page section starting with '${req.content.slice(0, 40)}...'`
    );
    error(err);

    throw err;
  }

  return true;
};
