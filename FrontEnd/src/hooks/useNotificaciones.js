import { useState, useCallback, useRef } from 'react';

/**
 * Hook para gestión centralizada de notificaciones
 * 
 * Características:
 * - Gestión de múltiples notificaciones simultáneas
 * - Auto-cierre configurable por notificación
 * - Funciones utilitarias para casos comunes
 * - Sistema de IDs únicos para control granular
 * - Cleanup automático para prevenir memory leaks
 * 
 * @returns {Object} - API de notificaciones
 */
const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const contadorId = useRef(0);
  const timersRef = useRef(new Map());

  /**
   * Genera un ID único para cada notificación
   */
  const generarId = useCallback(() => {
    contadorId.current += 1;
    return `notificacion_${contadorId.current}_${Date.now()}`;
  }, []);

  /**
   * Elimina una notificación específica
   * 
   * @param {string} id - ID de la notificación a eliminar
   */
  const eliminarNotificacion = useCallback((id) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
    
    // Limpiar timer si existe
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  /**
   * Añade una nueva notificación
   * 
   * @param {Object} notificacion - Configuración de la notificación
   * @param {string} notificacion.type - Tipo (success, error, warning, info)
   * @param {string} notificacion.mensaje - Mensaje principal
   * @param {string} notificacion.titulo - Título opcional
   * @param {number} notificacion.autoCloseMs - Tiempo de auto-cierre (0 = manual)
   * @param {boolean} notificacion.dismissible - Permite cierre manual
   * @returns {string} - ID de la notificación creada
   */
  const agregarNotificacion = useCallback((notificacion) => {
    const id = generarId();
    const nuevaNotificacion = {
      id,
      type: 'info',
      dismissible: true,
      autoCloseMs: 5000, // 5 segundos por defecto
      ...notificacion,
      fechaCreacion: new Date()
    };

    setNotificaciones(prev => [...prev, nuevaNotificacion]);

    // Configurar auto-cierre si está habilitado
    if (nuevaNotificacion.autoCloseMs > 0) {
      const timer = setTimeout(() => {
        eliminarNotificacion(id);
      }, nuevaNotificacion.autoCloseMs);
      
      timersRef.current.set(id, timer);
    }

    return id;
  }, [generarId, eliminarNotificacion]);

  /**
   * Elimina todas las notificaciones
   */
  const limpiarNotificaciones = useCallback(() => {
    // Limpiar todos los timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
    
    setNotificaciones([]);
  }, []);

  /**
   * Funciones utilitarias para tipos específicos
   */
  const mostrarExito = useCallback((mensaje, opciones = {}) => {
    return agregarNotificacion({
      type: 'success',
      mensaje,
      autoCloseMs: 4000,
      ...opciones
    });
  }, [agregarNotificacion]);

  const mostrarError = useCallback((mensaje, opciones = {}) => {
    return agregarNotificacion({
      type: 'error',
      mensaje,
      autoCloseMs: 7000, // Errores duran más
      ...opciones
    });
  }, [agregarNotificacion]);

  const mostrarAdvertencia = useCallback((mensaje, opciones = {}) => {
    return agregarNotificacion({
      type: 'warning',
      mensaje,
      autoCloseMs: 5000,
      ...opciones
    });
  }, [agregarNotificacion]);

  const mostrarInfo = useCallback((mensaje, opciones = {}) => {
    return agregarNotificacion({
      type: 'info',
      mensaje,
      autoCloseMs: 4000,
      ...opciones
    });
  }, [agregarNotificacion]);

  /**
   * Funciones para casos específicos de la aplicación
   */
  const notificarRegistroExitoso = useCallback((opciones = {}) => {
    return mostrarExito(
      'Tu cuenta ha sido creada exitosamente. Redirigiendo al login...',
      {
        titulo: '¡Registro Completado!',
        autoCloseMs: 3000,
        ...opciones
      }
    );
  }, [mostrarExito]);

  const notificarLoginExitoso = useCallback((nombreUsuario = '', opciones = {}) => {
    return mostrarExito(
      `¡Bienvenido${nombreUsuario ? ` ${nombreUsuario}` : ''}! Accediendo al dashboard...`,
      {
        titulo: 'Sesión Iniciada',
        autoCloseMs: 2000,
        ...opciones
      }
    );
  }, [mostrarExito]);

  const notificarProcesoPDF = useCallback((fase, opciones = {}) => {
    const mensajes = {
      cargando: 'Subiendo archivo PDF...',
      procesando: 'Extrayendo texto del documento...',
      completado: 'Texto extraído exitosamente',
      error: 'Error al procesar el archivo PDF'
    };

    const tipos = {
      cargando: 'info',
      procesando: 'info', 
      completado: 'success',
      error: 'error'
    };

    return agregarNotificacion({
      type: tipos[fase] || 'info',
      mensaje: mensajes[fase] || fase,
      autoCloseMs: fase === 'completado' ? 3000 : 5000,
      ...opciones
    });
  }, [agregarNotificacion]);

  /**
   * Estadísticas útiles para debugging
   */
  const estadisticas = {
    total: notificaciones.length,
    porTipo: notificaciones.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {}),
    timersActivos: timersRef.current.size
  };

  return {
    // Estado
    notificaciones,
    
    // Operaciones principales
    agregarNotificacion,
    eliminarNotificacion,
    limpiarNotificaciones,
    
    // Funciones utilitarias
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    mostrarInfo,
    
    // Funciones específicas de la app
    notificarRegistroExitoso,
    notificarLoginExitoso,
    notificarProcesoPDF,
    
    // Utilidades
    estadisticas
  };
};

export default useNotificaciones;
