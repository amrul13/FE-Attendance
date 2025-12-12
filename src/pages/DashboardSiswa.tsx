import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Mic, Download, X, Square, AlertTriangle } from "lucide-react";

import { useCamera } from "../components/UseCamera";
import { useVoiceRecording } from "../components/UseVoiceRecording";
import { useFaceRecognition } from "@/components/useFaceRecognition";

import { ResultModal } from "../components/ResultModal";
import { VerificationVocabList } from "../components/VerificationVocabList";


// Tambahkan definisi tipe Vocab di sini atau di file terpisah
type Vocab = {
  id: number;
  word: string;
  meaning: string;
};

const normalize = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function SmartAttendance() {
  // --- 1. Custom Hooks ---
  const { videoRef, cameraError, isCameraActive } = useCamera();
  const { recognize, faceResult, isRecognizing } = useFaceRecognition(videoRef);


  const {
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
  } = useVoiceRecording();

  const [vocabList, setVocabList] = useState<Vocab[]>([]);
  const [loadingVocab, setLoadingVocab] = useState(true);

  const [searchParams] = useSearchParams();
  const themeId = searchParams.get("theme");

  const isVerified = verificationResult?.success || false; // --- 3. Logika Fetch Data & Normalisasi ---

  useEffect(() => {
    async function fetchTheme() {
      setLoadingVocab(true);
      const baseUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
      
      try {
        // ASUMSI: Ganti dengan URL endpoint API yang sebenarnya
        const res = await fetch(
          `${baseUrl}/vocabularies/theme/${themeId}`
        );
        const data = await res.json();
        const vocabsWithNormalization = (data || []).map((v: Vocab) => ({
          ...v,
          wordNormalized: normalize(v.word),
        }));
        setVocabList(vocabsWithNormalization);
      } catch (error) {
        console.error("Fetch error:", error);
        setVocabList([]);
      } finally {
        setLoadingVocab(false);
      }
    }

    if (themeId) fetchTheme();
  }, [themeId]); // --- 4. Handler Utama ---

  useEffect(() => {
    if (!isCameraActive) return;

    let timer: number;

    const loop = async () => {
      await recognize();

      // Tentukan interval berdasarkan hasil
      const delay =
        faceResult && faceResult.includes("✅")
          ? 5000 // wajah dikenali → 5 detik
          : 2000; // wajah tidak dikenali → 2 detik

      timer = window.setTimeout(loop, delay);
    };

    loop(); // mulai loop

    return () => clearTimeout(timer);
  }, [isCameraActive, recognize, faceResult]);

  const handleRecordClick = () => {
    // PERBAIKAN: Hapus pemeriksaan attemptsLeft
    if (isVerified) return;

    if (isRecording) {
      if (recordingTime < 1) {
        // Jika perekaman terlalu singkat, hentikan dan tampilkan error
        setVerificationResult({
          success: false,
          message: "Perekaman terlalu singkat (minimum 1 detik).",
          recognizedWord: null,
          nextInSeconds: null,
        });
        deleteRecording(); // Hapus rekaman jika terlalu singkat
      } else {
        stopRecording();
      }
    } else {
      // Mulai perekaman
      startRecording(vocabList as any);
    }
  };
  const handleModalClose = () => {
    // Jika sukses, hanya tutup modal dan biarkan state verifikasi tetap true
    if (verificationResult?.success) {
      setVerificationResult(null);
      return;
    } // Jika gagal, hapus rekaman, dan tutup modal untuk mencoba lagi
    deleteRecording();
    setVerificationResult(null);
  };

  return (
    <div className="min-h-screen from-gray-50 to-gray-100 flex flex-col">
      
      {/* Inject CSS Keyframes untuk Modal (Opsional, lebih baik di root CSS) */}
      
      <style>{`@keyframes progress{from{width:100%}to{width:0%}}@keyframes shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-5px)}20%,40%,60%,80%{transform:translateX(5px)}}.animate-shake{animation:shake .82s cubic-bezier(.36,.07,.19,.97) both}.animate-pulse-once{animation:pulse-once 1.5s ease-out 1}@keyframes pulse-once{0%{transform:scale(.9);opacity:.7}50%{transform:scale(1);opacity:1}100%{transform:scale(1);opacity:1}}`}</style>
      {/* Component: Modal Hasil Verifikasi */}
      
      <ResultModal result={verificationResult} onClose={handleModalClose} />
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        {/* ... (Header UI yang sama) */}
        <h1 className="text-xl font-semibold text-gray-800">
          Smart Attendance 
        </h1>
        
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-wrap lg:flex-nowrap gap-12 items-start justify-center p-8 max-w-7xl mx-auto w-full">
        {/* Kiri: Camera Recognition */}
        <div className="flex-1 min-w-[300px] max-w-lg">
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Camera Recognition  
          </h2>
          
          <div className="w-full aspect-video bg-gray-300 rounded-2xl shadow-lg flex items-center justify-center mb-4 overflow-hidden relative">
            
            {cameraError ? (
              <div className="text-center p-4">
                
                <AlertTriangle className="w-20 h-20 text-red-400" />
                <p className="mt-4 text-red-600 text-sm">{cameraError}</p>
                
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}
            
            {faceResult && (
              <div
                className={`absolute bottom-2 left-2 right-2 p-2 text-white text-center text-sm font-medium rounded-lg ${faceResult.includes("dikenali")
                    ? "bg-green-500 bg-opacity-80"
                    : "bg-red-500 bg-opacity-80"
                  }`}
              >
                {faceResult} 
                {isRecognizing ? "(Mengecek...)" : ""} 
              </div>
            )}
            
          </div>
          
        </div>
        {/* Tengah: Voice Recording */}
        <div className="flex-1 flex flex-col items-center min-w-[300px] max-w-lg">
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Voice Recording 
          </h2>
          {/* HAPUS: Tampilan Attempts Left */}
          
          <p className="text-gray-600 text-center text-sm mb-4">
            Rekam ucapan Anda selama {formatTime(5)} detik.
            
          </p>
          
          {recordingError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center max-w-xs">
              {recordingError}
            </div>
          )}
          
          {isRecording && (
            <div className="mb-4 text-2xl font-bold text-blue-600">
              {formatTime(recordingTime)} 
              <span className="text-sm text-gray-500">/ {formatTime(5)}</span>
              
            </div>
          )}
          
          <button
            onClick={handleRecordClick}
            disabled={
              // PERBAIKAN: Hapus pemeriksaan attemptsLeft
              isVerified || isTranscribing
            }
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={`relative w-40 h-40 rounded-full transition-all duration-300 ${isVerified || isTranscribing
                ? "bg-gray-400 cursor-not-allowed"
                : isRecording
                  ? "bg-red-500 scale-95 shadow-xl hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl"
              }`}
          >
            
            <div
              className={`absolute inset-0 rounded-full ${isRecording ? "animate-ping bg-red-400 opacity-75" : ""
                }`}
            ></div>
            
            <div className="relative w-full h-full flex items-center justify-center">
              
              {isRecording ? (
                <Square className="w-14 h-14 text-white" fill="white" />
              ) : (
                <Mic className="w-16 h-16 text-white" strokeWidth={2} />
              )}
              
            </div>
            
          </button>
          {/* Tampilkan hasil rekaman dan transkripsi */}
          {audioURL && !isRecording && (
            <div className="mt-6 w-full max-w-sm space-y-3">
              
              <div className="bg-white rounded-lg shadow-md p-4">
                
                <audio src={audioURL} controls className="w-full" />
                
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
                
                <h4 className="font-semibold text-gray-700">
                  Hasil Transkripsi:  
                </h4>
                
                {isTranscribing ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    
                    <span className="text-sm italic">
                      Mentranskripsi & Verifikasi...
                      
                    </span>
                    
                  </div>
                ) : transcriptionError ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    
                    <span className="text-sm">{transcriptionError}</span>
                    
                  </div>
                ) : transcriptionResult ? (
                  <p className="text-gray-800 italic text-lg font-medium">
                    "{transcriptionResult}"
                    
                  </p>
                ) : (
                  <p className="text-gray-500 italic text-sm">
                    Menunggu hasil transkripsi...
                    
                  </p>
                )}
                
              </div>
              
              <div className="flex gap-2">
                
                <button
                  onClick={downloadAudio}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download className="w-5 h-5" /> Download
                  
                </button>
                
                <button
                  onClick={deleteRecording}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" /> Hapus
                  
                </button>
                
              </div>
              
            </div>
          )}
          
        </div>
        {/* Kanan: Verification Vocab List */}
        <div className="min-w-[300px] max-w-sm">
          
          <VerificationVocabList
            themeId={themeId}
            vocabList={vocabList}
            loading={loadingVocab}
          />
          
        </div>
        
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center">
        
        <p className="text-gray-500 text-sm">
          © 2024 Smart Attendance. All rights reserved. 
        </p>
        
      </footer>
      
    </div>
  );
}
