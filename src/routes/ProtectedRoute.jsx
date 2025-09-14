import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth(); // Usa o nosso hook para obter o utilizador

  // Se não houver um utilizador logado, redireciona para a página de login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Se houver um utilizador logado, mostra a página que está protegida
  return children;
}