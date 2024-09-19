import { useState, useEffect } from "react";
import { getSecretKey } from "../store/storage";
import { getJsonDataFromLocalStorage, setJsonDataToLocalStorage } from "./helpers";
import { LOCAL_STORAGE_KEY } from "./types";

// 模拟图片生成函数
async function mockImageGenerate (generation) {
  const { prompt, model, modelOptions, controller } = generation;
  return new Promise((resolve, reject) => {
    let isAborted = false;

    // 立即检查是否已被中止
    if (controller.signal.aborted) {
      reject(new Error('图片生成已取消'));
      return;
    }

    // 设置中止事件监听器
    const abortListener = () => {
      isAborted = true;
      reject(new Error('图片生成已取消'));
    };
    controller.signal.addEventListener('abort', abortListener);

    // 模拟生成过程
    const generateProcess = async () => {
      for (let i = 0; i < 10; i++) {
        if (isAborted) return; // 每次迭代检查是否被中止

        await new Promise(r => setTimeout(r, 100)); // 模拟每100ms的处理时间
      }

      if (isAborted) return; // 最后一次检查是否被中止

      const mockImage = {
        url: `https://picsum.photos/seed/${Math.random()}/512/512`,
        width: 512,
        height: 512
      };

      resolve({
        images: [mockImage],
        prompt: prompt,
        model: model
      });
    };

    generateProcess().finally(() => {
      // 清理中止事件监听器
      controller.signal.removeEventListener('abort', abortListener);
    });
  });
}





async function fetchImageGenerate (generation) {
  const { prompt, model, modelOptions, controller } = generation;
  // return mockImageGenerate(generation)

  const url = `https://api.siliconflow.cn/v1/image/generations`;
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${getSecretKey()}`
    },
    body: JSON.stringify({
      model,
      prompt,
      ...modelOptions
    }),
    signal: controller.signal
  };
  const res = await fetch(url, options);
  if (res.status != '200') {
    const data = await res.json();
    throw new Error(`${data.message}`)
  }
  return res.json()
}

export function useGenerateImages () {
  const [generationData, setGenerationData] = useState(getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.IMAGE_GENERATE_RECORDS, []));

  const generateImages = async (prompts, models, modelConfigs) => {
    const newGenerations = prompts.flatMap(prompt =>
      models.map(model => ({
        timestamp: Date.now(),
        prompt,
        model,
        modelOptions: modelConfigs[model],
        loading: true,
        error: null,
        images: [],
        controller: new AbortController()
      }))
    );

    // setGenerationData(prevData => [...prevData, ...newGenerations]);
    setGenerationData(prevData => [...newGenerations]);

    const requests = newGenerations.map(async (generation) => {
      try {
        const data = await fetchImageGenerate(generation);
        generation.images = data.images.map(item => item.url);
      } catch (error) {
        if (typeof error === 'string') {
          generation.error = error
        } else {
          generation.error = error.message;
        }
        console.error('图片生成失败:', error);
      }
      generation.loading = false;

      setGenerationData(prevData => {
        const updatedData = [...prevData];
        setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.IMAGE_GENERATE_RECORDS, updatedData)
        return updatedData;
      });
    });

    await Promise.all(requests);
  };

  const stop = () => {
    generationData.forEach(item => {
      console.log(item.controller);
      item.controller?.abort && item.controller?.abort('手动停止')
      setTimeout(() => {
        setGenerationData(prevData => prevData.filter(item => item.error?.message !== '手动停止'))
      }, 2000);
    }
    )
  }

  const loading = generationData.some(item => item.loading)

  return {
    loading,
    stop,
    generateImages,
    generationData,
  };
}