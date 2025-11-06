import { useState, useEffect } from "react";
import {
  Diamond,
  Search,
  User,
  Play,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";


import { StartSessionModal } from "@/components/StartSessionModal";


interface Theme {
  id: number;
  name: string;
}

// URL API Anda. Sesuaikan jika perlu
const API_URL = "https://localhost:8000/themes"; // Pastikan http atau https sesuai

// ------------------- COMPONENTS -------------------

function AppHeader({
  onSearchChange,
}: {
  onSearchChange: (v: string) => void;
}) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-8">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Diamond className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-semibold text-gray-800">
            Smart Attendance
          </span>
        </div>

        <div className="relative hidden md:block w-full max-w-md">
          <input
            type="text"
            placeholder="Search themes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <button className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

function StartSessionBanner() {
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  return (
    <section className="bg-blue-100/60 p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <button className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
            <Play className="w-8 h-8 fill-white" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Ready for today's session?
            </h2>
            <p className="text-gray-600">
              Start the attendance session to get going.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSessionModalOpen(true)}
          className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg flex items-center space-x-2 shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Play className="w-5 h-5" />
          <span>Start Attendance Session</span>
        </button>
      </div>
      <StartSessionModal
        open={isSessionModalOpen}
        onOpenChange={setIsSessionModalOpen}
      />
    </section>
  );
}

// --- Modifikasi ThemeCard ---
// Tambahkan prop onEdit
function ThemeCard({
  theme,
  onDelete,
  onEdit, // Prop baru untuk menangani edit
}: {
  theme: Theme;
  onDelete: (id: number) => void;
  onEdit: (theme: Theme) => void; // Fungsi yang menerima objek theme
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{theme.name}</h3>
        <div className="flex space-x-3 text-gray-400">
          {/* Tambahkan onClick handler untuk edit */}
          <button
            onClick={() => onEdit(theme)} // Panggil onEdit dengan theme saat ini
            className="hover:text-blue-600"
          >
            <Pencil className="w-5 h-5" />
          </button>
          {/* Handler delete tetap sama */}
          <button
            onClick={() => onDelete(theme.id)}
            className="hover:text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <Link
        to={`/themes/${theme.id}`}
        className="text-blue-600 font-medium text-sm hover:underline"
      >
        Open Theme
      </Link>
    </div>
  );
}

function AddThemeModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Theme</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter theme name..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-5"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (title.trim()) {
                onAdd(title.trim());
                setTitle("");
                onClose();
              }
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Theme
          </button>
        </div>
      </div>
    </div>
  );
}

function EditThemeModal({
  isOpen,
  onClose,
  onSave,
  theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, name: string) => void;
  theme: Theme | null; // Tema yang sedang diedit
}) {
  const [name, setName] = useState("");

  // Efek ini akan mengisi input dengan nama tema saat ini
  // setiap kali modal dibuka atau 'theme' berubah
  useEffect(() => {
    if (theme) {
      setName(theme.name);
    }
  }, [theme]); // Dependensi: jalankan saat 'theme' berubah

  if (!isOpen || !theme) return null; // Jangan render jika tidak terbuka atau tidak ada tema

  const handleSubmit = () => {
    if (name.trim() && theme) {
      onSave(theme.id, name.trim());
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Theme</h2>

        <input
          type="text"
          value={name} // Gunakan state 'name'
          onChange={(e) => setName(e.target.value)} // Perbarui state 'name'
          placeholder="Enter theme name..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-5"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit} // Panggil handleSubmit saat menyimpan
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- MAIN -------------------

export default function DashboardGuru() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State BARU untuk Edit ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  // --- Ambil data (fetchThemes) ---
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data: Theme[] = await response.json();
        setThemes(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  const filteredThemes = themes.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Handler Add (POST) ---
  const handleAddTheme = async (name: string) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to add theme");
      }

      const newTheme: Theme = await response.json();
      setThemes((prev) => [...prev, newTheme]);
    } catch (err) {
      console.error("Failed to add theme:", err);
    }
  };

  // --- Handler Delete (DELETE) ---
  const handleDeleteTheme = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this theme?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete theme");
      }

      setThemes((prev) => prev.filter((theme) => theme.id !== id));
    } catch (err) {
      console.error("Failed to delete theme:", err);
    }
  };

  // --- Handler BARU untuk memulai Edit ---
  const handleStartEdit = (theme: Theme) => {
    setEditingTheme(theme); // Set tema yang akan diedit
    setIsEditModalOpen(true); // Buka modal edit
  };

  // --- Handler BARU untuk menutup Modal Edit ---
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTheme(null); // Bersihkan tema yang diedit
  };

  // --- Handler BARU untuk Update (PUT) ---
  const handleUpdateTheme = async (id: number, name: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }), // Sesuai dengan skema ThemeUpdate
      });

      if (!response.ok) {
        throw new Error("Failed to update theme");
      }

      const updatedTheme: Theme = await response.json();

      // Perbarui state themes dengan data yang sudah diupdate
      setThemes((prev) =>
        prev.map((theme) => (theme.id === id ? updatedTheme : theme))
      );

      handleCloseEditModal(); // Tutup modal setelah berhasil
    } catch (err) {
      console.error("Failed to update theme:", err);
      // Tampilkan notifikasi error di sini
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <AppHeader onSearchChange={setSearchTerm} />

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <StartSessionBanner />

        <section className="mt-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-gray-800">
              Vocabulary Themes
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-gray-700 font-medium px-5 py-2.5 rounded-lg flex items-center space-x-2 border border-gray-300 shadow-sm hover:bg-gray-50"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Theme</span>
            </button>
          </div>

          {loading && (
            <div className="text-center py-10 px-6 bg-white rounded-2xl">
              <p className="text-gray-500">Loading themes...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10 px-6 bg-white rounded-2xl border border-red-200 shadow-sm">
              <h3 className="text-lg font-medium text-red-700">
                Failed to load themes
              </h3>
              <p className="text-gray-500 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredThemes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredThemes.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      onDelete={handleDeleteTheme}
                      onEdit={handleStartEdit} // Teruskan handler onEdit
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-700">
                    No themes found
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Try adjusting your search or add a new theme.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Modal untuk Add */}
      <AddThemeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTheme}
      />

      {/* Modal BARU untuk Edit */}
      <EditThemeModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateTheme}
        theme={editingTheme}
      />
    </div>
  );
}
