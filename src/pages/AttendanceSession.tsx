import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Bell,
  Clock,
  
  CheckCircle,
  Hourglass,
  X,
  Check,
} from "lucide-react";

// --- TYPE DEFINITIONS ---
type StudentStatus = "present" | "pending";

interface Student {
  id: number;
  name: string;
  avatarUrl: string;
  status: StudentStatus;
}

// --- MOCK DATA GENERATION ---
// Function to generate 20 mock students
const generateMockStudents = (count: number): Student[] => {
  const firstNames = [
    "Ethan",
    "Ava",
    "Caleb",
    "Chloe",
    "Daniel",
    "Emma",
    "Finn",
    "Grace",
    "Henry",
    "Isla",
    "Jack",
    "Lily",
    "Mason",
    "Mia",
    "Nolan",
    "Olive",
    "Peter",
    "Quinn",
    "Ryan",
    "Skylar",
    "Zoe",
    "Axel",
  ];
  const lastNames = [
    "Smith",
    "Jones",
    "Williams",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Garcia",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "King",
    "Lee",
  ];

  const students: Student[] = [];
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[(i - 1) % firstNames.length];
    const lastName = lastNames[(i + 4) % lastNames.length]; // Offset last name for variety
    const name = `${firstName} ${lastName}`;
    const initials = `${firstName[0]}${lastName[0]}`;
    // Alternate status: 2/3 present, 1/3 pending
    const status: StudentStatus = i % 3 !== 0 ? "present" : "pending";
    // Use diverse colors for avatars
    const bgColor = [
      "E9D5FF",
      "D1FAE5",
      "FEF3C7",
      "DBEAFE",
      "FEE2E2",
      "CFFAFE",
      "FFEDD5",
    ][i % 7];
    const fgColor = [
      "4A044E",
      "064E3B",
      "92400E",
      "1E3A8A",
      "991B1B",
      "155E75",
      "9A3412",
    ][i % 7];

    students.push({
      id: i,
      name,
      avatarUrl: `https://placehold.co/100x100/${bgColor}/${fgColor}?text=${initials}`,
      status,
    });
  }
  return students;
};

const mockStudents: Student[] = generateMockStudents(20);

// --- SUB-COMPONENTS ---

/**
 * Main application header
 */
const Header: React.FC = () => (
  <header className="bg-white shadow-sm p-4">
    <div className="container mx-auto flex justify-between items-center max-w-7xl">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          S
        </span>
        <h1 className="text-xl font-bold text-gray-800">Smart Attendance</h1>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        <a href="#" className="text-gray-600 hover:text-blue-600">
          Dashboard
        </a>
        <a
          href="#"
          className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
        >
          Classes
        </a>
        <a href="#" className="text-gray-600 hover:text-blue-600">
          Reports
        </a>
        <a href="#" className="text-gray-600 hover:text-blue-600">
          Settings
        </a>
      </nav>

      {/* Icons */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-800">
          <Bell size={22} />
        </button>
        <button className="text-gray-500 hover:text-gray-800">
          <Clock size={22} />
        </button>
        <button>
          <img
            src="https://placehold.co/40x40/FDBA74/854D0E?text=U"
            alt="User profile"
            className="w-9 h-9 rounded-full border-2 border-gray-200"
          />
        </button>
      </div>
    </div>
  </header>
);

/**
 * Displays a single student in the list
 */
interface StudentListItemProps {
  student: Student;
  onClick: () => void;
  isActive: boolean;
}

const StudentListItem: React.FC<StudentListItemProps> = ({
  student,
  onClick,
  isActive,
}) => {
  const isPresent = student.status === "present";

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
        isActive ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <img
          src={student.avatarUrl}
          alt={student.name}
          className="w-10 h-10 rounded-full"
        />
        <span className="font-medium text-gray-700">{student.name}</span>
      </div>

      {isPresent ? (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">Present</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-yellow-600">
          <Hourglass size={16} />
          <span className="text-sm font-medium">Pending</span>
        </div>
      )}
    </div>
  );
};

/**
 * Card displaying the list of students
 */
interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  activeStudentId: number | null;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  onSelectStudent,
  activeStudentId,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 h-full overflow-y-auto max-h-[80vh]">
    {" "}
    {/* Added scroll for 20 students */}
    <h2 className="text-lg font-semibold text-gray-800 mb-4">
      Student List ({students.length})
    </h2>
    <div className="space-y-2">
      {students.map((student) => (
        <StudentListItem
          key={student.id}
          student={student}
          onClick={() => onSelectStudent(student)}
          isActive={student.id === activeStudentId}
        />
      ))}
    </div>
  </div>
);

/**
 * Card displaying the currently speaking student
 */
interface SpeakingPanelProps {
  student: Student;
  detectedWord: string;
}

const SpeakingPanel: React.FC<SpeakingPanelProps> = ({
  student,
  detectedWord,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-center h-full">
    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
      Currently Speaking
    </span>

    <img
      src={student.avatarUrl.replace("100x100", "150x150")} // Get a larger image
      alt={student.name}
      className="w-28 h-28 rounded-full my-4 border-4 border-blue-200 shadow-md"
    />

    <h3 className="text-2xl font-semibold text-gray-900 mb-8">
      {student.name}
    </h3>

    <div className="bg-gray-50 rounded-lg p-6 w-full max-w-md mb-8">
      <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        Detected Word
      </span>
      <p className="text-4xl font-bold text-gray-800 mt-2">"{detectedWord}"</p>
    </div>

    <div className="flex space-x-4 w-full max-w-md">
      <button className="flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg">
        <X size={20} />
        <span>Incorrect</span>
      </button>
      <button className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg">
        <Check size={20} />
        <span>Correct</span>
      </button>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

/**
 * Main Attendance Session Page Component
 */
export default function AttendanceSession() {
  const [students] = useState<Student[]>(mockStudents);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<Student>(
    mockStudents[0]
  );
  const [detectedWord] = useState<string>("Serendipity");
  const { sessionCode } = useParams<{ sessionCode: string }>();


  const handleSelectStudent = (student: Student) => {
    setCurrentlySpeaking(student);
  };

  const navigate = useNavigate();
  const handleEndSession = async () => {

    try {
      const res = await fetch(
        `https://localhost:8000/attendance/${sessionCode}/close`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          // body: JSON.stringify({
          //   session_id: sessionCode,
          // }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Failed to end session: ${errorData.detail || "Unknown error"}`);
        return;
      }

      alert("✅ Attendance session has been ended and saved!");
      navigate("/guru"); // arahkan kembali ke dashboard
    } catch (error) {
      console.error("Error ending session:", error);
      alert("❌ Error connecting to server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      <Header />

      <main className="container mx-auto max-w-7xl p-6 md:p-8">
        {/* Header/Title Row with End Session Button */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div className="grow min-w-[200px]">
            <h1 className="text-3xl font-bold text-gray-900">
              Live Attendance Session: Vocabulary Practice
            </h1>
            <p className="text-md text-gray-600 mt-1">
              Class: English 101 | Date: 24th October 2023
            </p>
          </div>

          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg self-center whitespace-nowrap"
            onClick={handleEndSession}
          >
            End Session
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Student List */}
          <div className="lg:col-span-1">
            <StudentList
              students={students}
              onSelectStudent={handleSelectStudent}
              activeStudentId={currentlySpeaking.id}
            />
          </div>

          {/* Right Column: Speaking Panel */}
          <div className="lg:col-span-2">
            <SpeakingPanel
              student={currentlySpeaking}
              detectedWord={detectedWord}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
