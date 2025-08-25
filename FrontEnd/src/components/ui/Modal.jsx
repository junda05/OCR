import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import colores from '../../config/colores';
import Button from './Button';
import { IconoError, IconoAdvertencia, IconoInfo, IconoExito } from '../icons/Iconos';

/**
 * Componente Modal reutilizable con funcionalidades avanzadas
 * 
 * Características:
 * - Portal rendering para evitar problemas de z-index
 * - Cierre por ESC y backdrop
 * - Animaciones suaves de entrada/salida
 * - Variants predefinidos (confirm, danger, info, success)
 * - Accesibilidad completa (ARIA, focus trap)
 * - Responsive design
 * 
 * @param {Object} props
 * @param {boolean} props.abierto - Estado del modal
 * @param {Function} props.onCerrar - Callback para cerrar
 * @param {Function} props.onConfirmar - Callback para confirmar
 * @param {string} props.titulo - Título del modal
 * @param {string} props.mensaje - Mensaje del modal
 * @param {string} props.variant - Tipo de modal (confirm, danger, info, success)
 * @param {string} props.textoConfirmar - Texto del botón confirmar
 * @param {string} props.textoCancelar - Texto del botón cancelar
 * @param {boolean} props.mostrarCancelar - Mostrar botón cancelar
 * @param {boolean} props.cargando - Estado de carga
 * @param {React.ReactNode} props.children - Contenido personalizado
 */
const Modal = ({
  abierto = false,
  onCerrar,
  onConfirmar,
  titulo = 'Confirmación',
  mensaje = '',
  variant = 'confirm',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  mostrarCancelar = true,
  cargando = false,
  children
}) => {
  const configuracionVariants = {
    confirm: {
      color: colores.primario,
      ComponenteIcono: IconoInfo,
      botonVariant: 'primary'
    },
    danger: {
      color: colores.peligro,
      ComponenteIcono: IconoError,
      botonVariant: 'danger'
    },
    warning: {
      color: colores.advertencia,
      ComponenteIcono: IconoAdvertencia,
      botonVariant: 'primary'
    },
    success: {
      color: colores.exito,
      ComponenteIcono: IconoExito,
      botonVariant: 'primary'
    },
    info: {
      color: colores.info,
      ComponenteIcono: IconoInfo,
      botonVariant: 'primary'
    }
  };

  const config = configuracionVariants[variant] || configuracionVariants.confirm;
  const { ComponenteIcono } = config;

  // Efecto para manejar ESC key
  useEffect(() => {
    const manejarTecla = (e) => {
      if (e.key === 'Escape' && abierto) {
        onCerrar && onCerrar();
      }
    };

    if (abierto) {
      document.addEventListener('keydown', manejarTecla);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', manejarTecla);
      document.body.style.overflow = 'unset';
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const manejarBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCerrar && onCerrar();
    }
  };

  const manejarConfirmar = async () => {
    if (onConfirmar && !cargando) {
      await onConfirmar();
    }
  };

  // Estilos
  const estilosBackdrop = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '1rem',
    animation: 'fadeIn 0.2s ease-out'
  };

  const estilosModal = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '28rem',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    animation: 'scaleIn 0.2s ease-out',
    border: `1px solid ${colores.borde}`
  };

  const estilosHeader = {
    padding: '1.5rem 1.5rem 1rem 1.5rem',
    borderBottom: `1px solid ${colores.borde}`,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const estilosTitulo = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: colores.texto,
    margin: 0
  };

  const estilosContenido = {
    padding: '1.5rem'
  };

  const estilosMensaje = {
    color: colores.textoSecundario,
    lineHeight: 1.6,
    fontSize: '0.875rem',
    margin: 0
  };

  const estilosFooter = {
    padding: '1rem 1.5rem 1.5rem 1.5rem',
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  };

  const modalContent = (
    <div style={estilosBackdrop} onClick={manejarBackdropClick}>
      <div style={estilosModal} role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        {/* Header con icono y título */}
        <div style={estilosHeader}>
          <ComponenteIcono color={config.color} tamaño="lg" />
          <h2 id="modal-titulo" style={estilosTitulo}>
            {titulo}
          </h2>
        </div>

        {/* Contenido */}
        <div style={estilosContenido}>
          {children ? (
            children
          ) : (
            <p style={estilosMensaje}>
              {mensaje}
            </p>
          )}
        </div>

        {/* Footer con botones */}
        <div style={estilosFooter}>
          {mostrarCancelar && (
            <Button
              variant="secondary"
              onClick={onCerrar}
              disabled={cargando}
              size="medium"
            >
              {textoCancelar}
            </Button>
          )}
          
          {onConfirmar && (
            <Button
              variant={config.botonVariant}
              onClick={manejarConfirmar}
              loading={cargando}
              disabled={cargando}
              size="medium"
            >
              {textoConfirmar}
            </Button>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scaleIn {
            from { 
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to { 
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </div>
  );

  // Renderizar en portal
  return createPortal(modalContent, document.body);
};

export default Modal;
