/**
 * Configuración de validaciones para archivos
 * Este archivo centraliza todas las validaciones de archivos de la aplicación
 */

// Configuración de tamaños de archivos
export const FILE_VALIDATION_CONFIG = {
  // Tamaño máximo permitido para PDFs (en bytes)
  MAX_PDF_SIZE: 50 * 1024 * 1024, // 50MB
  
  // Tamaño máximo en MB para mostrar al usuario
  MAX_PDF_SIZE_MB: 50,
  
  // Tipos de archivo permitidos
  ALLOWED_FILE_TYPES: {
    PDF: 'application/pdf'
  },
  
  // Extensiones permitidas
  ALLOWED_EXTENSIONS: ['.pdf']
};

// Mensajes de error personalizados
export const VALIDATION_MESSAGES = {
  NO_FILE: 'No se ha seleccionado ningún archivo',
  INVALID_TYPE: 'Por favor selecciona un archivo PDF válido',
  FILE_TOO_LARGE: `El archivo es demasiado grande. Máximo ${FILE_VALIDATION_CONFIG.MAX_PDF_SIZE_MB}MB permitido`,
  PROCESSING_ERROR: 'Error al procesar el archivo',
  TIMEOUT_ERROR: 'El procesamiento está tomando demasiado tiempo (máximo 10 minutos). Intenta con un archivo más pequeño.'
};

/**
 * Valida un archivo PDF
 * @param {File} file - Archivo a validar
 * @returns {Object} - Resultado de la validación
 */
export const validatePDFFile = (file) => {
  const result = {
    isValid: true,
    error: null,
    errorTitle: null
  };

  // Verificar si se proporcionó un archivo
  if (!file) {
    result.isValid = false;
    result.error = VALIDATION_MESSAGES.NO_FILE;
    result.errorTitle = 'Archivo requerido';
    return result;
  }

  // Verificar tipo de archivo
  if (file.type !== FILE_VALIDATION_CONFIG.ALLOWED_FILE_TYPES.PDF) {
    result.isValid = false;
    result.error = VALIDATION_MESSAGES.INVALID_TYPE;
    result.errorTitle = 'Tipo de archivo inválido';
    return result;
  }

  // Verificar extensión del archivo
  const fileName = file.name.toLowerCase();
  const hasValidExtension = FILE_VALIDATION_CONFIG.ALLOWED_EXTENSIONS.some(ext => 
    fileName.endsWith(ext)
  );
  
  if (!hasValidExtension) {
    result.isValid = false;
    result.error = VALIDATION_MESSAGES.INVALID_TYPE;
    result.errorTitle = 'Extensión no válida';
    return result;
  }

  // Verificar tamaño del archivo
  if (file.size > FILE_VALIDATION_CONFIG.MAX_PDF_SIZE) {
    result.isValid = false;
    result.error = VALIDATION_MESSAGES.FILE_TOO_LARGE;
    result.errorTitle = 'Archivo muy grande';
    return result;
  }

  return result;
};

/**
 * Formatea el tamaño de un archivo en bytes a una representación legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtiene información detallada de un archivo
 * @param {File} file - Archivo a analizar
 * @returns {Object} - Información del archivo
 */
export const getFileInfo = (file) => {
  return {
    name: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type,
    lastModified: file.lastModified,
    lastModifiedDate: new Date(file.lastModified)
  };
};
