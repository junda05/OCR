import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import { AuthProvider } from './context/AuthContext';
import './index.css';

/**
 * Punto de entrada principal de la aplicación
 * 
 * Proveedores configurados:
 * - BrowserRouter: Enrutamiento SPA
 * - AuthProvider: Estado global de autenticación
 * 
 * Estructura de jerarquía:
 * Router > AuthProvider > App
 */

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);