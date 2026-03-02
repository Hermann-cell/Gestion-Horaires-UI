import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import "../styles/dashboard.css";
import Footer from "./Footer";

export default function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <TopNavbar />
        <div className="content-area">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}