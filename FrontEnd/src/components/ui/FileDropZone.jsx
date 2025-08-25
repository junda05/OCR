import React, { useState, useCallback } from 'react';
import colores from '../../config/colores';
import { FILE_VALIDATION_CONFIG, validatePDFFile } from '../../config/fileValidation';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  IconoPDF, 
  IconoSubir, 
  IconoError, 
  IconoExito 
} from '../icons/Iconos';

/**
 * Componente de zona de arrastrar y soltar archivos
 * 
 * Características:
 * - Drag & drop visual mejorado
 * - Animaciones fluidas
 * - Validación de tipos de archivo
 * - Feedback visual interactivo
 * - Diseño responsive
 */
const FileDropZone = ({ 
  onFileSelect, 
  acceptedTypes = FILE_VALIDATION_CONFIG.ALLOWED_EXTENSIONS, 
  maxSizeInMB = FILE_VALIDATION_CONFIG.MAX_PDF_SIZE_MB,
  disabled = false 
}) => {
  const { esMobile } = useResponsive();
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragRejected, setIsDragRejected] = useState(false);

  const validateFile = useCallback((file) => {
    // Usar validación centralizada para archivos PDF
    if (file.type === FILE_VALIDATION_CONFIG.ALLOWED_FILE_TYPES.PDF || 
        file.name.toLowerCase().endsWith('.pdf')) {
      const result = validatePDFFile(file);
      return {
        isValid: result.isValid,
        error: result.error
      };
    }
    
    // Validación genérica para otros tipos (mantener compatibilidad)
    if (!acceptedTypes.some(type => file.name.toLowerCase().endsWith(type.toLowerCase()))) {
      return { isValid: false, error: `Solo se permiten archivos: ${acceptedTypes.join(', ')}` };
    }
    
    const sizeInMB = file.size / 1024 / 1024;
    if (sizeInMB > maxSizeInMB) {
      return { isValid: false, error: `El archivo es muy grande. Máximo ${maxSizeInMB}MB` };
    }
    
    return { isValid: true };
  }, [acceptedTypes, maxSizeInMB]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const validation = validateFile(files[0]);
      setIsDragRejected(!validation.isValid);
    }
    
    setIsDragActive(true);
  }, [disabled, validateFile]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Solo desactivar si realmente salimos del área
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragActive(false);
      setIsDragRejected(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragActive(false);
    setIsDragRejected(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const validation = validateFile(files[0]);
      if (validation.isValid) {
        onFileSelect(files[0]);
      } else {
        alert(validation.error);
      }
    }
  }, [disabled, onFileSelect, validateFile]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.isValid) {
        onFileSelect(file);
      } else {
        alert(validation.error);
      }
    }
  }, [onFileSelect, validateFile]);

  const getZoneState = () => {
    if (disabled) return 'disabled';
    if (isDragRejected) return 'rejected';
    if (isDragActive) return 'active';
    return 'default';
  };

  const zoneState = getZoneState();

  const estilosZona = {
    default: {
      backgroundColor: colores.fondoAlt,
      borderColor: colores.borde,
      transform: 'scale(1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    },
    active: {
      backgroundColor: `${colores.secundario}10`,
      borderColor: colores.secundario,
      transform: 'scale(1.02)',
      boxShadow: `0 12px 40px ${colores.secundario}20`
    },
    rejected: {
      backgroundColor: `${colores.peligro}10`,
      borderColor: colores.peligro,
      transform: 'scale(0.98)',
      boxShadow: `0 8px 32px ${colores.peligro}20`
    },
    disabled: {
      backgroundColor: '#f5f5f5',
      borderColor: '#e0e0e0',
      transform: 'scale(1)',
      boxShadow: 'none',
      opacity: 0.6
    }
  };

  const estilosBase = {
    borderRadius: '20px',
    padding: esMobile ? '2rem 1rem' : '4rem 2rem',
    border: '3px dashed',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    ...estilosZona[zoneState]
  };

  const iconos = {
    default: IconoPDF,
    active: IconoSubir,
    rejected: IconoError,
    disabled: IconoError
  };

  const mensajes = {
    default: {
      titulo: 'Arrastra tu archivo PDF aquí',
      subtitulo: `O haz clic para seleccionar (máx. ${maxSizeInMB}MB)`
    },
    active: {
      titulo: '¡Suelta el archivo aquí!',
      subtitulo: 'Procesaremos tu documento PDF'
    },
    rejected: {
      titulo: 'Archivo no válido',
      subtitulo: `Solo archivos ${acceptedTypes.join(', ')} hasta ${maxSizeInMB}MB`
    },
    disabled: {
      titulo: 'Zona de carga deshabilitada',
      subtitulo: 'Funcionalidad temporalmente no disponible'
    }
  };

  return (
    <div>
      <div
        style={estilosBase}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        {/* Efecto de ondas */}
        {zoneState === 'active' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100px',
            height: '100px',
            background: `${colores.secundario}20`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 1.5s infinite',
            zIndex: 0
          }} />
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            marginBottom: '1rem',
            transition: 'all 0.3s ease',
            transform: zoneState === 'active' ? 'scale(1.2)' : 'scale(1)',
            color: zoneState === 'rejected' ? colores.peligro : colores.primario
          }}>
            {React.createElement(iconos[zoneState], { 
              tamaño: esMobile ? 'xxl' : 'xxl'
            })}
          </div>
          
          <h3 style={{
            margin: '0 0 0.5rem 0',
            color: zoneState === 'rejected' ? colores.peligro : colores.texto,
            fontSize: esMobile ? '1.2rem' : '1.5rem',
            fontWeight: '600',
            transition: 'color 0.3s ease'
          }}>
            {mensajes[zoneState].titulo}
          </h3>
          
          <p style={{
            margin: '0 0 2rem 0',
            color: zoneState === 'rejected' ? colores.peligro : colores.textoSecundario,
            fontSize: esMobile ? '0.9rem' : '1rem',
            transition: 'color 0.3s ease'
          }}>
            {mensajes[zoneState].subtitulo}
          </p>

          {!disabled && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: zoneState === 'active' 
                ? colores.secundario 
                : zoneState === 'rejected' 
                  ? colores.peligro 
                  : colores.primario,
              color: colores.fondoAlt,
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              transform: zoneState === 'active' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}>
              <IconoSubir tamaño="md" />
              Seleccionar archivo
            </div>
          )}
        </div>

        <input
          id="file-input"
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </div>

      {/* Información adicional */}
      <div style={{
        marginTop: '1rem',
        textAlign: 'center',
        color: colores.textoSecundario,
        fontSize: '0.85rem'
      }}>
        <p>
          <IconoExito tamaño="sm" /> Tipos soportados: {acceptedTypes.join(', ')} • 
          <IconoPDF tamaño="sm" /> Tamaño máximo: {maxSizeInMB}MB • 
          🔒 Tus archivos son seguros
        </p>
      </div>
    </div>
  );
};

export default FileDropZone;
