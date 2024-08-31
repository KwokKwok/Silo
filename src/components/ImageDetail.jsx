import React, { useRef } from 'react';
import { useState } from 'react';
import { forwardRef } from 'react';
import { ImageViewer } from 'tdesign-react';

const ImageDetail = ({}, ref) => {
  const [visible, setVisible] = useState(false);
  const [generation, setGeneration] = useState(null);
  React.useImperativeHandle(ref, () => ({
    open: generation => {
      setGeneration(generation);
      setVisible(true);
    },
  }));

  return (
    <div>
      <ImageViewer
        className="backdrop-blur-sm filter"
        visible={visible}
        images={generation?.images || []}
        onClose={() => setVisible(false)}
      />
    </div>
  );
};

export default forwardRef(ImageDetail);
