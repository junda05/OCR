import React, { useEffect, useRef } from 'react';
import colores from '../../config/colores';
import './TextField.css';


const TextField = ({
  type = 'text',
  name,
  id,
  placeholder,
  value = '',
  onChange,
  label,
  error,
  required = false,
  disabled = false,
  autoComplete,
  ...rest
}) => {
  const inputRef = useRef(null);
  const inputId = id || name;
  const hasError = !!error;

  // Actualizar estilos inmediatamente cuando cambie el estado de error
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      // Solo actualizar si el input tiene el foco
      if (hasError) {
        input.style.borderColor = colores.peligro;
        input.style.boxShadow = `0 0 0 3px ${colores.peligro + '20'}`;
      } else {
        input.style.borderColor = colores.primario;
        input.style.boxShadow = `0 0 0 3px ${colores.primario + '20'}`;
      }
    }
  }, [hasError]);

  const estilosContenedor = {
    width: '100%',
    marginBottom: '2rem',
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

  const estilosInput = {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: `2px solid ${hasError ? colores.peligro : colores.borde}`,
    borderRadius: '8px',
    backgroundColor: disabled ? '#f8f9fa' : colores.fondoAlt,
    color: colores.texto,
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    minWidth: '0'
  };

  const inputClassName = `text-field-input ${hasError ? 'error' : ''}`;

  const estilosError = {
    fontSize: '0.75rem',
    color: colores.peligro,
    marginTop: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    position: 'absolute',
    top: '100%',
    left: '0',
    width: '100%',
    minHeight: '1.25rem',
    zIndex: 1
  };

  return (
    <div style={estilosContenedor}>
      {label && (
        <label htmlFor={inputId} style={estilosLabel}>
          {label}
          {required && <span style={{ color: colores.peligro }}> *</span>}
        </label>
      )}
      
      <input
        ref={inputRef}
        type={type}
        name={name}
        id={inputId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={inputClassName}
        style={estilosInput}
        onFocus={(e) => {
          if (hasError) {
            e.target.style.borderColor = colores.peligro;
            e.target.style.boxShadow = `0 0 0 3px ${colores.peligro + '20'}`;
          } else {
            e.target.style.borderColor = colores.primario;
            e.target.style.boxShadow = `0 0 0 3px ${colores.primario + '20'}`;
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = hasError ? colores.peligro : colores.borde;
          e.target.style.boxShadow = 'none';
        }}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        {...rest}
      />
      
      {hasError && (
        <div id={`${inputId}-error`} style={estilosError} role="alert">
          <span style={{ 
            color: colores.peligro, 
            fontWeight: 'bold',
            userSelect: 'none',
            outline: 'none'
          }}>
            ⚠
          </span>
          {error}
        </div>
      )}
    </div>
  );
};

export default TextField;