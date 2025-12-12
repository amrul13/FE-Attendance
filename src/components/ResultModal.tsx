// src/components/ResultModal.tsx (VERSI FINAL YANG BEBAS DARI KESALAHAN HOOKS)

import { CheckCircle, XCircle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export type VerificationResult = {
  success: boolean;
  message: string;
  recognizedWord: string | null;
  nextInSeconds: number | null;
};

// BAGIAN INI HARUS ADA:
interface ResultModalProps {
  result: VerificationResult | null;
  onClose: () => void;
}

export const ResultModal = ({ result, onClose }: ResultModalProps) => {
  // 1. Deklarasi variabel dilakukan di top level
  // Menggunakan Optional Chaining (?.) untuk membaca nilai dari result,
  // meskipun result adalah null.
  const isSuccess = result?.success ?? false;
  const nextInSeconds = result?.nextInSeconds ?? null;

  // 2. SEMUA HOOKS DIPANGGIL DI TOP LEVEL FUNGSI SEBELUM ADA RETURN

  // Logika untuk memutar Audio
  useEffect(() => {
    // Logika IF (kondisional) di dalam Hook
    if (result) {
      const audio = new Audio(
        isSuccess ? "/sound/right.mp3" : "/sound/wrong.mp3"
      );
      audio.play().catch((e) => console.error("Error playing audio:", e));
    }
  }, [result, isSuccess]);

  // Hitungan Mundur Otomatis
  useEffect(() => {
    // Logika IF (kondisional) di dalam Hook
    if (isSuccess && nextInSeconds !== null && nextInSeconds > 0) {
      const timer = setTimeout(onClose, nextInSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, nextInSeconds, onClose]);

  // 3. RETURN KONDISIONAL DILAKUKAN HANYA SETELAH SEMUA HOOKS DIPANGGIL
  if (!result) {
    return null; // Return ini tidak akan memblokir panggilan Hooks di atas.
  }

  // ... Sisa kode rendering ...

  const modalClass = isSuccess
    ? "bg-white p-10 rounded-3xl shadow-2xl transition-all duration-300 transform scale-100 max-w-sm w-full text-center border-t-8 border-green-500"
    : "bg-white p-10 rounded-3xl shadow-2xl transition-all duration-300 transform scale-100 max-w-sm w-full text-center border-t-8 border-red-500";

  const icon = isSuccess ? (
    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse-once">
      <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={1.5} />
    </div>
  ) : (
    <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-shake">
      <XCircle className="w-16 h-16 text-red-500" strokeWidth={1.5} />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={modalClass}>
        {icon}
        <h3
          className={`text-3xl font-extrabold mb-3 ${
            isSuccess ? "text-green-800" : "text-red-800"
          }`}
        >
          {isSuccess ? "Awesome!" : "Not Quite!"}
        </h3>
        <p className="text-gray-600 mb-6 px-4">
          {isSuccess
            ? result.message || "Your attendance is marked."
            : result.message ||
              "That's a good try, but not the word we're looking for. Let's try another one!"}
        </p>

        {result.recognizedWord && (
          <div className="bg-gray-50 p-3 rounded-lg inline-block mb-6">
            <p className="text-gray-600 font-bold text-xl">
              {result.recognizedWord}
            </p>
          </div>
        )}

        {isSuccess ? (
          <div className="text-gray-500 text-sm">
            Next student in {nextInSeconds} seconds...
            <div className="mt-2 w-full h-2 bg-green-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  animation: `progress ${nextInSeconds}s linear forwards`,
                }}
              ></div>
            </div>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" /> Please try again...
          </button>
        )}
      </div>
    </div>
  );
};
