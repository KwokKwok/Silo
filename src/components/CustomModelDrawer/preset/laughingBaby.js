async function laughingBabyChat (modelId, messages, options, controller, onChunk, onEnd, onError) {
    /**
     * @param {String} modelId Silo/Laughing-Baby-16K
     * @param {Array} messages Array, role and content
        [
            {
                "role": "user",
                "content": "Hello"
            },
            {
                "role": "assistant",
                "content": "Hello, how are you?"
            },
            {
                "role": "user",
                "content": "Who are you?"
            }
        ]
    * @param {Object} options
        {
            "max_tokens": 512,
            "temperature": 1,
            "top_p": 0.7,
            "frequency_penalty": 0
        }
    * @param {Object} controller {current: AbortController} `controller.current.abort()` will be used to interrupt request. and `controller.current = null` will be used to mark the request is finished.
    * @param {Function} onChunk  (content: String) => void
    * @param {Function} onEnd  () => void
    * @param {Function} onError  (err:Error) => void
    * @returns 
    */

    // Actual processing function

    // Parse out 16 or 32 based on the model ID, e.g., Silo/Laughing-Baby-16K is 16
    const laughingTimes = parseInt(modelId.replace('Silo/Laughing-Baby-', ''));
    // Randomly throw an error to simulate a request error
    if (Math.random() > 0.8) {
        onError(new Error('The baby went to play somewhere else'))
        return;
    }
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let count = 0;
    // Simulate streaming conversation based on the number of times parsed from the model ID
    while (count++ < laughingTimes) {
        await wait(Math.random() * 32);
        onChunk('😁😁😁');
    }
    // end
    onEnd();
}