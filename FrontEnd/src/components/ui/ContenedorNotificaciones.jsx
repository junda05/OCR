import React from 'react';
import AlertMessage from '../comunes/AlertMessage';
import { useResponsive } from '../../hooks/useResponsive';
import colores from '../../config/colores';

/**
 * Contenedor de notificaciones globales
 * 
 * Características:
 * - Posicionamiento fijo en la esquina superior derecha
 * - Stack vertical de notificaciones
 * - Responsive design
 * - Animaciones suaves
 * - Z-index alto para estar sobre otros elementos
 * - Gestión automática de overflow
 * 
 * @param {Object} props
 * @param {Array} props.notificaciones - Array de notificaciones a mostrar
 * @param {Function} props.onEliminar - Función para eliminar notificaciones
 * @param {string} props.posicion - Posición del contenedor (top-right, top-left, etc)
 * @param {number} props.maxNotificaciones - Máximo número de notificaciones visibles
 */
const ContenedorNotificaciones = ({ 
  notificaciones = [], 
  onEliminar,
  posicion = 'top-right',
  maxNotificaciones = 5
}) => {
  const { esMobile } = useResponsive();

  if (!notificaciones.length) return null;

  // Limitar el número de notificaciones visibles
  const notificacionesVisibles = notificaciones.slice(-maxNotificaciones);

  // Configuración de posiciones
  const configuracionesPosicion = {
    'top-right': {
      top: esMobile ? '1rem' : '2rem',
      right: esMobile ? '1rem' : '2rem',
      left: 'auto',
      bottom: 'auto'
    },
    'top-left': {
      top: esMobile ? '1rem' : '2rem',
      left: esMobile ? '1rem' : '2rem',
      right: 'auto',
      bottom: 'auto'
    },
    'bottom-right': {
      bottom: esMobile ? '1rem' : '2rem',
      right: esMobile ? '1rem' : '2rem',
      top: 'auto',
      left: 'auto'
    },
    'bottom-left': {
      bottom: esMobile ? '1rem' : '2rem',
      left: esMobile ? '1rem' : '2rem',
      top: 'auto',
      right: 'auto'
    }
  };

  const estilosContenedor = {
    position: 'fixed',
    ...configuracionesPosicion[posicion],
    zIndex: 9999,
    display: 'flex',
    flexDirection: posicion.startsWith('bottom') ? 'column-reverse' : 'column',
    gap: '0.75rem',
    maxWidth: esMobile ? 'calc(100vw - 2rem)' : '400px',
    minWidth: esMobile ? '280px' : '320px',
    maxHeight: '80vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    pointerEvents: 'none', // Permite clicks a través del contenedor
    // Scrollbar personalizado
    scrollbarWidth: 'thin',
    scrollbarColor: `${colores.primario}40 transparent`
  };

  const estilosWrapper = {
    pointerEvents: 'auto', // Restaura eventos para las notificaciones individuales
    animation: 'slideInNotification 0.3s ease-out',
    transformOrigin: posicion.includes('right') ? 'right' : 'left'
  };

  return (
    <>
      {/* Estilos CSS para animaciones */}
      <style>
        {`
          @keyframes slideInNotification {
            from {
              opacity: 0;
              transform: translateX(${posicion.includes('right') ? '100%' : '-100%'}) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          
          @keyframes slideOutNotification {
            from {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
            to {
              opacity: 0;
              transform: translateX(${posicion.includes('right') ? '100%' : '-100%'}) scale(0.9);
            }
          }
          
          .notification-exit {
            animation: slideOutNotification 0.3s ease-in forwards;
          }
          
          /* Scrollbar personalizado para webkit */
          .contenedor-notificaciones::-webkit-scrollbar {
            width: 4px;
          }
          
          .contenedor-notificaciones::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .contenedor-notificaciones::-webkit-scrollbar-thumb {
            background: ${colores.primario}40;
            border-radius: 2px;
          }
          
          .contenedor-notificaciones::-webkit-scrollbar-thumb:hover {
            background: ${colores.primario}60;
          }
        `}
      </style>
      
      <div 
        style={estilosContenedor}
        className="contenedor-notificaciones"
        role="region"
        aria-label="Notificaciones del sistema"
        aria-live="polite"
      >
        {notificacionesVisibles.map((notificacion) => (
          <div key={notificacion.id} style={estilosWrapper}>
            <AlertMessage
              type={notificacion.type}
              mensaje={notificacion.mensaje}
              titulo={notificacion.titulo}
              dismissible={notificacion.dismissible}
              autoCloseMs={0} // Deshabilitamos el auto-close del componente individual
              onClose={() => onEliminar(notificacion.id)}
              mostrarIcono={true}
            />
          </div>
        ))}
        
        {/* Indicador si hay más notificaciones */}
        {notificaciones.length > maxNotificaciones && (
          <div style={{
            ...estilosWrapper,
            opacity: 0.7,
            fontSize: '0.75rem',
            textAlign: 'center',
            padding: '0.5rem',
            color: colores.textoSecundario,
            background: `${colores.fondo}95`,
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colores.borde}50`
          }}>
            +{notificaciones.length - maxNotificaciones} notificación{notificaciones.length - maxNotificaciones !== 1 ? 'es' : ''} más
          </div>
        )}
      </div>
    </>
  );
};

export default ContenedorNotificaciones;
