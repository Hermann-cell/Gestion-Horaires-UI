// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layout/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/Users.jsx";
import Rooms from "./pages/Rooms.jsx";
import RoomDetail from "./pages/RoomDetail.jsx";
import Professors from "./pages/Professors.jsx";
import Planning from "./pages/Planning.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Profile from "./pages/Profile.jsx";
import ProfessorDetail from "./pages/ProfessorDetail.jsx";

import TeacherPlanning from "./pages/TeacherPlanning";

import ProtectedRoute from "./auth/ProtectedRoute.jsx";

// Import ToastContainer de react-toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";

export default function App() {
  return (
    <Router>
      {/* ToastContainer doit être monté une seule fois */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        pauseOnHover
        draggable
        theme="colored"
      />

      <Routes>
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Private */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={
            <ProtectedRoute roles={["Administrateur"]}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/professors" element={<Professors />} />
          <Route path="/professors/:id" element={<ProfessorDetail />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/planning-enseignants" element={<TeacherPlanning />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}