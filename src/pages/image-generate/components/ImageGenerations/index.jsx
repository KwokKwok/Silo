import React, { useRef, useEffect, useState } from 'react';
import { getImageModels } from '@src/utils/models';
import FailedImg from '@src/assets/img/failed.svg';
import ImageDetail from './ImageDetail';
import Masonry from 'react-masonry-css';
import { useTranslation } from 'react-i18next';

const _allImagesModels = getImageModels();
const models = _allImagesModels.reduce(
  (result, cur) => ({ ...result, [cur.id]: cur }),
  {}
);

function ImageGenerations({ generations }) {
  const { t } = useTranslation();
  const detailRef = useRef();
  const [visibleGenerations, setVisibleGenerations] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleGenerations(prev => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    generations.forEach((_, index) => {
      const element = document.querySelector(`[data-index="${index}"]`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [generations]);

  const breakpointColumnsObj = {
    default: 5,
    1400: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {generations.map((generation, index) => (
          <div
            key={generation.prompt + generation.model}
            data-index={index}
            title={generation.prompt}
            onClick={() => detailRef.current.open(generation)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative cursor-pointer mb-4"
          >
            {visibleGenerations.includes(index) && (
              <>
                {generation.loading ? (
                  <div
                    className="w-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center"
                    style={{
                      aspectRatio: generation.modelOptions.image_size
                        .split('x')
                        .reduce((a, b) => a / b),
                    }}
                  >
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('image_generations.generating')}
                    </p>
                  </div>
                ) : generation.error ? (
                  <div
                    className="w-full flex items-center justify-center"
                    style={{
                      aspectRatio: generation.modelOptions.image_size
                        .split('x')
                        .reduce((a, b) => a / b),
                    }}
                  >
                    <p className="h-full flex flex-col items-center text-center py-10 dark:text-red-300 text-red-700">
                      <img
                        src={FailedImg}
                        className="flex-1 h-0 mb-4"
                        alt={t('image_generations.generation_failed')}
                      />
                      <span className="text-sm flex-shrink-0 mb-2">
                        {t('image_generations.generation_failed')}
                      </span>
                      <span className="px-4 text-xs flex-shrink-0">
                        {t(generation.error)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div
                    className="relative group"
                    style={{
                      aspectRatio: generation.modelOptions.image_size
                        .split('x')
                        .reduce((a, b) => a / b),
                    }}
                  >
                    {generation.images.length > 0 && (
                      <>
                        <img
                          src={generation.images[0]}
                          alt={`Generated image for prompt: ${generation.prompt}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-lg flex flex-col items-center">
                            <i className="iconify mingcute--eye-2-line w-6 h-6 mb-2" />
                            <span>
                              {t('image_generations.click_to_preview')}
                            </span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="absolute top-1 right-1 flex items-center space-x-2">
                  {models[generation.model] && (
                    <div className="bg-white dark:bg-black bg-opacity-60 dark:bg-opacity-60  backdrop-blur-sm text-black dark:text-white pl-1 pr-2 py-1 rounded flex items-center">
                      <div className="w-4 h-4 mr-1 bg-white rounded-sm flex items-center justify-center p-[2px]">
                        <img
                          alt={generation.model}
                          className="h-[14px]"
                          src={models[generation.model].icon}
                        />
                      </div>
                      <span className="text-xs">
                        {models[generation.model].isPro ? 'Pro/' : ''}
                        {models[generation.model].name}
                      </span>
                    </div>
                  )}
                  {generation.images.length > 1 && (
                    <div className="bg-black bg-opacity-50 backdrop-blur-sm text-white px-2 py-1 rounded flex items-center">
                      <span className="text-xs">
                        {generation.images.length} P
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={
                    'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-800 transition-opacity duration-500 to-transparent px-2 pt-4 pb-2 ' +
                    (generation.loading || generation.error
                      ? 'opacity-0'
                      : 'opacity-90')
                  }
                >
                  <p className="text-xs text-white truncate">
                    {generation.prompt}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
      </Masonry>
      <ImageDetail ref={detailRef} />
    </>
  );
}

export default ImageGenerations;
