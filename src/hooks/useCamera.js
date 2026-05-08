import { useCallback, useRef } from 'react';

const useCamera = () => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  }, [webcamRef]);

  return { webcamRef, capture };
};

export default useCamera;
