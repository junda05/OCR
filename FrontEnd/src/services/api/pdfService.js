import { axiosClientLargos } from '../../config/axios';
import { 
  FILE_VALIDATION_CONFIG, 
  VALIDATION_MESSAGES, 
  validatePDFFile,
  getFileInfo,
  formatFileSize
} from '../../config/fileValidation';

/**
 * Servicio para el procesamiento de archivos PDF
 */
class PDFService {
  /**
   * Extrae texto de un archivo PDF
   * @param {File} file - Archivo PDF a procesar
   * @returns {Promise<Object>} Respuesta con el texto extraído
   */
  async extractText(file) {
    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('archivo', file);

      // Configurar headers específicos para multipart/form-data
      const response = await axiosClientLargos.post('/documentos/extraer-texto/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        maxBodyLength: FILE_VALIDATION_CONFIG.MAX_PDF_SIZE * 2, // Margen extra para headers
        maxContentLength: FILE_VALIDATION_CONFIG.MAX_PDF_SIZE * 2
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error al extraer texto del PDF:', error);
      
      let mensaje = 'Error desconocido al procesar el archivo';
      
      if (error.response) {
        // Error del servidor
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            mensaje = data.error || 'Archivo no válido o corrupto';
            break;
          case 413:
            mensaje = VALIDATION_MESSAGES.FILE_TOO_LARGE;
            break;
          case 415:
            mensaje = VALIDATION_MESSAGES.INVALID_TYPE;
            break;
          case 500:
            mensaje = VALIDATION_MESSAGES.PROCESSING_ERROR;
            break;
          default:
            mensaje = data.error || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        // Error de red
        mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        mensaje = VALIDATION_MESSAGES.TIMEOUT_ERROR;
      }

      return {
        success: false,
        error: mensaje,
        details: error.response?.data || error.message
      };
    }
  }

  /**
   * Valida si un archivo es un PDF válido
   * @param {File} file - Archivo a validar
   * @returns {Object} Resultado de la validación (compatible con versión anterior)
   */
  validatePDF(file) {
    // Usar la validación centralizada
    const result = validatePDFFile(file);
    
    // Convertir formato para mantener compatibilidad
    return {
      isValid: result.isValid,
      errors: result.isValid ? [] : [result.error]
    };
  }

  /**
   * Obtiene información básica del archivo (delegado a función centralizada)
   * @param {File} file - Archivo a analizar
   * @returns {Object} Información del archivo
   */
  getFileInfo(file) {
    return getFileInfo(file);
  }

  /**
   * Formatea el tamaño del archivo (delegado a función centralizada)
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} Tamaño formateado
   */
  formatFileSize(bytes) {
    return formatFileSize(bytes);
  }
}

// Crear instancia del servicio
const pdfServiceInstance = new PDFService();

// Exportar instancia única del servicio
export default pdfServiceInstance;
