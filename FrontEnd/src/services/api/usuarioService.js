import axiosClient from '../../config/axios';

/**
 * Servicio para gestión de usuarios y perfiles
 * 
 * Endpoints disponibles:
 * GET /api/v1/perfil/         -> Obtener datos del usuario autenticado
 * 
 * Funcionalidades:
 * - Obtención de perfil completo del usuario
 * - Gestión de errores específicos
 * - Manejo automático de tokens JWT
 */

const usuarioService = {
  /**
   * Obtiene los datos completos del usuario autenticado
   * 
   * @returns {Promise<Object>} Datos del usuario con estructura:
   * {
   *   id: number,
   *   username: string,
   *   email: string,
   *   first_name: string,
   *   last_name: string,
   *   fecha_registro: string,
   *   is_active: boolean
   * }
   */
  obtenerPerfil: async () => {
    try {
      const { data } = await axiosClient.get('/perfil/');
      
      if (!data.exito) {
        throw new Error(data.error || 'Error al obtener perfil');
      }
      
      return data.usuario;
    } catch (error) {
      // Manejar errores específicos
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información.');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('Error del servidor. Intenta nuevamente más tarde.');
      }
      
      // Error de red o desconocido
      throw new Error(error.message || 'Error de conexión');
    }
  },

  /**
   * Actualiza los datos del usuario autenticado (funcionalidad futura)
   * 
   * @param {Object} datosUsuario - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  actualizarPerfil: async (datosUsuario) => {
    // TODO: Implementar cuando se requiera funcionalidad de edición
    throw new Error('Funcionalidad no implementada aún');
  }
};

export default usuarioService;
