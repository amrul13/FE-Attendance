import { useState, useRef, useEffect } from "react";

interface CameraHook {
  videoRef: React.RefObject<HTMLVideoElement|null>;
  cameraError: string | null;
  isCameraActive: boolean;
}

export const useCamera = (): CameraHook => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Tunggu metadata sebelum play()
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((err) => {
              console.warn("Play error:", err);
            });
          };
        }

        setIsCameraActive(true);
        setCameraError(null);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Tidak dapat mengakses kamera!");
        setIsCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { videoRef, cameraError, isCameraActive };
};
