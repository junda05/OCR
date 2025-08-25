import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Componente de ruta protegida
 * 
 * Características:
 * - Verifica autenticación antes de renderizar
 * - Redirige al login conservando la ubicación original
 * - Permite preservar el intento de navegación para redirección post-login
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a proteger
 */
const PrivateRoute = ({ children }) => {
  const { autenticado } = useAuth();
  const location = useLocation();

  if (!autenticado) {
    // Redirigir al login conservando la ubicación que intentaba acceder
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return children;
};

export default PrivateRoute;