import React, { useState, useEffect, useCallback } from 'react';
import colores from '../../config/colores';
import { IconoExito, IconoError, IconoAdvertencia, IconoInfo } from '../icons/Iconos';
import './AlertMessage.css';

/**
 * Componente de mensajes de alerta reutilizable y mejorado
 * 
 * Características:
 * - Variants predefinidos con iconos profesionales
 * - Cierre automático opcional
 * - Botón de cierre funcional
 * - Iconos estilizados de Lucide React
 * - Animaciones suaves de entrada/salida
 * - Accesibilidad completa (ARIA roles)
 * - Gestión de estado interno para auto-cierre
 * 
 * @param {Object} props
 * @param {string} props.type - Tipo de alerta (success, error, warning, info)
 * @param {string} props.mensaje - Texto del mensaje
 * @param {boolean} props.dismissible - Permite cerrar la alerta
 * @param {Function} props.onClose - Callback al cerrar
 * @param {string} props.titulo - Título opcional
 * @param {number} props.autoCloseMs - Milisegundos para auto-cierre (0 = no auto-cierre)
 * @param {boolean} props.mostrarIcono - Mostrar icono del tipo de alerta
 */
const AlertMessage = ({
  type = 'info',
  mensaje,
  dismissible = false,
  onClose,
  titulo,
  children,
  autoCloseMs = 0,
  mostrarIcono = true
}) => {
  const [visible, setVisible] = useState(true);

  // Mover todos los hooks antes de cualquier return condicional
  const manejarCierre = useCallback(() => {
    setVisible(false);
    // Delay para permitir la animación de salida
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  }, [onClose]);

  // Auto-cierre del mensaje
  useEffect(() => {
    if (autoCloseMs > 0) {
      const timer = setTimeout(() => {
        manejarCierre();
      }, autoCloseMs);

      return () => clearTimeout(timer);
    }
  }, [autoCloseMs, manejarCierre]);

  // Return condicional después de todos los hooks
  if (!mensaje && !children) return null;

  const configuracionTipos = {
    success: {
      color: colores.exito,
      colorFondo: '#e8f5e8', // Fondo verde opaco
      ComponenteIcono: IconoExito,
      ariaLabel: 'Mensaje de éxito'
    },
    error: {
      color: colores.peligro,
      colorFondo: '#ffebee', // Fondo rojo opaco
      ComponenteIcono: IconoError,
      ariaLabel: 'Mensaje de error'
    },
    warning: {
      color: colores.advertencia,
      colorFondo: '#fff8e1', // Fondo amarillo opaco
      ComponenteIcono: IconoAdvertencia,
      ariaLabel: 'Mensaje de advertencia'
    },
    info: {
      color: colores.info,
      colorFondo: '#e3f2fd', // Fondo azul opaco
      ComponenteIcono: IconoInfo,
      ariaLabel: 'Mensaje informativo'
    }
  };

  const config = configuracionTipos[type] || configuracionTipos.info;
  const { ComponenteIcono } = config;

  if (!visible) return null;

  const estilosContenedor = {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '1rem',
    borderRadius: '8px',
    border: `1px solid ${config.color}30`,
    backgroundColor: config.colorFondo,
    marginBottom: '1rem',
    boxShadow: colores.sombreado,
    animation: visible ? 'slideIn 0.3s ease-out' : 'slideOut 0.3s ease-in',
    position: 'relative',
    maxWidth: '100%',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    // Asegurar que el fondo sea completamente opaco
    backgroundImage: 'none',
    opacity: 1,
    // Fondo sólido adicional para evitar transparencia
    backdropFilter: 'none'
  };

  const estilosIcono = {
    marginRight: '0.75rem',
    marginTop: '0.125rem',
    flexShrink: 0,
    color: config.color
  };

  const estilosContenido = {
    flex: 1,
    color: colores.texto
  };

  const estilosTitulo = {
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: config.color,
    fontSize: '1rem'
  };

  const estilosMensaje = {
    lineHeight: 1.5,
    margin: 0,
    fontSize: '0.875rem'
  };

  const estilosBotonCerrar = {
    background: 'none',
    border: 'none',
    color: config.color,
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    marginLeft: '0.5rem',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 'bold'
  };

  return (
    <div 
      style={estilosContenedor}
      role="alert"
      aria-live="polite"
      aria-label={config.ariaLabel}
      className={`alert-message alert-message--${type}`}
    >
      {mostrarIcono && (
        <div style={estilosIcono} aria-hidden="true">
          <ComponenteIcono tamaño="md" />
        </div>
      )}
      
      <div style={estilosContenido}>
        {titulo && (
          <div style={estilosTitulo}>
            {titulo}
          </div>
        )}
        
        <div style={estilosMensaje}>
          {mensaje || children}
        </div>
      </div>
      
      {dismissible && (
        <button
          type="button"
          onClick={manejarCierre}
          style={estilosBotonCerrar}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = config.color + '20';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          aria-label="Cerrar mensaje"
          title="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default AlertMessage;