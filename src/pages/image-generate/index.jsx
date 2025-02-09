import { useState } from 'react';
import ImageGenerations from './components/ImageGenerations';
import ImageInput from './components/ImageGenerateInput';
import { useGenerateImages } from '../../utils/image-generate';

function ImageGenerate() {
  const { generateImages, generationData, stop, loading } = useGenerateImages();
  const [isInputMode, setIsInputMode] = useState(true);

  return (
    <div className="pt-0 h-0 flex-1 flex flex-col pb-safe">
      <ImageInput
        isInputMode={isInputMode}
        setIsInputMode={setIsInputMode}
        loading={loading}
        startGenerate={generateImages}
        stop={stop}
      ></ImageInput>
      <div
        className={`flex-1 h-0 px-4 overflow-y-auto transition-all duration-300 ${
          isInputMode ? 'h-0' : ''
        }`}
      >
        <ImageGenerations generations={generationData} />
      </div>
      {/* {loading ? (
        <i
          onClick={stop}
          className="fixed z-40 bottom-16 left-0 right-0 mx-auto text-6xl cursor-pointer i-mingcute-stop-circle-fill"
        />
      ) : (
        <ImageInput startGenerate={generateImages}></ImageInput>
      )} */}
    </div>
  );
}

export default ImageGenerate;
