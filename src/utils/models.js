const textModelOf = (id, price, length) => ({ id, name: id.split('/')[1], series: id.split('/')[0], price, length })

const TEXT_MODEL_LIST = [
  textModelOf("Qwen/Qwen2-7B-Instruct", 0, 32),
  textModelOf("Qwen/Qwen2-1.5B-Instruct", 0, 32),
  textModelOf("Qwen/Qwen1.5-7B-Chat", 0, 32),
  textModelOf("THUDM/glm-4-9b-chat", 0, 32),
  textModelOf("THUDM/chatglm3-6b", 0, 32),
  textModelOf("01-ai/Yi-1.5-9B-Chat-16K", 0, 16),
  textModelOf("01-ai/Yi-1.5-6B-Chat", 0, 4),
  textModelOf("google/gemma-2-9b-it", 0, 8,),
  textModelOf("internlm/internlm2_5-7b-chat", 0, 32),
  textModelOf("meta-llama/Meta-Llama-3-8B-Instruct", 0, 8),
  textModelOf("meta-llama/Meta-Llama-3.1-8B-Instruct", 0, 8),
  textModelOf("mistralai/Mistral-7B-Instruct-v0.2", 0, 32),
  textModelOf("Qwen/Qwen2-72B-Instruct", 4.13, 32),
  textModelOf("Qwen/Qwen2-Math-72B-Instruct", 4.13, 32),
  textModelOf("Qwen/Qwen2-57B-A14B-Instruct", 1.26, 32),
  textModelOf("Qwen/Qwen1.5-110B-Chat", 4.13, 32),
  textModelOf("Qwen/Qwen1.5-32B-Chat", 1.26, 32),
  textModelOf("Qwen/Qwen1.5-14B-Chat", 0.70, 32),
  textModelOf("01-ai/Yi-1.5-34B-Chat-16K", 1.26, 16),
  textModelOf("deepseek-ai/DeepSeek-Coder-V2-Instruct", 1.33, 32),
  textModelOf("deepseek-ai/DeepSeek-V2-Chat", 1.33, 32),
  textModelOf("deepseek-ai/deepseek-llm-67b-chat", 1, 4),
  textModelOf("internlm/internlm2_5-20b-chat", 32, 1),
  textModelOf("meta-llama/Meta-Llama-3.1-405B-Instruct", 21, 32),
  textModelOf("meta-llama/Meta-Llama-3.1-70B-Instruct", 4.13, 32),
  textModelOf("meta-llama/Meta-Llama-3-70B-Instruct", 4.13, 32),
  textModelOf("mistralai/Mixtral-8x7B-Instruct-v0.1", 1.26, 32),
  textModelOf("google/gemma-2-27b-it", 1.26, 8),
]

export default TEXT_MODEL_LIST