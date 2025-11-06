import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  PlusCircle,
  BookOpen,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import VocabularyForm  from "../components/VocabularyForm";

// --- TYPE DEFINITIONS ---
interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
}

interface Theme {
  id: string;
  name: string;
  description: string;
}

const API_BASE_URL = "https://localhost:8000";

const ThemeDetailPage: React.FC = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();

  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(
    null
  );
  const [formLoading, setFormLoading] = useState<boolean>(false);

  // Fetch data function
  const fetchData = async () => {
    if (!themeId) {
      setError("Theme ID tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [themeResponse, vocabResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/themes/${themeId}`),
        fetch(`${API_BASE_URL}/vocabularies/theme/${themeId}`),
      ]);

      if (!themeResponse.ok) {
        throw new Error(
          `Gagal mengambil data tema: Status ${themeResponse.status}`
        );
      }
      const themeData: Theme = await themeResponse.json();
      setTheme(themeData);

      if (!vocabResponse.ok) {
        throw new Error(
          `Gagal mengambil data vocab: Status ${vocabResponse.status}`
        );
      }
      const vocabData: Vocabulary[] = await vocabResponse.json();
      setVocabularies(vocabData);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengambil data.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [themeId]);

  // --- FORM HANDLERS ---
  const handleAddClick = () => {
    setEditingVocabulary(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (vocab: Vocabulary) => {
    setEditingVocabulary(vocab);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingVocabulary(null);
    setError(null);
  };

  const handleFormSubmit = async (formData: VocabularyFormData) => {
    if (!themeId) return;

    setFormLoading(true);
    setError(null);

    try {
      const url = editingVocabulary
        ? `${API_BASE_URL}/vocabularies/${editingVocabulary.id}`
        : `${API_BASE_URL}/vocabularies/`;

      const method = editingVocabulary ? "PUT" : "POST";

      const payload = editingVocabulary
        ? { ...formData, theme_ids: [parseInt(themeId)] }
        : { ...formData, theme_ids: [parseInt(themeId)] };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${
            editingVocabulary ? "update" : "create"
          } vocabulary: Status ${response.status}`
        );
      }

      const result: Vocabulary = await response.json();

      // Update local state
      if (editingVocabulary) {
        // Update existing vocabulary
        setVocabularies((prev) =>
          prev.map((v) => (v.id === editingVocabulary.id ? result : v))
        );
      } else {
        // Add new vocabulary
        setVocabularies((prev) => [...prev, result]);
      }

      // Close form and show success
      handleFormClose();

      // Show success message (bisa diganti dengan toast notification)
      console.log(
        `Successfully ${editingVocabulary ? "updated" : "added"} vocabulary`
      );
    } catch (err: any) {
      setError(
        err.message ||
          `Failed to ${editingVocabulary ? "update" : "add"} vocabulary`
      );
      console.error("Form submission error:", err);
    } finally {
      setFormLoading(false);
    }
  };

  // --- EXISTING HANDLERS (dengan minor improvements) ---
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vocabulary?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/vocabularies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete: Status ${response.status}`);
      }

      setVocabularies((prev) => prev.filter((v) => v.id !== id));
      console.log(`Successfully deleted vocabulary with ID: ${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to delete vocabulary");
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // --- RENDER LOGIC ---
  if (loading && !theme) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-blue-600"
            size={48}
          />
          <p className="text-gray-600">Loading theme data...</p>
        </div>
      </div>
    );
  }

  if (error && !theme) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={handleGoBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <button
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition py-2 px-3 rounded-lg hover:bg-gray-100"
            onClick={handleGoBack}
          >
            <ArrowLeft size={20} />
            <span>Back to Themes</span>
          </button>

          {!loading && (
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition py-2 px-3 rounded-lg hover:bg-gray-100"
              title="Refresh data"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {/* Theme Header Card */}
        {theme && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 flex items-start space-x-4">
            <BookOpen className="text-blue-500 mt-1 flex-shrink-0" size={32} />
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                {theme.name}
              </h1>
              <p className="text-gray-600">{theme.description}</p>
            </div>
          </div>
        )}

        {/* Vocabulary List Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Theme Vocabularies
              </h2>
              {!loading && (
                <p className="text-sm text-gray-500 mt-1">
                  {vocabularies.length} vocabulary{" "}
                  {vocabularies.length === 1 ? "item" : "items"}
                </p>
              )}
            </div>
            <button
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition transform hover:scale-[1.02] shadow-md self-start sm:self-auto"
              onClick={handleAddClick}
            >
              <PlusCircle size={18} />
              <span>Add Vocabulary</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="overflow-x-auto">
            {loading && (
              <div className="flex justify-center items-center py-12 text-gray-500">
                <Loader2 className="animate-spin mr-2" size={24} />
                <span>Loading vocabularies...</span>
              </div>
            )}

            {error && !isFormOpen && (
              <div className="flex flex-col items-center py-12 text-red-600 bg-red-50 p-6 m-4 rounded-lg">
                <AlertTriangle className="mb-2" size={32} />
                <span className="text-center mb-4">Error: {error}</span>
                <button
                  onClick={handleRefresh}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && vocabularies.length > 0 && (
              <table className="w-full min-w-[600px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-6 text-left">Word</th>
                    <th className="py-3 px-6 text-left">
                      Meaning (Indonesian)
                    </th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {vocabularies.map((vocab) => (
                    <tr
                      key={vocab.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        {vocab.word}
                      </td>
                      <td className="py-4 px-6 text-gray-600 italic">
                        {vocab.meaning}
                      </td>
                      <td className="py-4 px-6 text-right space-x-3">
                        <button
                          className="text-blue-500 hover:text-blue-700 transition disabled:opacity-50"
                          title="Edit"
                          onClick={() => handleEditClick(vocab)}
                          disabled={deletingId === vocab.id}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                          title="Delete"
                          onClick={() => handleDelete(vocab.id)}
                          disabled={deletingId === vocab.id}
                        >
                          {deletingId === vocab.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && !error && vocabularies.length === 0 && (
              <div className="text-center text-gray-500 py-12 px-6">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Vocabularies Added
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Get started by adding a new word to this theme.
                </p>
                <button
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition mx-auto"
                  onClick={handleAddClick}
                >
                  <PlusCircle size={18} />
                  <span>Add First Vocabulary</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vocabulary Form Modal */}
        <VocabularyForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialData={editingVocabulary}
          isEditing={!!editingVocabulary}
          loading={formLoading}
        />
      </div>
    </div>
  );
};

export default ThemeDetailPage;
