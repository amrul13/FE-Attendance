"use client";

import React, { useState, useEffect, useRef } from "react";
// Components from shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import {
  Pencil,
  Trash,
  UserCheck,
  Bell,
  UserCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

// --- Configuration ---
// Ganti dengan alamat IP/domain server FastAPI Anda. Harus HTTPS jika bukan localhost!
const API_BASE_URL = "https://192.168.1.21:8000";
const DEFAULT_AVATAR_PATH = "/person.png";

// --- Types & Mock Data ---

type Student = {
  id: string;
  name: string;
  studentId: string;
  year: number;
  status: "Enrolled" | "Pending";
  avatar: string;
};

type NewUserPayload = {
  full_name: string;
  username: string;
  role: "student" | "admin";
  year_joined: number;
  photo_url: string | null;
  email: string;
  phone: string | null;
  password: string;
};

type UpdateUserPayload = Omit<NewUserPayload, "password"> & {
  password?: string;
};

type UserResponse = {
  id: string;
  full_name: string;
  username: string;
  year_joined: number;
  photo_url: string | null;
  status: string; // Misal: "enrolled" atau "pending"
  email: string;
  phone: string | null;
  role: string;
  // ... bidang lainnya
};

// --- Navigation Component ---

const TopNavigation: React.FC = () => (
  <nav className="flex justify-between items-center py-4 px-8 border-b bg-white shadow-sm">
    <div className="flex items-center space-x-8">
      <div className="text-xl font-bold text-blue-600">Smart Attendance</div>
      <div className="flex space-x-6 text-sm">
        <a href="#" className="hover:text-blue-600">
          Dashboard
        </a>
        <a
          href="#"
          className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
        >
          Student Management
        </a>
        <a href="#" className="hover:text-blue-600">
          Attendance Records
        </a>
        <a href="#" className="hover:text-blue-600">
          Settings
        </a>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500" />
      </Button>
      <Button variant="ghost" size="icon">
        <UserCircle className="w-6 h-6" />
      </Button>
    </div>
  </nav>
);

