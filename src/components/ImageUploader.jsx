import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Upload } from 'tdesign-react';

const ImageUploader = forwardRef(({ onUpload, className }, ref) => {
  const [files, setFiles] = useState([]);

  const handleChange = files => {
    setFiles(files);
    if (files.length > 0 && files[0].raw) {
      const reader = new FileReader();
      reader.onload = e => {
        const base64 = e.target.result;
        onUpload(base64);
      };
      reader.readAsDataURL(files[0].raw);
    }
  };

  const clear = () => {
    setFiles([]);
  };

  useImperativeHandle(ref, () => ({
    clear,
  }));

  return (
    <Upload
      files={files}
      onChange={handleChange}
      theme="custom"
      onRemove={() => onUpload(null)}
      accept="image/*"
      autoUpload={false}
      multiple={false}
      className={'w-6 h-6 flex items-center justify-center ' + className}
    >
      <i className="i-mingcute-upload-2-line opacity-30 hover:opacity-100 transition-opacity duration-300 leading-6 w-5 h-5 !block cursor-pointer" />
    </Upload>
  );
});

export default ImageUploader;
