import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { IconoHome, IconoSalir, IconoUsuario } from '../icons/Iconos';
import colores from '../../config/colores';

/**
 * Layout Principal del Sistema
 * 
 * Proporciona una estructura consistente para todas las páginas de la aplicación.
 * Incluye header responsive, navegación y gestión de sesión.
 * 
 * Características:
 * - Header fijo con información del usuario
 * - Navegación responsive
 * - Botón de logout profesional
 * - Breadcrumbs opcionales
 * - Fondo con gradiente
 * - Optimizado para móviles, tablets y escritorio
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido principal
 * @param {string} props.titulo - Título de la página
 * @param {string} props.subtitulo - Subtítulo opcional
 * @param {boolean} props.mostrarNavegacion - Mostrar u ocultar navegación
 * @param {Array} props.breadcrumbs - Array de breadcrumbs
 * @param {boolean} props.headerFijo - Header fijo o estático
 */
const LayoutPrincipal = ({
  children,
  titulo = 'Sistema OCR',
  subtitulo = '',
  mostrarNavegacion = true,
  breadcrumbs = [],
  headerFijo = true,
  accionesHeader = null
}) => {
  const { usuario, cerrarSesion } = useAuth();
  const { esMobile } = useResponsive();
  const navigate = useNavigate();
  const [modalLogoutAbierto, setModalLogoutAbierto] = useState(false);
  const [cargandoLogout, setCargandoLogout] = useState(false);

  const manejarLogout = async () => {
    setCargandoLogout(true);
    try {
      await cerrarSesion();
      setModalLogoutAbierto(false);
      // La redirección se maneja automáticamente por el contexto de autenticación
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setCargandoLogout(false);
    }
  };

  const abrirModalLogout = () => {
    setModalLogoutAbierto(true);
  };

  const cerrarModalLogout = () => {
    setModalLogoutAbierto(false);
  };

  const irAlDashboard = () => {
    navigate('/dashboard');
  };

  // Estilos del container principal
  const estilosContainer = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colores.fondo} 0%, #E3F2FD 100%)`,
    paddingTop: headerFijo ? (esMobile ? '6rem' : '7rem') : '0'
  };

  // Estilos del header
  const estilosHeader = {
    position: headerFijo ? 'fixed' : 'static',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(1.25rem)',
    borderBottom: `1px solid ${colores.borde}`,
    boxShadow: '0 0.25rem 1.25rem rgba(0,0,0,0.1)'
  };

  // Estilos del contenido del header
  const estilosHeaderContent = {
    maxWidth: '75rem',
    margin: '0 auto',
    padding: esMobile ? '1rem' : '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: esMobile ? 'wrap' : 'nowrap'
  };

  // Estilos del área de título
  const estilosTitulo = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: '1',
    minWidth: 0
  };

  // Estilos del área de acciones
  const estilosAcciones = {
    display: 'flex',
    alignItems: 'center',
    gap: esMobile ? '0.5rem' : '1rem',
    flexWrap: 'wrap'
  };

  // Estilos del contenido principal
  const estilosMain = {
    maxWidth: '75rem',
    margin: '0 auto',
    padding: esMobile ? '1rem' : '2rem'
  };

  // Estilos de los breadcrumbs
  const estilosBreadcrumbs = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: colores.textoSecundario
  };

  return (
    <div style={estilosContainer}>
      {/* Header */}
      <header style={estilosHeader}>
        <div style={estilosHeaderContent}>
          {/* Área de título y navegación */}
          <div style={estilosTitulo}>
            {mostrarNavegacion && (
              <Button
                variant="ghost"
                size="medium"
                onClick={irAlDashboard}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  minHeight: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent'
                }}
                title="Ir al Dashboard"
              >
                <IconoHome tamaño="md" />
              </Button>
            )}
            
            <div>
              <h1 style={{
                fontSize: esMobile ? '1.5rem' : '1.75rem',
                fontWeight: '700',
                background: colores.gradientePrincipal,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                lineHeight: 1.2
              }}>
                {titulo}
              </h1>
              {subtitulo && (
                <p style={{
                  margin: '0.25rem 0 0 0',
                  color: colores.textoSecundario,
                  fontSize: esMobile ? '0.9rem' : '1rem'
                }}>
                  {subtitulo}
                </p>
              )}
            </div>
          </div>

          {/* Área de acciones */}
          <div style={estilosAcciones}>
            {/* Información del usuario */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: `linear-gradient(135deg, ${colores.fondo}, rgba(0,84,166,0.05))`,
              borderRadius: '0.75rem',
              border: `1px solid ${colores.borde}`,
              fontSize: '0.9rem',
              color: colores.textoSecundario
            }}>
              <IconoUsuario tamaño="sm" />
              <span style={{ 
                display: esMobile ? 'none' : 'inline',
                whiteSpace: 'nowrap' 
              }}>
                {usuario?.first_name || usuario?.username || 'Usuario'}
              </span>
            </div>

            {/* Acciones personalizadas */}
            {accionesHeader}

            {/* Botón de logout */}
            <Button
              variant="danger"
              size={esMobile ? "medium" : "large"}
              onClick={abrirModalLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: '600',
                padding: esMobile ? '0.75rem' : '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 0.25rem 0.75rem rgba(220, 53, 69, 0.3)',
                border: 'none',
                background: 'linear-gradient(135deg, #dc3545, #c82333)',
                color: 'white',
                minWidth: esMobile ? 'auto' : '8.75rem',
                justifyContent: 'center'
              }}
            >
              <IconoSalir tamaño="sm" />
              {!esMobile && 'Salir'}
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={estilosMain}>
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav style={estilosBreadcrumbs}>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                {breadcrumb.enlace ? (
                  <button
                    onClick={() => navigate(breadcrumb.enlace)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colores.primario,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: 'inherit'
                    }}
                  >
                    {breadcrumb.texto}
                  </button>
                ) : (
                  <span style={{ color: colores.texto }}>
                    {breadcrumb.texto}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Contenido de la página */}
        {children}
      </main>

      {/* Modal de confirmación de logout */}
      <Modal
        abierto={modalLogoutAbierto}
        onCerrar={cerrarModalLogout}
        onConfirmar={manejarLogout}
        titulo="Cerrar Sesión"
        mensaje={`¿Estás seguro de que quieres cerrar sesión, ${usuario?.first_name || usuario?.username || 'Usuario'}?`}
        variant="danger"
        textoConfirmar="Cerrar Sesión"
        textoCancelar="Cancelar"
        cargando={cargandoLogout}
      />
    </div>
  );
};

export default LayoutPrincipal;
