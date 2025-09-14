import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute"; // <-- IMPORTA AQUI
import ServicesPage from "../pages/ServicesPage";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import SettingsPage from "../pages/SettingsPage";
import BookingPage from "../pages/BookingPage";
import AppointmentsPage from "../pages/AppointmentsPage";
import AdminLayout from '../components/AdminLayout';
export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/agendar/:slug" element={<BookingPage />} />

      {/* Rota Protegida */}
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/appointments" element={<AppointmentsPage />} />
        <Route path="/dashboard/services" element={<ServicesPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
