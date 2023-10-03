import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { error, warn } from 'firebase-functions/logger';
import OpenAI from 'openai';

const MAX_CHARS = 25_000;
const MIN_SECTION_LENGTH = 100;

const openAiTokenSanitizer = (input: string): string[] => {
  const sections: string[] = [];
  const lines = input.split('\n');
  let currentSection = '';

  const pushCurrentSection = () => {
    if (currentSection.length > 0) {
      sections.push(currentSection.trim());
      currentSection = '';
    }
  };

  for (const element of lines) {
    const line = element.trim();

    if (
      (line.startsWith('#') || line.startsWith('======') || line.startsWith('-------')) &&
      currentSection.length >= MIN_SECTION_LENGTH &&
      currentSection.length <= MAX_CHARS
    ) {
      pushCurrentSection();
      currentSection += line;
    } else if (currentSection.length + line.length <= MAX_CHARS) {
      currentSection += '\n' + line;
    } else {
      let breakIndex = -1;

      if (currentSection.lastIndexOf('#') !== -1) {
        breakIndex = currentSection.lastIndexOf('#');
      } else if (currentSection.lastIndexOf('=====') !== -1) {
        breakIndex = currentSection.lastIndexOf('=====');
      } else if (currentSection.lastIndexOf('---') !== -1) {
        breakIndex = currentSection.lastIndexOf('---');
      } else if (currentSection.lastIndexOf('\n') !== -1) {
        breakIndex = currentSection.lastIndexOf('\n');
      }

      if (breakIndex !== -1 && breakIndex >= MIN_SECTION_LENGTH) {
        sections.push(currentSection.substring(0, breakIndex).trim());
        currentSection = currentSection.substring(breakIndex).trim();
      } else {
        sections.push(currentSection.trim());
        currentSection = line;
      }
    }
  }

  pushCurrentSection();

	sections.forEach((section) => {
		if (section.length > MAX_CHARS) {
			throw new Error('One of the sections is too long.');
		}
  });

  warn('Sections:', sections.length, sections.map((v, i) => `[Section ${i + 1}: ${v.length} chars]`));
  return sections;
};

const checkTableExists = async (supabase: SupabaseClient, tableName: string) => {
	warn('Checking if table exists...', tableName);
  const { data, error } = await supabase
    .from(tableName)
		.select('id')
		.limit(1);

	if (error && error.code === '42P01') {
		return false;
	} else {
		return !!data;
	}
};

export const elaborateEmbeddings = async (req: {
	author: string;
	table: string;
  title: string;
	link: string;
  content: string;
  id: string;
}) => {
  const supabasePublicUrl = process.env.SUPABASE_PUBLIC_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_KEY;
  const openaiOrg = process.env.OPENAI_ORG;
	const email = process.env.SUPABASE_ADMIN_EMAIL;
	const password = process.env.SUPABASE_ADMIN_PASSW;

  if (!supabasePublicUrl || !supabaseServiceRoleKey || !openaiKey || !email || !password) {
    return error(
      'Environment variables SUPABASE_PUBLIC_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_KEY, ADMIN_EMAIL and ADMIN_PASSW are required: skipping embeddings generation'
    );
	}

	const author = req.author.split('/').pop()?.replaceAll('.', '') ?? req.table;
	if (!author) throw new Error(`Author field is required. Currently it's ${author}, original is ${req.author}`);

	const supabase = createClient(supabasePublicUrl, supabaseServiceRoleKey);

	const tableExists = await checkTableExists(supabase, req.table || author);
	if (!tableExists) {
		const { error: err } = await supabase.rpc('create_embeddings_table', { author: req.table || author });
		if (err) {
			error(err);
			throw new Error('Error in create_embeddings_table.');
		}
	}

	try {
    const openai = new OpenAI({
			apiKey: openaiKey,
			organization: openaiOrg,
			maxRetries: 2,
			timeout: (540 / 2) * 1000,
		});
		warn('Configuring OpenAI - COMPLETED');

    const sanitizedInput = openAiTokenSanitizer(req.content);

		for (let i = 0; i < sanitizedInput.length; i++) {
			const normInput = sanitizedInput[i];

      // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
			const sanInput = normInput.replace(/\n/g, ' ');

			const inputId = sanitizedInput.length < 2
				? `${req.id}[1]`
				: `${req.id}[${i + 1}]`;

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: sanInput,
			});

      const [responseData] = embeddingResponse.data;

      const { error: insertPageSectionError } = await supabase
        .from(req.table || author)
        .upsert({
          id: inputId,
					path: req.link,
					title: req.title,
          content: normInput,
          token_count: embeddingResponse.usage.total_tokens,
					embedding: responseData.embedding,
					section: i + 1,
          updatedAt: new Date(),
        })
        .select()
        .limit(1)
				.single();

			if (insertPageSectionError) {
				error('insertPageSectionError', insertPageSectionError.code, insertPageSectionError.hint, insertPageSectionError.details);
        throw insertPageSectionError;
      }
    }
  } catch (err) {
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

export const getAllEmbeddings = async (repo: string) => {
	const supabasePublicUrl = process.env.SUPABASE_PUBLIC_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabasePublicUrl || !supabaseServiceRoleKey) {
    return error(
      'Environment variables SUPABASE_PUBLIC_URL or SUPABASE_SERVICE_ROLE_KEY are required: cannot get embeddings'
    );
	}

	if (!repo) throw new Error(`A repo must be specified, currently is ${JSON.stringify(repo)}`);

	const supabase = createClient(supabasePublicUrl, supabaseServiceRoleKey);

	const { data, error: err } = await supabase.from(repo).select('id, createdAt, updatedAt, title, token_count, path, section');
	if (err) throw err;
	console.log(data);
	return data;
};