// -----------------------------------------------------------------------------------
// --- Student Form Modal (Create & Edit) ---
// -----------------------------------------------------------------------------------

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  initialData: Student | null;
  onSave: (payload: NewUserPayload | UpdateUserPayload) => Promise<void>;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const isEditing = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    photoUrl: "",
    year: "",
    role: "student" as "student" | "admin",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name,
        username: initialData.studentId,
        email: initialData.studentId + "@school.com", // Mock
        phone: "", // Mock
        password: "",
        photoUrl:
          initialData.avatar === DEFAULT_AVATAR_PATH ? "" : initialData.avatar,
        year: initialData.year.toString(),
        role: initialData.id.startsWith("A") ? "admin" : "student", // Mock
      });
    } else {
      setFormData({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        photoUrl: "",
        year: "",
        role: "student",
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id || e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.year
    ) {
      alert(
        "Please fill in the required fields (Name, Username, Email, Year)."
      );
      return;
    }

    if (!isEditing && !formData.password) {
      alert("Password is required for new user creation.");
      return;
    }

    const basePayload = {
      full_name: formData.name,
      username: formData.username,
      role: formData.role,
      year_joined: parseInt(formData.year),
      photo_url: formData.photoUrl || null,
      email: formData.email,
      phone: formData.phone || null,
    };

    let finalPayload: NewUserPayload | UpdateUserPayload;

    if (isEditing) {
      finalPayload = {
        ...basePayload,
        ...(formData.password && { password: formData.password }),
      };
    } else {
      finalPayload = {
        ...basePayload,
        password: formData.password,
      } as NewUserPayload;
    }

    setIsLoading(true);
    try {
      await onSave(finalPayload);
      onClose(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const modalTitle = isEditing
    ? `Edit Student: ${initialData?.name}`
    : "Add New Student";
  const submitButtonText = isEditing ? "Save Changes" : "Save Student";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{modalTitle}</DialogTitle>
          
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* ... (Form Fields Sesuai Sebelumnya) */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g., John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username / Student ID</Label>
              <Input
                id="username"
                placeholder="e.g., j.doe"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading || isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., j.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="e.g., +1 234 567 890"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {isEditing ? "(Leave blank to keep current)" : ""}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isEditing ? "New Password (Optional)" : "Enter password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-gray-500 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="photoUrl">Photo URL (Opsional)</Label>
            <Input
              id="photoUrl"
              placeholder="https://..."
              value={formData.photoUrl}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year Joined</Label>
              <Input
                id="year"
                type="number"
                placeholder="e.g., 2023"
                value={formData.year}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) =>
                  handleSelectChange("role", val as "student" | "admin")
                }
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Saving..." : submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// -----------------------------------------------------------------------------------
// --- HOOK UNTUK WEBCAM ---
// -----------------------------------------------------------------------------------

const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    // Hentikan stream lama jika ada
    if (stream) stopCamera();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      // Log konfirmasi stream berhasil
      if (mediaStream.getVideoTracks().length > 0) {
        console.log(
          "SUCCESS: Video stream obtained. Track state:",
          mediaStream.getVideoTracks()[0].readyState
        );
      }

      setStream(mediaStream);
      setIsCameraActive(true);

      // ⚠️ SOLUSI UTAMA: Tambahkan penundaan 50ms.
      // Ini memberi waktu React untuk merender elemen <video> dan mengisi videoRef.current.
      await new Promise((resolve) => setTimeout(resolve, 50));

      console.log("videoRef after delay: ", videoRef); // Cek nilai setelah delay

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log("Attempting to play video...");

        // Pastikan untuk menangani Promise yang dikembalikan oleh play()
        videoRef.current
          .play()
          .then(() => {
            console.log("Video playback successfully started.");
          })
          .catch((err) => {
            // Ini adalah error yang umum terjadi (misalnya, browser memblokir autoplay)
            console.error("Video playback failed (Autoplay Blocked?):", err);
          });
      } else {
        console.error(
          "CRITICAL ERROR: videoRef.current is still NULL after delay. Check rendering logic."
        );
      }
    } catch (error) {
      console.error("Gagal mengakses kamera:", error);
      setIsCameraActive(false);
    }
  };

  // ... (stopCamera dan return)
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  return { videoRef, startCamera, stopCamera, isCameraActive };
};

// -----------------------------------------------------------------------------------
// --- Face Enrollment Modal ---
// -----------------------------------------------------------------------------------

interface FaceEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEnrollSuccess: (studentId: string) => void;
}

