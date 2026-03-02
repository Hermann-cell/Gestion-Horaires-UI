import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layout/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/Users.jsx";
import Rooms from "./pages/Rooms.jsx";
import Professors from "./pages/Professors.jsx";
import Planning from "./pages/Planning.jsx";


export default function App() {


    return (
        <Router>
            <Routes>
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="rooms" element={<Rooms />} />
                    <Route path="professors" element={<Professors />} />
                    <Route path="planning" element={<Planning />} />
                </Route>
            </Routes>
        </Router>
    );
}