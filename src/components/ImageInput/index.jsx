import React, { useState, useEffect } from 'react';
import UserInput from './UserInput';
import ModelChoose from './ModelChoose/index';
import { useLocalStorageJSONAtom } from '../../store/storage';
import { getImageGenerateOptions } from '../../utils/options/image-options';
import { Tag } from 'tdesign-react';
import { useIsMobile } from '../../utils/use';
import DrawPlaceholder from '../../assets/img/draw.svg';
import { LOCAL_STORAGE_KEY } from '@src/utils/types';

function ImageInput({
  className,
  startGenerate,
  loading,
  isInputMode,
  setIsInputMode,
  stop,
}) {
  const [prompts, setPrompts] = useState(['']);
  const [isUserInputComplete, setIsUserInputComplete] = useState(false);
  const [activeImageModels] = useLocalStorageJSONAtom(
    LOCAL_STORAGE_KEY.ACTIVE_IMAGE_MODELS
  );
  const isMobile = useIsMobile();
  const [showModelChoose, setShowModelChoose] = useState(false);

  const onPromptDone = () => {
    if (isMobile) {
      setShowModelChoose(prevState => !prevState);
    } else {
      setIsUserInputComplete(prevState => !prevState);
    }
  };

  const onGenerate = () => {
    setIsInputMode(false);
    startGenerate(
      prompts.filter(item => item.trim()),
      activeImageModels,
      getImageGenerateOptions()
    );
  };

  useEffect(() => {
    const handleScroll = event => {
      if (!prompts[0].trim().length) return;
      if (event.deltaY > 0 && !isUserInputComplete) {
        setIsUserInputComplete(true);
      } else if (event.deltaY < 0 && isUserInputComplete) {
        setIsUserInputComplete(false);
      }
    };

    window.addEventListener('wheel', handleScroll);

    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [isUserInputComplete]);

  if (!isInputMode) {
    return (
      <div className="flex flex-col my-2 w-full px-4 ">
        <span className="flex items-center text-xl">
          <span className="mr-2">{prompts[0]} </span>
          {loading ? (
            <i
              onClick={stop}
              className="cursor-pointer i-mingcute-stop-circle-fill animate-pulse"
            />
          ) : (
            <i
              onClick={() => setIsInputMode(true)}
              className=" iconify mingcute--edit-line cursor-pointer "
            />
          )}
        </span>
        <div className="flex flex-wrap items-center mb-4">
          {activeImageModels.map(item => (
            <Tag
              key={item}
              className="mr-2 mt-2 last:mr-0"
              content={item.split('/')[1]}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        className={`w-full flex flex-col justify-end items-center pb-4 h-full max-w-[760px] mx-auto ${className}`}
      >
        {!showModelChoose && (
          <div className="flex-1 items-center justify-center flex">
            <img
              src={DrawPlaceholder}
              className="h-full max-h-[33dvw]"
              alt=""
            />
          </div>
        )}
        {!showModelChoose && (
          <div className="flex-shrink-0 w-full pb-4">
            <UserInput
              inputs={prompts}
              setInputs={setPrompts}
              onGenerate={onGenerate}
              onSubmit={onPromptDone}
            />
          </div>
        )}
        {showModelChoose && (
          <div className="mt-4 flex-1 px-4 overflow-auto">
            <ModelChoose
              onBack={() => setShowModelChoose(false)}
              onGenerate={onGenerate}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        'h-full w-full max-w-[760px] mx-auto relative overflow-hidden ' +
        className
      }
      style={{ perspective: '1000px' }}
    >
      <div
        className="flex flex-col items-center justify-center absolute inset-0 transition-all duration-500 ease-in-out"
        style={{
          transform: isUserInputComplete
            ? 'translateY(-60%) rotateX(45deg)'
            : 'translateY(0) rotateX(0deg)',
          transformOrigin: 'bottom',
          opacity: isUserInputComplete ? 0 : 1,
          pointerEvents: isUserInputComplete ? 'none' : 'auto',
        }}
      >
        <img src={DrawPlaceholder} className={'h-36 mb-4 '} alt="" />

        <UserInput
          inputs={prompts}
          setInputs={setPrompts}
          onGenerate={onGenerate}
          onSubmit={onPromptDone}
        />
      </div>
      <div
        className="flex flex-col items-center justify-center absolute inset-0 transition-all duration-500 ease-in-out"
        style={{
          transform: isUserInputComplete
            ? 'translateY(0) rotateX(0deg)'
            : 'translateY(60%) rotateX(-45deg)',
          transformOrigin: 'top',
          opacity: isUserInputComplete ? 1 : 0,
          pointerEvents: isUserInputComplete ? 'auto' : 'none',
        }}
      >
        <ModelChoose
          onBack={() => setIsUserInputComplete(false)}
          onGenerate={onGenerate}
        />
      </div>
    </div>
  );
}

export default ImageInput;
