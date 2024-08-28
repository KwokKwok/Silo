export function createOpenAICompatibleRequestOptions (sk, model, messages, options = {}) {
  return {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${sk}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      // max_tokens: 4096,
      // temperature: 0.7,
      // top_p: 0.7,
      // top_k: 50,
      // frequency_penalty: 0.5,
      // n: 1
      ...options,
    })
  }
}