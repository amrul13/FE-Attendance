// src/components/VerificationVocabList.tsx

import { AlertTriangle } from "lucide-react";

type Vocab = {
    id: number;
    word: string;
    meaning: string;
};

interface VocabListProps {
    themeId: string | null;
    vocabList: Vocab[];
    loading: boolean;
}

export const VerificationVocabList = ({
    themeId,
    vocabList,
    loading,
}: VocabListProps) => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-xl max-w-sm w-full">
            
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                Verifikasi Kosa Kata 
            </h2>
            
            {themeId && (
                <p className="text-sm text-gray-500 mb-3">
                    Tema Aktif:
                    <span className="font-semibold text-blue-600">{themeId}</span> 
                </p>
            )}
            
            {loading ? (
                <div className="text-center py-4">
                    
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-2">Memuat kosa kata...</p>
                    
                </div>
            ) : vocabList.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-700">
                        Tidak ada kosa kata untuk tema ini.
                    </p>
                    
                </div>
            ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    
                    {vocabList.map((v) => (
                        <li
                            key={v.id}
                            className="p-3 bg-gray-50 rounded-md border-l-4 border-blue-400"
                        >
                            <p className="font-bold text-gray-800">{v.word}</p>
                            
                            <p className="text-sm text-gray-600 italic">{v.meaning}</p>
                            
                        </li>
                    ))}
                    
                </ul>
            )}
            
        </div>
    );
};
