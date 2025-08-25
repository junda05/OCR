/**
 * Configuración de clientes HTTP para la aplicación
 * 
 * Estructura de timeouts:
 * - DEFAULT (30s): Operaciones normales (login, perfil, etc.)
 * - FILE_UPLOAD (5min): Subida de archivos medianos
 * - HEAVY_PROCESSING (10min): Procesamiento OCR de PDFs grandes
 * 
 * Los interceptores manejan automáticamente:
 * - Refresh de tokens JWT
 * - Headers de autorización
 * - Manejo de errores 401
 */

import axios from 'axios';
import { obtenerAccessToken, obtenerRefreshToken, guardarTokens, limpiarTokens } from '../services/utils/tokenStorage';

const API_BASE = 'http://localhost:8001/api/v1';

// Configuración de timeouts centralizada
const TIMEOUT_CONFIG = {
  DEFAULT: 30000,        // 30 segundos para operaciones normales
  FILE_UPLOAD: 300000,   // 5 minutos para subida de archivos
  HEAVY_PROCESSING: 600000 // 10 minutos para procesamiento pesado (OCR)
};

const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: TIMEOUT_CONFIG.DEFAULT,
  maxBodyLength: Infinity,
  maxContentLength: Infinity
});

// Cliente específico para operaciones pesadas (procesamiento de PDFs)
export const axiosClientLargos = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: TIMEOUT_CONFIG.HEAVY_PROCESSING, // 10 minutos para OCR
  maxBodyLength: Infinity,
  maxContentLength: Infinity
});

// Flag para evitar bucles de refresh paralelos
let solicitudRefreshEnCurso = null;

// Configurar interceptores para ambos clientes
const configurarInterceptores = (cliente) => {
  cliente.interceptors.request.use(
    (config) => {
      const access = obtenerAccessToken();
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  cliente.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;

      // Si 401 y no hemos intentado refrescar aún
      if (error.response && error.response.status === 401 && !original._retry) {
        original._retry = true;
        const refresh = obtenerRefreshToken();
        if (!refresh) {
          limpiarTokens();
          return Promise.reject(error);
        }

        try {
          // Reutilizar la misma promesa si ya hay refresh en curso
          if (!solicitudRefreshEnCurso) {
            solicitudRefreshEnCurso = axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          }
          const { data } = await solicitudRefreshEnCurso;
          solicitudRefreshEnCurso = null;

          guardarTokens({
            access: data.access,
            refresh: data.refresh ?? refresh
          });

          original.headers.Authorization = `Bearer ${data.access}`;
          return cliente(original);
        } catch (e) {
          solicitudRefreshEnCurso = null;
          limpiarTokens();
        }
      }

      return Promise.reject(error);
    }
  );
};

// Aplicar interceptores a ambos clientes
configurarInterceptores(axiosClient);
configurarInterceptores(axiosClientLargos);

// Exportar configuración de timeouts para referencia
export { TIMEOUT_CONFIG };

export default axiosClient;