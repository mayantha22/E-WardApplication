import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TopNav from "./components/TopNav";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StaffPage from "./pages/StaffPage";
import PatientPage from "./pages/PatientPage";
import InventoryPage from "./pages/InventoryPage";
import DutyRosterPage from "./pages/DutyRosterPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import PatientProfile from "./pages/PatientProfile";
import StaffProfile from "./pages/StaffProfile"
import SwapRequestPage from "./pages/SwapRequestPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


//import RosterDetailPage from "./pages/RosterDetailPage";

//import RosterMonthViewPage from "./pages/RosterMonthViewPage";

function App() {
  return (
    <>
      <TopNav />
      <div className="container container-max mt-4">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientPage />
              </ProtectedRoute>
            }
          />

          {/* --- NEW PATIENT PROFILE ROUTE --- */}
          <Route
            path="/patients/profile/:id"
            element={
              <ProtectedRoute>
                <PatientProfile />
              </ProtectedRoute>
            }
          />
          
          <Route 
          path="/staff/profile/:id" 
          element={ 
          <ProtectedRoute>
            <StaffProfile />
          </ProtectedRoute>
        } 
        />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/roster"
            element={
              <ProtectedRoute>
                <DutyRosterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/swap-requests"
            element={
          <ProtectedRoute>
            <SwapRequestPage />
          </ProtectedRoute>
          }
          />


          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />  

                  

          <Route path="*" element={<h3>Page not found</h3>} />
        </Routes>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
