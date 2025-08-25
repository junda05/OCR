import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthRoutes from './routes/AuthRoutes';
import PrivateRoute from './routes/PrivateRoute';
import ContenedorNotificaciones from './components/ui/ContenedorNotificaciones';
import useAuth from './hooks/useAuth';
import colores from './config/colores';

// Lazy loading para optimización de performance
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const ProcesadorPage = React.lazy(() => import('./pages/procesador/ProcesadorPage'));
const BuscadorPage = React.lazy(() => import('./pages/buscador/BuscadorPage'));

/**
 * Componente raíz de la aplicación
 * 
 * Características:
 * - Enrutamiento principal con lazy loading
 * - Separación de rutas públicas vs privadas
 * - Loading states globales
 * - Redirecciones inteligentes basadas en autenticación
 * - Sistema de notificaciones global integrado
 */
const App = () => {
  const { 
    usuario, 
    cargando, 
    notificaciones, 
    eliminarNotificacion 
  } = useAuth();

  // Loading spinner global mientras se inicializa la autenticación
  if (cargando) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      {/* Sistema de notificaciones global */}
      <ContenedorNotificaciones 
        notificaciones={notificaciones}
        onEliminar={eliminarNotificacion}
        posicion="top-right"
        maxNotificaciones={5}
      />
      
      <Routes>
        {/* Rutas públicas de autenticación */}
        <Route path="/*" element={<AuthRoutes />} />
        
        {/* Rutas privadas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <DashboardPage />
              </Suspense>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/procesador" 
          element={
            <PrivateRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <ProcesadorPage />
              </Suspense>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/buscador" 
          element={
            <PrivateRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <BuscadorPage />
              </Suspense>
            </PrivateRoute>
          } 
        />
        
        {/* Redirección por defecto */}
        <Route 
          path="/" 
          element={
            usuario ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  );
};

/**
 * Componente de loading reutilizable
 */
const LoadingSpinner = () => {
  const estilos = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: colores.fondo,
    color: colores.texto
  };

  const estilosSpinner = {
    width: '40px',
    height: '40px',
    border: `3px solid ${colores.borde}`,
    borderTop: `3px solid ${colores.primario}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  };

  const estilosTexto = {
    fontSize: '0.875rem',
    color: colores.textoSecundario
  };

  // Inyectar estilos de animación si no existen
  React.useEffect(() => {
    const styleId = 'app-spinner-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={estilos}>
      <div style={estilosSpinner}></div>
      <p style={estilosTexto}>Cargando...</p>
    </div>
  );
};

export default App;