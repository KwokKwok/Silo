import { fmtBaseUrl } from '@src/utils/format';

export default async function claudeChat (modelConfig, modelId, messages, options, controller, onChunk, onEnd, onError) {
    let { apiKey = '', apiVersion, baseUrl } = modelConfig;
    if (!apiKey) {
        onError(new Error('请填写 API_KEY'))
        return;
    }
    const model = modelId.split('/')[1];
    const { max_tokens, temperature, top_p, frequency_penalty } = options;
    fetch(`${fmtBaseUrl(baseUrl)}/v1/messages`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': apiVersion
        },
        body: JSON.stringify({
            max_tokens, temperature, top_p,
            stream: true,
            messages,
            model,
        }),
        signal: controller.current.signal
    }).then(async response => {
        if (!response.body) {
            throw new Error('Stream not available');
        }
        if (response.status != '200') {
            const data = await response.json();
            try {
                const { type, message } = data.error;
                throw new Error(`[${type}] ${message}`)
            } catch (error) {
                throw new Error(JSON.stringify(data))
            }
        }
        return response.body; // 获取响应体的流
    })
        .then(stream => {
            const reader = stream.getReader(); // 创建一个读取器
            const decoder = new TextDecoder(); // 创建文本解码器

            // 读取流中的数据
            function read () {
                reader.read().then(({ done, value }) => {
                    if (!controller.current) return;
                    if (done) {
                        onEnd()
                        return;
                    }
                    const decodedData = decoder.decode(value); // 解码数据
                    const validStr = decodedData.slice(decodedData.indexOf('event: content_block_delta'), decodedData.indexOf('event: content_block_stop'));
                    const content = validStr.split(`event: content_block_delta\ndata: `).filter(item => item.trim()).map(item => JSON.parse(item)).map(message => message.delta.text).join('')
                    if (content) {
                        // 将本次拿到的 content 拼接到 streamingMessage 中
                        onChunk(content);
                    }
                    read(); // 递归读取下一块数据
                });
            }

            read(); // 开始读取流
        }).catch(err => {
            console.log(err);
            onError(err);
        })
}