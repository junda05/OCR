import React, { useState } from 'react';
import colores from '../../config/colores';

/**
 * Campo de contraseña con toggle de visibilidad
 * 
 * Características:
 * - Botón toggle para mostrar/ocultar contraseña
 * - Iconos SVG escalables y accesibles
 * - Estados de validación visual
 * - Diseño consistente con TextField
 * - Soporte completo para lectores de pantalla
 * 
 * @param {Object} props - Mismas props que TextField + específicas
 * @param {boolean} props.showToggle - Mostrar botón de toggle (default: true)
 */
const PasswordField = ({
  name,
  id,
  placeholder = 'Contraseña',
  value = '',
  onChange,
  label = 'Contraseña',
  error,
  required = false,
  disabled = false,
  autoComplete = 'current-password',
  showToggle = true,
  ...rest
}) => {
  const [esVisible, setEsVisible] = useState(false);
  const inputId = id || name;
  const hasError = !!error;

  const toggleVisibilidad = () => {
    setEsVisible(!esVisible);
  };

  const estilosContenedor = {
    width: '100%',
    marginBottom: '3rem',
    position: 'relative',
    minHeight: '5rem' 
  };

  const estilosLabel = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: hasError ? colores.peligro : colores.texto,
    marginBottom: '0.375rem',
    transition: 'color 0.2s ease'
  };

  const estilosInputWrapper = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  };

  const estilosInput = {
    width: '100%',
    padding: showToggle ? '0.75rem 3rem 0.75rem 0.75rem' : '0.75rem',
    fontSize: '1rem',
    border: `2px solid ${hasError ? colores.peligro : colores.borde}`,
    borderRadius: '8px',
    backgroundColor: disabled ? '#f8f9fa' : colores.fondoAlt,
    color: colores.texto,
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    flexGrow: 1,
    maxWidth: '100%',
    
    // Estados responsive
    '@media (maxWidth: 576px)': {
      padding: showToggle ? '0.875rem 3rem 0.875rem 0.875rem' : '0.875rem',
      fontSize: '16px' // Evita zoom en iOS
    }
  };

  const estilosToggleButton = {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colores.textoSecundario,
    transition: 'all 0.2s ease',
    fontSize: '0',  // Ocultar texto, solo mostrar iconos
    width: '2rem',
    height: '2rem'
  };

  const estilosToggleButtonHover = {
    backgroundColor: colores.fondo,
    color: colores.texto
  };

  const estilosError = {
    fontSize: '0.75rem',
    color: colores.peligro,
    marginTop: '0.5rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    position: 'absolute',
    top: '100%',
    left: '0',
    width: '100%',
    minHeight: '1.5rem',
    zIndex: 1,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  // Iconos SVG para show/hide
  const IconoOjo = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  );

  const IconoOjoCerrado = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
    </svg>
  );

  return (
    <div style={estilosContenedor}>
      {label && (
        <label htmlFor={inputId} style={estilosLabel}>
          {label}
          {required && <span style={{ color: colores.peligro }}> *</span>}
        </label>
      )}
      
      <div style={estilosInputWrapper}>
        <input
          type={esVisible ? 'text' : 'password'}
          name={name}
          id={inputId}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          style={estilosInput}
          onFocus={(e) => {
            e.target.style.borderColor = hasError ? colores.peligro : colores.primario;
            e.target.style.boxShadow = `0 0 0 3px ${hasError ? colores.peligro + '20' : colores.primario + '20'}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = hasError ? colores.peligro : colores.borde;
            e.target.style.boxShadow = 'none';
          }}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          {...rest}
        />
        
        {showToggle && (
          <button
            type="button"
            onClick={toggleVisibilidad}
            disabled={disabled}
            style={estilosToggleButton}
            onMouseEnter={(e) => {
              if (!disabled) {
                Object.assign(e.target.style, estilosToggleButtonHover);
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = colores.textoSecundario;
            }}
            aria-label={esVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            title={esVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {esVisible ? <IconoOjoCerrado /> : <IconoOjo />}
          </button>
        )}
      </div>
      
      {hasError && (
        <div id={`${inputId}-error`} style={estilosError} role="alert">
          <span>⚠</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default PasswordField;