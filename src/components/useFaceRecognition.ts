import { useRef, useState, useCallback } from "react";

export const useFaceRecognition = (
  videoRef: React.RefObject<HTMLVideoElement| null>
) => {
  const [faceResult, setFaceResult] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
    const recognizingRef = useRef(false);
    

  const recognize = useCallback(async () => {
    if (!videoRef.current) return;
    if (recognizingRef.current) return; 

    recognizingRef.current = true;
    setIsRecognizing(true);

    const video = videoRef.current;

    // Buat canvas temporer
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0);

    // Convert ke Blob
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    if (!blob) {
      recognizingRef.current = false;
      setIsRecognizing(false);
      return;
    }

    // Prepare data
    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    const baseUrl = `${window.location.protocol}//${window.location.hostname}:8000`;

    try {
      const response = await fetch(`${baseUrl}/face_recognition/`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.recognized === true) {
        setFaceResult(`Wajah dikenali: ${result.name} ✅`);
      } else {
        setFaceResult("Wajah tidak dikenali ❌");
      }
    } catch (err) {
      console.error("Error recognize:", err);
      setFaceResult("Gagal terhubung ke server ⚠️");
    }

    recognizingRef.current = false;
    setIsRecognizing(false);
  }, [videoRef]);

  return { recognize, faceResult, isRecognizing };
};
