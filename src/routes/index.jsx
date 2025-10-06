// src/routes/index.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Páginas
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ServicesPage from "../pages/ServicesPage";
import SettingsPage from "../pages/SettingsPage";
import BookingPage from "../pages/BookingPage";
import AppointmentsPage from "../pages/AppointmentsPage";
import PlansPage from "../pages/PlansPage"; // NOVO: Importamos a página de planos
import AdminLayout from '../components/AdminLayout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/agendar/:slug" element={<BookingPage />} />

      {/* Rotas Protegidas dentro do AdminLayout */}
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/appointments" element={<AppointmentsPage />} />
        <Route path="/dashboard/services" element={<ServicesPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/plans" element={<PlansPage />} /> {/* NOVO: Adicionamos a rota */}
      </Route>
    </Routes>
  );
}