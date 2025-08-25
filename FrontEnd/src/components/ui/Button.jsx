import React from 'react';
import colores from '../../config/colores';
import { IconoCargando } from '../icons/Iconos';

/**
 * Componente de botón reutilizable con múltiples variants mejorado
 * 
 * Características:
 * - Variants predefinidos con estados disabled mejorados
 * - Estados de carga con spinner profesional
 * - Tamaños responsive (small, medium, large)
 * - Accesibilidad completa
 * - Animaciones y transiciones suaves
 * - Colores disabled más atractivos por variant
 * 
 * @param {Object} props
 * @param {string} props.variant - Estilo del botón (primary, secondary, danger, ghost)
 * @param {string} props.size - Tamaño (small, medium, large)
 * @param {boolean} props.loading - Estado de carga
 * @param {boolean} props.disabled - Botón deshabilitado
 * @param {boolean} props.fullWidth - Ancho completo
 * @param {Function} props.onClick - Manejador de click
 * @param {string} props.type - Tipo de botón (button, submit, reset)
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  children,
  ...rest
}) => {
  const configuracionVariants = {
    primary: {
      backgroundColor: colores.primario,
      color: colores.fondoAlt,
      borderColor: colores.primario,
      hoverBg: colores.primarioClaro,
      hoverBorder: colores.primarioClaro,
      // Estados disabled mejorados
      disabledBg: colores.primario + '40', // 40% opacidad
      disabledColor: colores.fondoAlt + 'CC', // 80% opacidad
      disabledBorder: colores.primario + '40'
    },
    secondary: {
      backgroundColor: colores.primario,
      color: colores.fondoAlt,
      borderColor: colores.primario,
      hoverBg: colores.primarioClaro,
      hoverBorder: colores.primarioClaro,
      // Estados disabled mejorados
      disabledBg: colores.primario + '40', // 40% opacidad
      disabledColor: colores.fondoAlt + 'CC', // 80% opacidad
      disabledBorder: colores.primario + '40'
    },
    danger: {
      backgroundColor: '#dc3545',
      color: '#ffffff',
      borderColor: '#dc3545',
      hoverBg: '#c82333',
      hoverBorder: '#c82333',
      // Estados disabled mejorados
      disabledBg: '#dc354540',
      disabledColor: '#ffffffCC',
      disabledBorder: '#dc354540'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colores.texto,
      borderColor: 'transparent',
      hoverBg: colores.fondo,
      hoverBorder: 'transparent',
      // Estados disabled mejorados
      disabledBg: 'transparent',
      disabledColor: colores.texto + '40',
      disabledBorder: 'transparent'
    }
  };

  const configuracionTamanos = {
    small: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      minHeight: '2.25rem',
      gap: '0.375rem'
    },
    medium: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      minHeight: '2.75rem',
      gap: '0.5rem'
    },
    large: {
      padding: '1rem 2rem',
      fontSize: '1.125rem',
      minHeight: '3.25rem',
      gap: '0.625rem'
    }
  };

  const variantConfig = configuracionVariants[variant] || configuracionVariants.primary;
  const sizeConfig = configuracionTamanos[size] || configuracionTamanos.medium;
  const estaDeshabilitado = disabled || loading;

  const estilosBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizeConfig.gap,
    border: `2px solid ${estaDeshabilitado ? variantConfig.disabledBorder : variantConfig.borderColor}`,
    borderRadius: '8px',
    backgroundColor: estaDeshabilitado 
      ? variantConfig.disabledBg 
      : variantConfig.backgroundColor,
    color: estaDeshabilitado 
      ? variantConfig.disabledColor 
      : variantConfig.color,
    cursor: estaDeshabilitado ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    fontWeight: '500',
    outline: 'none',
    outlineOffset: '0',
    textDecoration: 'none',
    userSelect: 'none',
    width: fullWidth ? '100%' : 'auto',
    boxSizing: 'border-box',
    
    // Aplicar configuración de tamaño
    ...sizeConfig,
    
    // Estados responsive
    '@media (maxWidth: 576px)': {
      minHeight: size === 'small' ? '2.5rem' : size === 'large' ? '3.5rem' : '3rem',
      fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1rem' : '0.9375rem'
    }
  };

  const manejarClick = (e) => {
    if (!estaDeshabilitado && onClick) {
      onClick(e);
    }
  };

  const manejarMouseEnter = (e) => {
    if (!estaDeshabilitado) {
      e.target.style.backgroundColor = variantConfig.hoverBg;
      e.target.style.borderColor = variantConfig.hoverBorder;
      e.target.style.transform = 'translateY(-1px)';
      e.target.style.boxShadow = colores.sombreado;
    }
  };

  const manejarMouseLeave = (e) => {
    if (!estaDeshabilitado) {
      e.target.style.backgroundColor = variantConfig.backgroundColor;
      e.target.style.borderColor = variantConfig.borderColor;
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    }
  };

  const manejarFocus = (e) => {
    if (!estaDeshabilitado) {
      // Usamos el color del borde del propio botón en lugar del azul predeterminado del navegador
      e.target.style.boxShadow = `0 0 0 3px ${variantConfig.borderColor}30`;
      // Aseguramos que no aparezca el outline predeterminado del navegador
      e.target.style.outline = 'none';
    }
  };

  const manejarBlur = (e) => {
    e.target.style.boxShadow = 'none';
  };

  // Agregar estilos de animación al documento (solo una vez)
  React.useEffect(() => {
    const styleId = 'button-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spinner {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
          }
          100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <button
      type={type}
      onClick={manejarClick}
      disabled={estaDeshabilitado}
      style={estilosBase}
      onMouseEnter={manejarMouseEnter}
      onMouseLeave={manejarMouseLeave}
      onFocus={manejarFocus}
      onBlur={manejarBlur}
      aria-disabled={estaDeshabilitado}
      aria-label={loading ? 'Cargando...' : undefined}
      {...rest}
    >
      {loading && (
        <IconoCargando 
          girando={true} 
          tamaño={size === 'small' ? 'sm' : 'md'} 
        />
      )}
      {children}
    </button>
  );
};

export default Button;
