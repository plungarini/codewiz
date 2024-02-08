export const getMaxTokenCount = (model: string): number => {
  switch (model) {
    case 'gpt-3.5-turbo':
      console.warn(
        'Warning: gpt-3.5-turbo may change over time. Returning max num tokens assuming gpt-3.5-turbo-0125.'
      );
      return getMaxTokenCount('gpt-3.5-turbo-0125');
    case 'gpt-3.5-turbo-16k':
      console.warn(
        'Warning: gpt-3.5-turbo-16k may change over time. Returning max num tokens assuming gpt-3.5-turbo-16k-0613.'
      );
      return getMaxTokenCount('gpt-3.5-turbo-16k-0613');
    case 'gpt-4':
      console.warn(
        'Warning: gpt-4 may change over time. Returning max num tokens assuming gpt-4-0314.'
      );
      return getMaxTokenCount('gpt-4-0314');
    case 'gpt-3.5-turbo-0125':
      return 4097;
    case 'gpt-3.5-turbo-16k-0613':
      return 16385;
    case 'gpt-4-0613':
      return 8192;
    default:
      throw new Error(`Unknown model '${model}'`);
  }
};
