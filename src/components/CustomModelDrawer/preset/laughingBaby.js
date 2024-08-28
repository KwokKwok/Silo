async function laughingBabyChat (modelId, messages, options, controller, onChunk, onEnd, onError) {
  /**
   * @param {String} modelId 填写的模型ID，比如 Silo/Laughing-Baby-16K
   * @param {Array} messages 数组形式。请转换为对应模型的消息格式
      [
          {
              "role": "user",
              "content": "你好"
          },
          {
              "role": "assistant",
              "content": "你好！请问你今天想聊些什么呢？"
          },
          {
              "role": "user",
              "content": "你是谁？"
          }
      ]
  * @param {Object} options 对象形式。用户调整的请求参数，需要将字段转换为对应自定义模型的字段 
      {
          "max_tokens": 512,
          "temperature": 1,
          "top_p": 0.7,
          "frequency_penalty": 0
      }
  * @param {Object} controller 请求控制器 Ref。 controller.current  为  AbortController ，一般将  controller.current.signal  传入请求中用于中断请求。用户停止后  controller.current  也会置空，可用来判断是否要继续处理消息。
  * @param {Function} onChunk  (content: String) => void  分块响应数据。如只有一块也可以仅调用一次。
  * @param {Function} onEnd  () => void ，标识结束。
  * @param {Function} onError  (err:Error) => void ，向外部传递错误。
  * @returns 
  */

  // 实际处理函数

  // 根据模型 ID 解析出 16 或 32，如 Silo/Laughing-Baby-16K 即 16
  const laughingTimes = parseInt(modelId.replace('Silo/Laughing-Baby-', ''));
  // 随机报错，模拟请求报错
  if (Math.random() > 0.8) {
    onError(new Error('宝宝去别的地方玩了'))
    return;
  }
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  let count = 0;
  // 按模型 ID 解析出的次数，模拟流式对话
  while (count++ < laughingTimes) {
    await wait(Math.random() * 32);
    onChunk('😁😁😁');
  }
  // 结束
  onEnd();
}