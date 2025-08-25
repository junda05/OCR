import axiosClient, { axiosClientLargos } from '../../config/axios';

/**
 * Servicio para gestión y búsqueda de documentos procesados
 * 
 * Funcionalidades:
 * - Búsqueda de texto en documentos
 * - Listado y gestión de documentos del usuario
 * - Estadísticas y métricas
 * - Eliminación de documentos
 */
class DocumentoService {
  
  /**
   * Busca texto en documentos
   * @param {string} termino - Término de búsqueda
   * @param {boolean} global - Si buscar en todos los documentos o solo del usuario
   * @param {number} page - Página de resultados
   * @param {number} pageSize - Tamaño de página
   * @returns {Promise<Object>} Resultados de búsqueda paginados
   */
  async buscarDocumentos(termino, global = false, page = 1, pageSize = 10) {
    try {
      const params = new URLSearchParams({
        q: termino,
        global: global.toString(),
        page: page.toString(),
        page_size: pageSize.toString()
      });

      const response = await axiosClient.get(`/documentos/buscar/?${params}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error al buscar documentos:', error);
      
      let mensaje = 'Error desconocido en la búsqueda';
      if (error.response?.data?.error) {
        mensaje = error.response.data.error;
      } else if (error.message) {
        mensaje = error.message;
      }
      
      return {
        success: false,
        error: mensaje,
        details: error.response?.data || error.message
      };
    }
  }

  /**
   * Obtiene la lista de documentos del usuario
   * @param {Object} filtros - Filtros opcionales
   * @returns {Promise<Object>} Lista paginada de documentos
   */
  async listarDocumentos(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Añadir filtros si existen
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await axiosClient.get(`/documentos/?${params}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error al listar documentos:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cargar documentos',
        details: error.response?.data || error.message
      };
    }
  }

  /**
   * Obtiene detalles completos de un documento
   * @param {number} documentoId - ID del documento
   * @param {boolean} esGlobal - Si es acceso global (para documentos de otros usuarios)
   * @returns {Promise<Object>} Detalles del documento
   */
  async obtenerDocumento(documentoId, esGlobal = false) {
    try {
      const endpoint = esGlobal ? `/documentos/global/${documentoId}/` : `/documentos/${documentoId}/`;
      const response = await axiosClient.get(endpoint);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error al obtener documento:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cargar documento',
        details: error.response?.data || error.message
      };
    }
  }

  /**
   * Elimina un documento (soft delete)
   * @param {number} documentoId - ID del documento a eliminar
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async eliminarDocumento(documentoId) {
    try {
      const response = await axiosClient.delete(`/documentos/${documentoId}/eliminar/`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Error al eliminar documento',
        details: error.response?.data || error.message
      };
    }
  }

  /**
   * Obtiene estadísticas del usuario
   * @returns {Promise<Object>} Estadísticas de documentos
   */
  async obtenerEstadisticas() {
    try {
      const response = await axiosClient.get('/documentos/estadisticas/');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cargar estadísticas',
        details: error.response?.data || error.message
      };
    }
  }

  /**
   * Formatea el tamaño de archivo para mostrar
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} Tamaño formateado
   */
  formatearTamaño(bytes) {
    if (!bytes) return '0 B';
    
    const unidades = ['B', 'KB', 'MB', 'GB'];
    let tamaño = bytes;
    let unidadIndex = 0;
    
    while (tamaño >= 1024 && unidadIndex < unidades.length - 1) {
      tamaño /= 1024;
      unidadIndex++;
    }
    
    return `${tamaño.toFixed(1)} ${unidades[unidadIndex]}`;
  }

  /**
   * Formatea fecha para mostrar
   * @param {string} fechaISO - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  formatearFecha(fechaISO) {
    if (!fechaISO) return 'N/A';
    
    const fecha = new Date(fechaISO);
    const opciones = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  /**
   * Resalta términos de búsqueda en texto
   * @param {string} texto - Texto original
   * @param {string} termino - Término a resaltar
   * @returns {string} Texto con términos resaltados
   */
  resaltarTermino(texto, termino) {
    if (!texto || !termino) return texto;
    
    const regex = new RegExp(`(${termino})`, 'gi');
    return texto.replace(regex, '<mark>$1</mark>');
  }
}

// Crear instancia única del servicio
const documentoService = new DocumentoService();

// Exportar instancia
export default documentoService;
