import axiosClient from '../../config/axios';
import { guardarTokens, limpiarTokens, obtenerRefreshToken, obtenerTokens } from '../utils/tokenStorage';
import usuarioService from './usuarioService';

/**
 * Servicio de autenticación para manejo de usuarios
 * 
 * Endpoints:
 * POST /api/v1/auth/login/        -> { access, refresh }
 * POST /api/v1/auth/refresh/      -> { access, refresh? }
 * POST /api/v1/auth/logout/       -> blacklist refresh token
 * POST /api/v1/crear/             -> registro de usuario
 * GET  /api/v1/perfil/            -> datos del usuario
 */

const authService = {
  /**
   * Inicia sesión y obtiene los datos completos del usuario
   * 
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Datos de login con usuario completo
   */
  login: async (username, password) => {
    try {
      // 1. Obtener tokens
      const { data: tokenData } = await axiosClient.post('/auth/login/', { 
        username, 
        password 
      });
      
      // 2. Guardar tokens temporalmente para hacer la petición del perfil
      guardarTokens({
        access: tokenData.access,
        refresh: tokenData.refresh,
        user: { username } // Usuario temporal
      });
      
      // 3. Obtener datos completos del usuario
      const datosUsuarioCompletos = await usuarioService.obtenerPerfil();
      
      // 4. Guardar tokens con datos completos del usuario
      guardarTokens({
        access: tokenData.access,
        refresh: tokenData.refresh,
        user: datosUsuarioCompletos
      });
      
      return {
        ...tokenData,
        user: datosUsuarioCompletos
      };
    } catch (error) {
      // Si falla la obtención del perfil, limpiar tokens
      limpiarTokens();
      throw error;
    }
  },

  /**
   * Registra un nuevo usuario
   * 
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise<Object>} Respuesta del registro
   */
  registrar: async ({ username, email, password, password_confirm, first_name, last_name }) => {
    const payload = { 
      username, 
      email, 
      password, 
      password_confirm, 
      first_name, 
      last_name 
    };
    const { data } = await axiosClient.post('/crear/', payload);
    return data;
  },

  /**
   * Cierra sesión invalidando el refresh token
   * 
   * La vista TokenBlacklistView de DRF Simple JWT requiere el refresh token
   * en el body de la petición para invalidarlo correctamente.
   */
  logout: async () => {
    try {
      const refreshToken = obtenerRefreshToken();
      
      if (refreshToken) {
        // Enviar refresh token para invalidarlo en el servidor
        await axiosClient.post('/auth/logout/', {
          refresh: refreshToken
        });
      }
    } catch (error) {
      // Log del error para debugging, pero no fallar el logout
      console.warn('Error al invalidar token en servidor:', error.message);
      
      // Si es error 400, probablemente el token ya estaba invalidado
      if (error.response?.status !== 400) {
        console.error('Error inesperado en logout:', error);
      }
    } finally {
      // Siempre limpiar tokens del localStorage
      limpiarTokens();
    }
  },

  /**
   * Actualiza los datos del usuario en el localStorage
   * Útil después de editar el perfil
   * 
   * @returns {Promise<Object>} Datos actualizados del usuario
   */
  actualizarDatosUsuario: async () => {
    try {
      const datosActualizados = await usuarioService.obtenerPerfil();
      
      // Mantener tokens existentes, solo actualizar datos del usuario
      const tokensActuales = obtenerTokens();
      if (tokensActuales) {
        guardarTokens({
          ...tokensActuales,
          user: datosActualizados
        });
      }
      
      return datosActualizados;
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      throw error;
    }
  }
};

export default authService;