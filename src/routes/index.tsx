import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import Login from "../pages/Login";
// import DashboardGuru from "../pages/DashboardGuru";
import DashboardSiswa from "../pages/DashboardSiswa";
import DashboardGuru from "../pages/DashboardGuru";
import AttendanceSession from "../pages/AttendanceSession";
import ThemeDetailPage from "../pages/ThemeDetailPage";
import WelcomePage from "../pages/WelcomePage";
import StudentManagement from "../pages/StudentManagement";



export default function AppRoutes() {
  // Simulasi login — nanti bisa diganti dari state/context
  // const isLoggedIn = localStorage.getItem("isLoggedIn");
  // const role = localStorage.getItem("role"); // "guru" atau "siswa"

  return (
    <Router>
      <Routes>
        {/* Halaman login */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/siswa" element={<DashboardSiswa />} />
        <Route path="/guru" element={<DashboardGuru />} />
        <Route path="/student" element={<StudentManagement />} />
        <Route
          path="/attendance/:sessionCode"
          element={<AttendanceSession />}
        />
        <Route path="/themes/:themeId" element={<ThemeDetailPage />} />

        {/* Proteksi route */}
        {/* <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              role === "guru" ? (
                <DashboardGuru />
              ) : (
                <DashboardSiswa />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        /> */}

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Router>
  );
}
