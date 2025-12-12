import { useEffect, useRef } from "react";
import { memo } from "react";


function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, []); // hanya sekali

  return <video ref={videoRef} autoPlay playsInline className="w-full" />;
}

export default memo(CameraView);
