import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import useAuth from '../hooks/useAuth';

/**
 * Rutas de autenticación (públicas)
 * 
 * Características:
 * - Redirección automática si ya está autenticado
 * - Rutas públicas accesibles sin login
 * - Fallback a login por defecto
 */
const AuthRoutes = () => {
  const { autenticado } = useAuth();

  // Si ya está autenticado, redirigir al dashboard
  if (autenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;