const FaceEnrollmentModal: React.FC<FaceEnrollmentModalProps> = ({
  isOpen,
  onClose,
  student,
  onEnrollSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [captureMode, setCaptureMode] = useState<"upload" | "camera">("camera");

  const { videoRef, startCamera, stopCamera, isCameraActive } = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Efek samping untuk mengelola kamera saat modal/tab berubah
  useEffect(() => {
    if (isOpen && captureMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, captureMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setStatusMessage(
        `File ${e.target.files[0].name} selected. Ready to enroll.`
      );
    } else {
      setSelectedFile(null);
      setStatusMessage("");
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const capturedFile = new File(
              [blob],
              `${student?.studentId}_capture.jpeg`,
              {
                type: "image/jpeg",
              }
            );
            setSelectedFile(capturedFile);
            setStatusMessage("Photo captured successfully. Ready to enroll.");
          } else {
            setStatusMessage("Failed to capture photo.");
          }
        },
        "image/jpeg",
        0.9
      );
    }
  };

  const handleRegistration = async () => {
    if (!student || !selectedFile) {
      setStatusMessage("Please select or capture a photo first.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Uploading and processing face feature...");

    const formData = new FormData();
    formData.append("user_name", student.studentId);
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/face/register`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail ||
            response.statusText ||
            "Face registration failed."
        );
      }

      setStatusMessage(`SUCCESS: Face for ${student.name} registered!`);
      onEnrollSuccess(student.id);
      stopCamera();
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Unknown error during registration.";
      setStatusMessage(`ERROR: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setStatusMessage("");
    }
  }, [isOpen, captureMode]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          stopCamera();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-600">
            Enroll Face: {student?.name} ({student?.studentId})
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Lengkapi detail siswa. Pastikan semua bidang yang diperlukan terisi.
          </DialogDescription>
        </DialogHeader>

        {student && student.status === "Enrolled" ? (
          <div className="text-green-600 font-semibold p-4 border border-green-200 rounded-md bg-green-50">
            <UserCheck className="inline w-5 h-5 mr-2" />
            Wajah sudah terdaftar (Enrolled).
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Tabs
              value={captureMode}
              onValueChange={(v) => {
                setCaptureMode(v as "upload" | "camera");
                setSelectedFile(null);
                setStatusMessage("");
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera">Live Camera</TabsTrigger>
                <TabsTrigger value="upload">Upload Photo</TabsTrigger>
              </TabsList>

              {/* --- TAB LIVE CAMERA --- */}
              {captureMode === "camera" && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    Pastikan wajah berada di tengah frame dan pencahayaan baik.
                  </p>
                  <div className="flex justify-center border rounded-lg bg-gray-900 relative">
                    {isCameraActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="rounded-lg w-full max-h-[400px]"
                      />
                    ) : (
                      <div className="text-white p-10 text-center flex flex-col items-center justify-center h-[300px]">
                        <UserCircle className="w-10 h-10 mx-auto mb-2" />
                        Please allow camera access to start capture.
                      </div>
                    )}
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleCapturePhoto}
                      disabled={isLoading || !isCameraActive}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <UserCheck size={16} className="mr-2" />
                      Capture Photo
                    </Button>
                  </div>
                </div>
              )}

              {/* --- TAB UPLOAD --- */}
              {captureMode === "upload" && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    Unggah foto wajah yang jelas dan berkualitas baik
                    (JPEG/PNG).
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="face-photo-upload">Select Face Photo</Label>
                    <Input
                      id="face-photo-upload"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </Tabs>

            {/* Status dan Pratinjau File */}
            {(selectedFile || statusMessage) && (
              <div className="border-t pt-4 space-y-2">
                {selectedFile && (
                  <p className="text-sm font-medium">
                    Selected Photo: **{selectedFile.name}** (
                    {Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
                {statusMessage && (
                  <div
                    className={`p-3 text-sm rounded-md ${
                      statusMessage.startsWith("SUCCESS")
                        ? "bg-green-100 text-green-700"
                        : statusMessage.startsWith("ERROR")
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Close
          </Button>
          {student?.status !== "Enrolled" && (
            <Button
              onClick={handleRegistration}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserCheck size={16} className="mr-2" />
              )}
              {isLoading ? "Enrolling..." : "Start Enrollment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// -----------------------------------------------------------------------------------
// --- Main Page Component ---
// -----------------------------------------------------------------------------------

const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "enrolled" | "pending">("all");

  // State untuk Modal Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // State untuk Modal Enrollment
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollStudent, setEnrollStudent] = useState<Student | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Utility Functions ---
 const mapUserToStudent = (user: UserResponse): Student => {
   // Logika penentuan status berdasarkan photo_url:
   // Jika user.photo_url BUKAN null dan BUKAN string kosong, maka dianggap Enrolled.
   const isEnrolled = user.photo_url !== null && user.photo_url.trim() !== "";

   return {
     id: user.id.toString(),
     name: user.full_name,
     studentId: user.username,
     year: user.year_joined,

     // Mengatur status berdasarkan nilai photo_url
     status: isEnrolled ? "Enrolled" : "Pending",

     avatar: isEnrolled // Gunakan photo_url jika ada, jika tidak gunakan default
       ? user.photo_url!
       : DEFAULT_AVATAR_PATH,
   };
 };

  // --- FETCH DATA ---
  const fetchStudents = async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/`);
      console.log(response)
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }

      const data: UserResponse[] = await response.json();
      setStudents(data.map(mapUserToStudent));
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(
        `Failed to load data. Please check if the API server is running at ${API_BASE_URL}.`
      );
      setStudents([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- HANDLERS MODAL ADD/EDIT ---
  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleCreateStudent = async (payload: NewUserPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `API error: ${response.statusText}`
        );
      }

      const createdUser: UserResponse = await response.json();
      setStudents((prev) => [...prev, mapUserToStudent(createdUser)]);
    } catch (error) {
      alert(
        `Gagal menyimpan data baru: ${
          error instanceof Error ? error.message : "Kesalahan tidak dikenal"
        }`
      );
      throw error;
    }
  };

  const handleUpdateStudent = async (payload: UpdateUserPayload) => {
    if (!editingStudent) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${editingStudent.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `API error: ${response.statusText}`
        );
      }

      const updatedUser: UserResponse = await response.json();
      const updatedStudent = mapUserToStudent(updatedUser);

      setStudents((prev) =>
        prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
      );
    } catch (error) {
      alert(
        `Gagal mengupdate data: ${
          error instanceof Error ? error.message : "Kesalahan tidak dikenal"
        }`
      );
      throw error;
    }
  };

  const handleFormSave = (payload: NewUserPayload | UpdateUserPayload) => {
    if (editingStudent) {
      return handleUpdateStudent(payload as UpdateUserPayload);
    } else {
      return handleCreateStudent(payload as NewUserPayload);
    }
  };

  // --- HANDLERS MODAL ENROLL FACE ---
  const handleEnrollFaceClick = (student: Student) => {
    setEnrollStudent(student);
    setIsEnrollModalOpen(true);
  };

  const handleCloseEnrollModal = () => {
    setIsEnrollModalOpen(false);
    setEnrollStudent(null);
  };

  const handleEnrollSuccess = (studentId: string) => {
    // Perbarui status siswa secara lokal menjadi "Enrolled"
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: "Enrolled" } : s))
    );
  };

  // --- FILTERING ---
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      tab === "all" ||
      (tab === "enrolled" && student.status === "Enrolled") ||
      (tab === "pending" && student.status === "Pending");
    return matchesSearch && matchesTab;
  });

  // --- Render Component ---
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      <div className="p-8 space-y-6">
        {/* Header and Add Button */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Student Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage student details and face recognition enrollment.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingStudent(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1"
            disabled={isLoadingData}
          >
            + Add New Student
          </Button>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:max-w-sm">
            <Input
              className="bg-white"
              placeholder="Search by student name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoadingData}
            />
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as any)}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div
              className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
              role="alert"
            >
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <p className="text-gray-600">Loading student data...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STUDENT NAME</TableHead>
                  <TableHead>STUDENT ID</TableHead>
                  <TableHead>TAHUN MASUK ANGKATAN</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell className="flex items-center gap-3 font-medium">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        {student.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {student.studentId}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {student.year}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            student.status === "Enrolled"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {student.status === "Pending" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 h-8 px-3"
                            onClick={() => handleEnrollFaceClick(student)}
                          >
                            <UserCheck size={16} /> Enroll Face
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-gray-500 hover:text-blue-600 border-gray-300"
                          onClick={() => handleEditClick(student)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 border-transparent"
                        >
                          <Trash size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
                    >
                      No student data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Modal Add/Edit */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingStudent}
        onSave={handleFormSave}
      />

      {/* Modal Enroll Face */}
      <FaceEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={handleCloseEnrollModal}
        student={enrollStudent}
        onEnrollSuccess={handleEnrollSuccess}
      />
    </div>
  );
};

export default StudentManagementPage;
