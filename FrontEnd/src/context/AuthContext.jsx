import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import authService from '../services/api/authService';
import { obtenerUsuario, limpiarTokens, obtenerTokens } from '../services/utils/tokenStorage';
import useNotificaciones from '../hooks/useNotificaciones';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => obtenerUsuario());
  const [cargando, setCargando] = useState(false);
  const [inicializando, setInicializando] = useState(true); // Nuevo estado
  const [errorAuth, setErrorAuth] = useState(null);
  
  // Hook de notificaciones integrado
  const notificaciones = useNotificaciones();

  const iniciarSesion = useCallback(async (username, password) => {
    setCargando(true);
    setErrorAuth(null);
    try {
      const data = await authService.login(username, password);
      const userData = data.user || { username };
      setUsuario(userData);
      
      // Mostrar notificación de éxito
      notificaciones.notificarLoginExitoso(userData.first_name || userData.username);
      
      return { ok: true };
    } catch (e) {
      const errorMsg = e.response?.data?.detail || 
                       e.response?.data?.non_field_errors?.[0] || 
                       'Error de autenticación';
      setErrorAuth(e.response?.data || errorMsg);
      
      // Mostrar notificación de error
      notificaciones.mostrarError(errorMsg, {
        titulo: 'Error de autenticación'
      });
      
      return { ok: false, error: e };
    } finally {
      setCargando(false);
    }
  }, [notificaciones]);

  const registrar = useCallback(async (formData) => {
    setCargando(true);
    setErrorAuth(null);
    try {
      const data = await authService.registrar(formData);
      
      return { ok: true, data };
    } catch (e) {
      const errorData = e.response?.data || 'Error al registrar';
      setErrorAuth(errorData);
      
      // Mostrar notificación de error específica
      const errorMsg = typeof errorData === 'string' 
        ? errorData 
        : errorData.non_field_errors?.[0] || 'Error al crear la cuenta';
        
      notificaciones.mostrarError(errorMsg, {
        titulo: 'Error en el registro'
      });
      
      return { ok: false, error: e };
    } finally {
      setCargando(false);
    }
  }, [notificaciones]);

  const cerrarSesion = useCallback(async () => {
    setCargando(true);
    try {
      await authService.logout();
      notificaciones.mostrarInfo('Sesión cerrada exitosamente', {
        autoCloseMs: 2000
      });
    } catch (error) {
      // Log del error pero no fallar el logout del lado cliente
      console.warn('Error en logout del servidor:', error.message);
    } finally {
      limpiarTokens();
      setUsuario(null);
      setCargando(false);
    }
  }, [notificaciones]);

  const cargarSesionInicial = useCallback(async () => {
    setInicializando(true);
    try {
      const tokens = obtenerTokens();
      if (tokens?.user && tokens?.access) {
        // Verificar si tenemos datos completos del usuario
        const usuario = tokens.user;
        
        // Si solo tenemos username, intentar cargar datos completos
        if (usuario.username && !usuario.email && !usuario.first_name) {
          try {
            const datosCompletos = await authService.actualizarDatosUsuario();
            setUsuario(datosCompletos);
          } catch (error) {
            // Si falla, usar datos básicos que tenemos
            console.warn('No se pudieron cargar datos completos:', error);
            setUsuario(usuario);
          }
        } else {
          // Ya tenemos datos completos
          setUsuario(usuario);
        }
      }
    } catch (error) {
      console.error('Error al cargar sesión inicial:', error);
      // En caso de error, limpiar tokens corruptos
      limpiarTokens();
    } finally {
      setInicializando(false);
    }
  }, []);

  useEffect(() => {
    cargarSesionInicial();
  }, [cargarSesionInicial]);

  const valor = useMemo(() => ({
    usuario,
    cargando: cargando || inicializando, // Incluir inicializando en cargando
    errorAuth,
    iniciarSesion,
    registrar,
    cerrarSesion,
    autenticado: !!usuario,
    inicializando,
    // Incluir las notificaciones en el contexto
    notificaciones: notificaciones.notificaciones,
    eliminarNotificacion: notificaciones.eliminarNotificacion,
    limpiarNotificaciones: notificaciones.limpiarNotificaciones,
    // Funciones utilitarias de notificación
    mostrarExito: notificaciones.mostrarExito,
    mostrarError: notificaciones.mostrarError,
    mostrarAdvertencia: notificaciones.mostrarAdvertencia,
    mostrarInfo: notificaciones.mostrarInfo
  }), [usuario, cargando, inicializando, errorAuth, iniciarSesion, registrar, cerrarSesion, notificaciones]);

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;