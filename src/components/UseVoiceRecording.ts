// src/hooks/useVoiceRecording.ts

import { useState, useRef, useCallback } from "react";
import type { VerificationResult } from "../components/ResultModal";

const MAX_RECORDING_TIME = 5;
const PREFERRED_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm"];

interface Vocab {
  id: number;
  word: string;
  meaning: string;
  wordNormalized: string;
}

interface VoiceRecordingHook {
  isRecording: boolean;
  recordingTime: number;
  audioURL: string | null;
  recordingError: string | null;
  isTranscribing: boolean;
  transcriptionResult: string | null;
  transcriptionError: string | null;
  startRecording: (normalizedVocabs: Vocab[]) => void;
  stopRecording: () => void;
  deleteRecording: () => void;
  downloadAudio: () => void;
  verificationResult: VerificationResult | null;
  setVerificationResult: React.Dispatch<
    React.SetStateAction<VerificationResult | null>
  >;
}

// const formatTime = (seconds: number) => {
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   return `${mins}:${secs.toString().padStart(2, "0")}`;
// };

const normalize = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const useVoiceRecording = (): VoiceRecordingHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(
    null
  );
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const vocabRefs = useRef<Vocab[]>([]); // Untuk menyimpan vocab saat recording dimulai

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStreamTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }; // --- Logika Verifikasi ---
  const verifyTranscription = useCallback((transcribedText: string) => {
    const normalizedTranscription = normalize(transcribedText);

    const matchedVocab = vocabRefs.current.find((v) =>
      normalizedTranscription.includes(v.wordNormalized)
    );

    if (matchedVocab) {
      setVerificationResult({
        success: true,
        message: "Anda berhasil mengucapkan kata verifikasi.",
        recognizedWord: matchedVocab.word,
        nextInSeconds: 5,
      });
    } else {
      setVerificationResult({
        success: false,
        message:
          "Kata yang diucapkan tidak cocok dengan tema. Silakan coba lagi.",
        recognizedWord: transcribedText || null,
        nextInSeconds: null,
      });
    }
  }, []); // --- Logika Transkripsi ---

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionResult(null);
    setTranscriptionError(null);
    setVerificationResult(null);

    const formData = new FormData();
    const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
    const extension = mimeType.includes("wav") ? "wav" : "webm";
    formData.append("file", audioBlob, `recording.${extension}`);
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
    const speechUrl = `${baseUrl}/speech_recognition/`;

    try {
      // ASUMSI: Ganti dengan URL endpoint API yang sebenarnya
      const response = await fetch(
        speechUrl,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

      const data = await response.json();
      const transcribedText = data.text || data.transcription || data;

      setTranscriptionResult(transcribedText);
      verifyTranscription(transcribedText);
    } catch (err) {
      console.error(err);
      setTranscriptionError("Gagal terhubung ke server transkripsi.");
      setVerificationResult({
        success: false,
        message: "Gagal terhubung ke server verifikasi. Silakan coba lagi.",
        recognizedWord: null,
        nextInSeconds: null,
      });
    } finally {
      setIsTranscribing(false);
    }
  }; // --- Kontrol Perekaman ---
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async (normalizedVocabs: Vocab[]) => {
    setRecordingError(null);
    setVerificationResult(null);
    setTranscriptionResult(null);
    setTranscriptionError(null);
    vocabRefs.current = normalizedVocabs; // Simpan vocab yang aktif

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = PREFERRED_MIME_TYPES.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      if (!mimeType)
        throw new Error(
          "Browser tidak mendukung format perekaman yang kompatibel."
        );

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        stopStreamTracks();
        setIsRecording(false);
        stopTimer();

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });
          setAudioURL(URL.createObjectURL(audioBlob));
          sendAudioForTranscription(audioBlob);
        } else {
          setRecordingError("Gagal merekam audio. Data kosong.");
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const nextTime = prev + 1;
          if (nextTime >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return nextTime;
        });
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      stopStreamTracks();
      setRecordingError(
        "Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin."
      );
      setIsRecording(false);
      stopTimer();
    }
  };
  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setRecordingTime(0);
    setRecordingError(null);
    setTranscriptionResult(null);
    setTranscriptionError(null);
    setIsTranscribing(false);
    setVerificationResult(null);
  };

  const downloadAudio = () => {
    if (audioURL && mediaRecorderRef.current) {
      const mimeType = mediaRecorderRef.current.mimeType;
      const extension = mimeType.includes("webm") ? "webm" : "dat"; // ... (Logika download yang sama)
      const a = document.createElement("a");
      a.href = audioURL;
      a.download = `attendance-recording-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return {
    isRecording,
    recordingTime,
    audioURL,
    recordingError,
    isTranscribing,
    transcriptionResult,
    transcriptionError,
    verificationResult,
    setVerificationResult,
    startRecording,
    stopRecording,
    deleteRecording,
    downloadAudio,
  };
};
