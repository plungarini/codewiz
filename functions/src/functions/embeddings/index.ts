import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { error, warn } from 'firebase-functions/logger';
import { Configuration, OpenAIApi } from 'openai';

const MAX_CHARS = 25_000;
const MIN_SECTION_LENGTH = 5;

const splitInput = (input: string): string[] => {
  const sections: string[] = [];
	let currentSection = '';

	const getSplitIndex = (s: string) => s.lastIndexOf('##') || s.lastIndexOf('======') || s.lastIndexOf('-------');

  while (input.length > 0) {
    const splitIndex = getSplitIndex(input);

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
		const splitIndex2 = getSplitIndex(section);
		if (section.length > MAX_CHARS) {
			if (splitIndex2 > 0) {
				sections.push(section.substring(0, splitIndex2), section.substring(splitIndex2));
				return;
			}
			warn(`Split index found? ${splitIndex2} - Length: ${section.length} - MAX_CHARS: ${MAX_CHARS}`);
			warn(section);
			throw new Error('One of the sections is too long.');
		}
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

const checkTableExists = async (supabase: SupabaseClient, tableName: string) => {
  const { data, error } = await supabase
    .from(tableName)
		.select('id')
		.limit(1);

	if (error && error.code === '42P01') {
		return false;
	} else {
		return data?.length || -1 > 0;
	}
};


export const elaborateEmbeddings = async (req: {
	author: string;
  title: string;
	link: string;
  content: string;
  id: string;
}) => {
  const supabasePublicUrl = process.env.SUPABASE_PUBLIC_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_KEY;
	const email = process.env.SUPABASE_ADMIN_EMAIL;
	const password = process.env.SUPABASE_ADMIN_PASSW;

  if (!supabasePublicUrl || !supabaseServiceRoleKey || !openaiKey || !email || !password) {
    return error(
      'Environment variables SUPABASE_PUBLIC_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_KEY, ADMIN_EMAIL and ADMIN_PASSW are required: skipping embeddings generation'
    );
	}

	const author = req.author.split('/').pop();
	if (!author) throw new Error(`Author field is required. Currently it's ${author}`);

	const supabase = createClient(supabasePublicUrl, supabaseServiceRoleKey);


	/*
	// Sign up
	const signup = await supabase.auth.signUp({ email, password });
	warn('User signed up:', signup.data.user);
	if (signup.error || !signup.data.user) {
		error(signup.error);
		throw signup.error;
	} */

	/*

	// Sign in to the admin account
	const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

	if (signInError) {
		error('signInError', signInError.cause, signInError.message, signInError.name);
		throw signInError;
	}

	*/

	const tableExists = await checkTableExists(supabase, author);
	if (!tableExists) {
		const { error: err } = await supabase.rpc('create_embeddings_table', { author });
		if (err) {
			error(err);
			throw new Error('Error in create_embeddings_table.');
		}
	}

	try {
    const configuration = new Configuration({ apiKey: openaiKey });
    const openai = new OpenAIApi(configuration);
		warn('Configuring OpenAI - COMPLETED');

    const sanitizedInput = openAiTokenSanitizer(req.content);

		for (let i = 0; i < sanitizedInput.length; i++) {
			const normInput = sanitizedInput[i];

      // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
      const sanInput = normInput.replace(/\n/g, ' ');

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
        .from(author)
        .upsert({
          id:
            sanitizedInput.length < 2
              ? `${req.id}[1]`
              : `${req.id}[${i + 1}]`,
					path: req.link,
					title: req.title,
          content: normInput,
          token_count: embeddingResponse.data.usage.total_tokens,
					embedding: responseData.embedding,
					section: i + 1,
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
