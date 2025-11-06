// types/vocabulary.ts

export interface VocabularyFormData {
  word: string;
  meaning: string;
}

export interface Vocabulary extends VocabularyFormData {
  id: number;
}

export interface VocabularySearchResult {
  id: number;
  word: string;
  meaning: string;
  exists_in_current_theme?: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Types untuk API operations
export interface CreateVocabularyRequest extends VocabularyFormData {
  theme_ids?: number;
}

export interface UpdateVocabularyRequest extends VocabularyFormData {
  id: number;
}

// Types untuk search dan filter
export interface VocabularySearchParams {
  query: string;
  theme_id?: string;
  limit?: number;
  offset?: number;
}

export interface VocabularyFilter {
  theme_id?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
}
