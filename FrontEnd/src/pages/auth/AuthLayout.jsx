import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import colores from '../../config/colores';
import { useResponsive } from '../../hooks/useResponsive';
import { IconoPDF } from '../../components/icons/Iconos';

/**
 * Layout responsivo para páginas de autenticación
 * 
 * Características:
 * - Diseño adaptativo (split-screen desktop, stack mobile)
 * - Panel izquierdo con branding y descripción
 * - Panel derecho con formularios
 * - Navegación contextual entre login/registro
 * - Optimizado para mobile-first
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del formulario
 * @param {string} props.titulo - Título principal
 * @param {string} props.subtitulo - Subtítulo descriptivo
 */
const AuthLayout = ({ children, titulo, subtitulo }) => {
  const location = useLocation();
  const { esMobile } = useResponsive();
  const esLogin = location.pathname.includes('login');

  const estilosContenedor = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: esMobile ? 'column' : 'row',
    backgroundColor: colores.fondo
  };

  const estilosPanelIzquierdo = {
    flex: esMobile ? 'none' : 1,
    background: colores.gradientePrincipal,
    color: colores.fondoAlt,
    padding: esMobile ? '2rem 1.5rem' : '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    minHeight: esMobile ? '40vh' : '100vh'
  };

  const estilosPanelDerecho = {
    flex: esMobile ? 'none' : 1,
    backgroundColor: colores.fondoAlt,
    padding: esMobile ? '2rem 1.5rem' : '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minHeight: esMobile ? '60vh' : '100vh'
  };

  const estilosLogo = {
    fontSize: esMobile ? '2rem' : '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  };

  const estilosDescripcion = {
    fontSize: esMobile ? '1rem' : '1.125rem',
    lineHeight: 1.6,
    opacity: 0.95,
    maxWidth: '400px',
    marginBottom: '2rem'
  };

  const estilosFormularioContainer = {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto'
  };

  const estilosTitulo = {
    fontSize: esMobile ? '1.75rem' : '2rem',
    fontWeight: '600',
    color: colores.texto,
    marginBottom: '0.5rem',
    textAlign: 'center'
  };

  const estilosSubtitulo = {
    fontSize: esMobile ? '0.875rem' : '1rem',
    color: colores.textoSecundario,
    marginBottom: '2rem',
    textAlign: 'center',
    lineHeight: 1.5
  };

  const estilosNavegacion = {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: colores.textoSecundario
  };

  const estilosEnlace = {
    color: colores.primario,
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease'
  };

  return (
    <div style={estilosContenedor}>
      {/* Panel Izquierdo - Branding */}
      <div style={estilosPanelIzquierdo}>
        <IconoPDF tamaño="xxl" color={colores.fondo} />
        <h1 style={estilosLogo}>OCR System</h1>
        <p style={estilosDescripcion}>
          {esLogin 
            ? "Accede a tu cuenta para comenzar a digitalizar y procesar documentos con tecnología OCR avanzada."
            : "Únete a nuestra plataforma y convierte tus documentos físicos en texto digital de forma automática."
          }
        </p>
      </div>

      {/* Panel Derecho - Formulario */}
      <div style={estilosPanelDerecho}>
        <div style={estilosFormularioContainer}>
          <h2 style={estilosTitulo}>{titulo}</h2>
          {subtitulo && <p style={estilosSubtitulo}>{subtitulo}</p>}
          
          {children}
          
          {/* Navegación entre páginas */}
          <div style={estilosNavegacion}>
            {esLogin ? (
              <>
                ¿No tienes una cuenta?{' '}
                <Link 
                  to="/register" 
                  style={estilosEnlace}
                  onMouseEnter={(e) => e.target.style.color = colores.primarioClaro}
                  onMouseLeave={(e) => e.target.style.color = colores.primario}
                >
                  Regístrate aquí
                </Link>
              </>
            ) : (
              <>
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  to="/login" 
                  style={estilosEnlace}
                  onMouseEnter={(e) => e.target.style.color = colores.primarioClaro}
                  onMouseLeave={(e) => e.target.style.color = colores.primario}
                >
                  Inicia sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;