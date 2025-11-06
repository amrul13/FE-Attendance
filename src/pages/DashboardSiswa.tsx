// --- TAMBAHAN/MODIFIKASI KAMERA ---
// Kita perlu 'useRef', 'useEffect', dan 'useCallback'
import { useState, useRef, useEffect, useCallback } from "react";
// --- AKHIR TAMBAHAN ---

import { Mic, Download, X, Square, AlertTriangle } from "lucide-react"; // Tambahkan AlertTriangle untuk error

const MAX_RECORDING_TIME = 5;

const PREFERRED_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm"];

export default function SmartAttendance() {
  // --- State & Ref untuk Audio ---
  const [isRecording, setIsRecording] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // --- TAMBAHAN TRANSKRIPSI ---
  // State untuk menyimpan hasil, status loading, dan error transkripsi
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(
    null
  );
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  // --- AKHIR TAMBAHAN ---

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Ini untuk Audio

  // --- TAMBAHAN/MODIFIKASI KAMERA ---
  // --- State & Ref untuk Video (Kamera) ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null); // Ref terpisah untuk stream video
  const [cameraError, setCameraError] = useState<string | null>(null);

  //untuk facerecognition
  const [faceResult, setFaceResult] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  // --- MODIFIKASI: Bungkus dengan useCallback ---
  // Kita bungkus fungsi ini dengan useCallback agar 'identity'-nya stabil
  // dan bisa digunakan di dalam useEffect.
  // Kita tambahkan 'isRecognizing' sebagai dependensi
  // agar 'if (isRecognizing) return;' selalu
  // mendapatkan nilai 'isRecognizing' yang terbaru.
  const captureAndSendFrame = useCallback(async () => {
    // Guard: Jangan lakukan apapun jika ref belum siap
    // ATAU jika proses pengenalan lain sedang berjalan.
    if (!videoRef.current || isRecognizing) return;

    setIsRecognizing(true); // Kunci prosesnya

    // Buat canvas sementara untuk mengambil frame video
    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    // Tambahkan cek jika video belum siap (width 0)
    if (!video.videoWidth || !video.videoHeight) {
      console.warn("Video dimensions not ready, skipping frame.");
      setIsRecognizing(false); // Lepas kunci
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsRecognizing(false); // Lepas kunci
      return;
    }

    // Gambar frame dari video
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Konversi ke blob (lebih efisien daripada base64)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    if (!blob) {
      setIsRecognizing(false); // Lepas kunci
      return;
    }

    // Kirim ke backend
    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      const response = await fetch("https://localhost:8000/face_recognition/", {
      // const response = await fetch("https://192.168.1.18:8000/face_recognition/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.recognized) {
        setFaceResult(`Wajah dikenali: ${result.name} ✅`);
      } else {
        setFaceResult("Wajah tidak dikenali ❌");
      }
    } catch (err) {
      console.error("Gagal mengirim frame:", err);
      setFaceResult("Gagal terhubung ke server ⚠️");
    } finally {
      // PENTING: Lepas kunci setelah
      // proses selesai (baik sukses atau gagal)
      setIsRecognizing(false);
    }
    // 'isRecognizing' adalah dependensi agar
    // fungsi ini selalu membaca nilai state terbaru.
  }, [isRecognizing, videoRef, setFaceResult, setIsRecognizing]);

  // --- MODIFIKASI: Ganti setInterval dengan loop setTimeout ---
  // Loop ini akan memanggil 'captureAndSendFrame',
  // menunggu 'await'-nya selesai,
  // BARU kemudian menunggu 3 detik sebelum memanggil lagi.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const videoEl = videoRef.current;

    // Definisikan loop-nya
    const recognitionLoop = async () => {
      await captureAndSendFrame();

      // Jadwalkan panggilan berikutnya
      // 3 detik SETELAH yang ini selesai
      timeoutId = setTimeout(recognitionLoop, 3000);
    };

    // Kita perlu menunggu video siap ('canplay')
    // sebelum memulai loop
    const startLoopOnPlay = () => {
      if (timeoutId) clearTimeout(timeoutId); // Hapus timeout lama jika ada
      recognitionLoop(); // Mulai loop
    };

    // Kita hanya pasang listener jika videoEl sudah ada
    if (videoEl) {
      videoEl.addEventListener("canplay", startLoopOnPlay);
    }

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (videoEl) {
        videoEl.removeEventListener("canplay", startLoopOnPlay);
      }
    };

    // 'captureAndSendFrame' adalah dependensi stabil (karena useCallback)
    // 'videoRef.current' BUKAN dependensi yang valid,
    // tapi kita bisa 'watch' 'videoRef.current'
    // dengan memasukkannya di sini.
    // Ini akan membuat useEffect ini jalan lagi
    // saat 'videoRef.current' berubah dari 'null'
    // menjadi elemen video, sehingga listener-nya terpasang.
  }, [captureAndSendFrame, videoRef.current]);
  // --- AKHIR MODIFIKASI ---

  // --- TAMBAHAN TRANSKRIPSI ---
  /**
   * Mengirim audio blob ke server untuk transkripsi.
   * @param audioBlob Blob audio yang akan ditranskripsi.
   */
  const sendAudioForTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionResult(null);
    setTranscriptionError(null);

    const formData = new FormData();
    // Tentukan ekstensi file untuk backend
    const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
    const extension = mimeType.includes("wav") ? "wav" : "webm";

    // 'file' harus cocok dengan nama argumen di endpoint FastAPI
    formData.append("file", audioBlob, `recording.${extension}`);

    try {
      const response = await fetch(
        "https://localhost:8000/speech_recognition/",
        // "https://192.168.1.18:8000/speech_recognition/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();

      // Periksa apakah responsnya adalah string (FastAPI membungkus str
      // dalam JSON string) atau objek (seperti { "text": "..." })
      if (typeof data === "string") {
        setTranscriptionResult(data);
      } else if (data.text || data.transcription) {
        setTranscriptionResult(data.text || data.transcription);
      } else {
        console.warn("Format respons transkripsi tidak dikenal:", data);
        setTranscriptionError("Format respons server tidak dikenal.");
      }
    } catch (err) {
      console.error("Gagal mentranskripsi audio:", err);
      setTranscriptionError("Gagal terhubung ke server transkripsi.");
    } finally {
      setIsTranscribing(false);
    }
  };
  // --- AKHIR TAMBAHAN ---

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
  };

  // --- TAMBAHAN/MODIFIKASI KAMERA ---
  // --- Fungsi untuk menghentikan stream video ---
  const stopVideoStreamTracks = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
  };
  // --- AKHIR TAMBAHAN ---

  // Efek cleanup untuk audio
  useEffect(() => {
    const currentAudioURL = audioURL;
    return () => {
      // Cleanup audio
      stopTimer();
      stopStreamTracks();
      if (currentAudioURL) {
        URL.revokeObjectURL(currentAudioURL);
      }
    };
  }, [audioURL]);

  // --- TAMBAHAN/MODIFIKASI KAMERA ---
  // --- Efek untuk menyalakan kamera saat komponen dimuat ---
  useEffect(() => {
    const startCamera = async () => {
      setCameraError(null);
      try {
        // Minta akses video
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoStreamRef.current = stream; // Simpan stream video untuk cleanup

        // Tautkan stream ke elemen <video>
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // 'play()' mungkin tidak diperlukan jika 'autoPlay' sudah di-set,
          // tapi ini memastikan
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError(
          "Tidak dapat mengakses kamera. Pastikan Anda memberikan izin."
        );
      }
    };

    startCamera();

    // Fungsi cleanup: akan dipanggil saat komponen di-unmount
    return () => {
      stopVideoStreamTracks();
    };
  }, []); // Array dependensi kosong, artinya hanya berjalan sekali saat mount
  // --- AKHIR TAMBAHAN ---

  // --- (Sisa kode audio recording... tidak ada perubahan) ---

  const startRecording = async () => {
    if (attemptsLeft === 0) return;

    setError(null);
    if (audioURL) {
      deleteRecording();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Ini adalah stream audio

      const mimeType = PREFERRED_MIME_TYPES.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      if (!mimeType) {
        throw new Error(
          "Browser tidak mendukung format perekaman audio yang kompatibel."
        );
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        stopStreamTracks(); // Stop stream audio

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);

          // --- TAMBAHAN TRANSKRIPSI ---
          // Panggil fungsi transkripsi setelah blob dibuat
          sendAudioForTranscription(audioBlob);
          // --- AKHIR TAMBAHAN ---

          if (attemptsLeft > 0) {
            setAttemptsLeft((prev) => prev - 1);
          }
        } else {
          setError((prevError) =>
            prevError ? prevError : "Gagal merekam audio. Data kosong."
          );
        }

        setIsRecording(false);
        stopTimer();
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
      stopStreamTracks(); // Stop stream audio jika gagal
      setError(
        "Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin."
      );
      setIsRecording(false);
      stopTimer();
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      if (recordingTime < 1) {
        setError("Perekaman terlalu singkat (minimum 1 detik).");
        audioChunksRef.current = [];
        stopRecording();
      } else {
        stopRecording();
      }
    } else {
      if (attemptsLeft > 0 && !audioURL) {
        startRecording();
      }
    }
  };

  const downloadAudio = () => {
    if (audioURL && mediaRecorderRef.current) {
      const mimeType = mediaRecorderRef.current.mimeType;
      let extension = "dat";
      if (mimeType.includes("webm")) extension = "webm";
      else if (mimeType.includes("wav")) extension = "wav";
      else if (mimeType.includes("ogg")) extension = "ogg";
      else if (mimeType.includes("mp4")) extension = "mp4";

      const a = document.createElement("a");
      a.href = audioURL;
      a.download = `attendance-recording-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      setAudioURL(null);
      setRecordingTime(0);
      setError(null);

      // --- TAMBAHAN TRANSKRIPSI ---
      // Bersihkan juga state transkripsi
      setTranscriptionResult(null);
      setTranscriptionError(null);
      setIsTranscribing(false);
      // --- AKHIR TAMBAHAN ---
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            Smart Attendance
          </h1>
        </div>
        <button className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12">
          {/* Camera Recognition */}
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Camera Recognition
            </h2>

            {/* --- TAMBAHAN/MODIFIKASI KAMERA --- */}
            {/* Ganti placeholder dengan elemen <video> */}
            <div className="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-lg flex items-center justify-center mb-4 overflow-hidden relative">
              {cameraError ? (
                // Tampilkan error jika kamera gagal
                <div className="flex flex-col items-center text-center p-4">
                  <AlertTriangle
                    className="w-20 h-20 text-red-400"
                    strokeWidth={1.5}
                  />
                  <p className="mt-4 text-red-600 text-sm">{cameraError}</p>
                </div>
              ) : (
                // Tampilkan video jika berhasil
                <video
                  ref={videoRef}
                  autoPlay
                  muted // 'muted' diperlukan agar 'autoPlay' berfungsi di banyak browser
                  playsInline // Penting untuk Safari di iOS
                  className="w-full h-full object-cover scale-x-[-1]" // 'scale-x-[-1]' untuk efek cermin
                />
              )}
              {/* Tampilkan status di atas video */}
              {faceResult && (
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-black bg-opacity-50 text-white text-center text-sm font-medium rounded-lg">
                  {faceResult}
                </div>
              )}
              
            </div>
            {/* --- AKHIR TAMBAHAN --- */}

            <p className="text-gray-600 text-center text-sm">
              Position your face within the frame for automatic recognition.
            </p>
          </div>

          {/* Voice Recording */}
          <div className="flex flex-col items-center">
            {/* ... (Sisa JSX untuk Voice Recording tidak berubah) ... */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Voice Recording
            </h2>
            <div className="mb-2">
              <span
                className={`font-medium ${
                  attemptsLeft === 0 ? "text-red-500" : "text-yellow-500"
                }`}
              >
                Attempts Left: {attemptsLeft}
              </span>
            </div>
            <p className="text-gray-600 text-center text-sm mb-4">
              <strong>Tekan</strong> tombol untuk MEREKAM.
              <br />
              Rekaman otomatis berhenti setelah {MAX_RECORDING_TIME} detik.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center max-w-xs">
                {error}
              </div>
            )}

            {isRecording && (
              <div className="mb-4 text-2xl font-bold text-blue-600">
                {formatTime(recordingTime)}
                <span className="text-sm text-gray-500">
                  {" "}
                  / {formatTime(MAX_RECORDING_TIME)}
                </span>
              </div>
            )}

            {audioURL && !isRecording && (
              <div className="mb-4 text-sm font-medium text-green-600">
                Perekaman berhasil ({formatTime(recordingTime)}s)
              </div>
            )}

            <button
              onClick={handleRecordClick}
              disabled={attemptsLeft === 0 || !!audioURL}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              className={`relative w-40 h-40 rounded-full transition-all duration-300 ${
                attemptsLeft === 0 || audioURL
                  ? "bg-gray-400 cursor-not-allowed"
                  : isRecording
                  ? "bg-red-500 scale-95 shadow-xl hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl"
              }`}
            >
              <div
                className={`absolute inset-0 rounded-full ${
                  isRecording ? "animate-ping bg-red-400 opacity-75" : ""
                }`}
              ></div>
              <div className="relative w-full h-full flex items-center justify-center">
                {isRecording ? (
                  <Square className="w-14 h-14 text-white" fill="white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" strokeWidth={2} />
                )}
              </div>
              <div
                className={`absolute -inset-3 border-4 rounded-full ${
                  attemptsLeft === 0 || audioURL
                    ? "border-gray-300"
                    : isRecording
                    ? "border-red-200"
                    : "border-blue-200"
                }`}
              ></div>
            </button>

            {audioURL && !isRecording && (
              <div className="mt-6 w-full max-w-sm space-y-3">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <audio src={audioURL} controls className="w-full" />
                </div>

                {/* --- TAMBAHAN TRANSKRIPSI --- */}
                {/* Tampilkan hasil transkripsi di sini */}
                <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
                  <h4 className="font-semibold text-gray-700">
                    Hasil Transkripsi:
                  </h4>
                  {isTranscribing ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm italic">Mentranskripsi...</span>
                    </div>
                  ) : transcriptionError ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{transcriptionError}</span>
                    </div>
                  ) : transcriptionResult ? (
                    <p className="text-gray-800 italic">
                      "{transcriptionResult}"
                    </p>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      Tidak ada hasil transkripsi.
                    </p>
                  )}
                </div>
                {/* --- AKHIR TAMBAHAN --- */}

                <div className="flex gap-2">
                  <button
                    onClick={downloadAudio}
                    aria-label="Download recording"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  <button
                    onClick={deleteRecording}
                    aria-label="Delete recording"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" /> Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
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
