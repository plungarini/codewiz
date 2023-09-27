import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { Tiktoken } from 'tiktoken/lite';
import cl100k_base = require('tiktoken/encoders/cl100k_base.json');

export const tokenizer = new Tiktoken(
  cl100k_base.bpe_ranks,
  cl100k_base.special_tokens,
  cl100k_base.pat_str
);

export const getChatRequestTokenCount = (
  messages: ChatCompletionMessageParam[],
  model = 'gpt-3.5-turbo-0613'
): number => {
  const tokensPerRequest = 3; // every reply is primed with <|im_start|>assistant<|im_sep|>
  const numTokens = messages.reduce((acc, message) => acc + getMessageTokenCount(message, model), 0);

  return numTokens + tokensPerRequest;
};

export const getMessageTokenCount = (
  message: ChatCompletionMessageParam,
  model = 'gpt-3.5-turbo-0613'
): number => {
  let tokensPerMessage: number;
  let tokensPerName: number;

  switch (model) {
    case 'gpt-3.5-turbo':
      console.warn(
        'Warning: gpt-3.5-turbo may change over time. Returning num tokens assuming gpt-3.5-turbo-0613.'
      );
      return getMessageTokenCount(message, 'gpt-3.5-turbo-0613');
    case 'gpt-4':
      console.warn('Warning: gpt-4 may change over time. Returning num tokens assuming gpt-4-0314.');
      return getMessageTokenCount(message, 'gpt-4-0314');
    case 'gpt-3.5-turbo-0613':
      tokensPerMessage = 4; // every message follows <|start|>{role/name}\n{content}<|end|>\n
      tokensPerName = -1; // if there's a name, the role is omitted
      break;
    case 'gpt-4-0314':
      tokensPerMessage = 3;
      tokensPerName = 1;
      break;
    default:
      throw new Error(
        `Unknown model '${model}'. See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens.`
      );
  }

  return Object.entries(message).reduce((acc, [key, value]) => {
    acc += tokenizer.encode(value).length;
    if (key === 'name') {
      acc += tokensPerName;
    }
    return acc;
  }, tokensPerMessage);
};

export const getMaxTokenCount = (model: string): number => {
  switch (model) {
    case 'gpt-3.5-turbo':
      console.warn(
        'Warning: gpt-3.5-turbo may change over time. Returning max num tokens assuming gpt-3.5-turbo-0613.'
      );
      return getMaxTokenCount('gpt-3.5-turbo-0613');
    case 'gpt-4':
      console.warn(
        'Warning: gpt-4 may change over time. Returning max num tokens assuming gpt-4-0314.'
      );
      return getMaxTokenCount('gpt-4-0314');
    case 'gpt-3.5-turbo-0613':
      return 4097;
    case 'gpt-4-0314':
      return 4097;
    default:
      throw new Error(`Unknown model '${model}'`);
  }
};
