import React, { useState, useEffect, useCallback } from 'react';
import LayoutPrincipal from '../../components/layout/LayoutPrincipal';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import colores from '../../config/colores';
import { useResponsive } from '../../hooks/useResponsive';
import useAuth from '../../hooks/useAuth';
import documentoService from '../../services/api/documentoService';
import { 
  IconoBuscar, 
  IconoDocumento, 
  IconoEliminar, 
  IconoVer, 
  IconoCopiar,
  IconoEstadisticas,
  IconoCargando,
  IconoInfo,
  IconoPDF,
  IconoExito,
  IconoError
} from '../../components/icons/Iconos';

/**
 * Página de Búsqueda y Gestión de Documentos
 * 
 * Funcionalidades:
 * - Búsqueda de texto en documentos procesados
 * - Búsqueda global vs personal
 * - Visualización de resultados con fragmentos relevantes
 * - Gestión de documentos (ver, eliminar)
 * - Estadísticas del usuario
 * - Diseño consistente con el resto de la aplicación
 */
const BuscadorPage = () => {
  const { esMobile } = useResponsive();
  const { mostrarExito, mostrarError, mostrarInfo, usuario } = useAuth();
  
  // Estados principales
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [busquedaGlobal, setBusquedaGlobal] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [paginacion, setPaginacion] = useState(null);
  const [busquedaInfo, setBusquedaInfo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  
  // Estados de modales
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [mostrarModalDocumento, setMostrarModalDocumento] = useState(false);
  const [mostrarModalEstadisticas, setMostrarModalEstadisticas] = useState(false);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [documentoAEliminar, setDocumentoAEliminar] = useState(null);
  
  // Estado para feedback interno en modal
  const [feedbackModal, setFeedbackModal] = useState(null);

  // Estilos reutilizables siguiendo el patrón del dashboard
  const estilosCard = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: esMobile ? '1.5rem' : '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: `1px solid rgba(255,255,255,0.2)`,
    marginBottom: '1.5rem'
  };

  const estilosHeader = {
    background: colores.gradientePrincipal,
    borderRadius: '20px',
    padding: esMobile ? '2rem 1.5rem' : '3rem 2rem',
    marginBottom: '2rem',
    color: colores.fondoAlt,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,84,166,0.3)'
  };

  // Función para cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    const resultado = await documentoService.obtenerEstadisticas();
    if (resultado.success) {
      setEstadisticas(resultado.data);
    }
  }, []);

  // Efecto para aplicar estilos CSS del modal ancho
  useEffect(() => {
    if (mostrarModalDocumento) {
      const style = document.createElement('style');
      style.id = 'modal-ancho-styles';
      style.textContent = `
        [role="dialog"] {
          max-width: ${esMobile ? '95vw' : '95vw'} !important;
          width: ${esMobile ? '95vw' : '95vw'} !important;
          margin: 0 auto !important;
          overflow-x: hidden !important;
        }
        @media (min-width: 768px) {
          [role="dialog"] {
            max-width: 92vw !important;
            width: 92vw !important;
          }
        }
        @media (min-width: 1200px) {
          [role="dialog"] {
            max-width: 1600px !important;
            width: 90vw !important;
          }
        }
        [role="dialog"] * {
          box-sizing: border-box !important;
        }
        
        /* Estilos mejorados para scrollbars */
        .scroll-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 84, 166, 0.3) transparent;
          /* Asegurar que el scroll siempre esté disponible */
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        .scroll-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .scroll-container::-webkit-scrollbar-track {
          background: rgba(248, 250, 252, 0.5);
          border-radius: 4px;
        }
        
        .scroll-container::-webkit-scrollbar-thumb {
          background: rgba(0, 84, 166, 0.3);
          border-radius: 4px;
          transition: background 0.3s ease;
          /* Asegurar que el thumb sea visible */
          min-height: 20px;
        }
        
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 84, 166, 0.5);
        }
        
        .scroll-container::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        /* Asegurar que los contenedores flex permitan scroll */
        .flex-scroll-container {
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }
        
        .flex-scroll-content {
          flex: 1 !important;
          min-height: 0 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        /* Asegurar que los bordes no se corten */
        .container-with-border {
          border: 2px solid rgba(229, 231, 235, 1) !important;
          border-radius: 12px !important;
          overflow: visible !important;
          box-sizing: border-box !important;
          margin: 2px !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('modal-ancho-styles');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, [mostrarModalDocumento, esMobile]);

  // Cargar estadísticas al montar
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Función para realizar búsqueda
  const realizarBusqueda = useCallback(async (termino = terminoBusqueda, page = 1) => {
    if (!termino.trim()) {
      mostrarError('Por favor, ingresa un término de búsqueda');
      return;
    }

    setCargando(true);
    
    try {
      const resultado = await documentoService.buscarDocumentos(termino, busquedaGlobal, page);
      
      if (resultado.success) {
        setResultados(resultado.data.resultados || []);
        setPaginacion(resultado.data.paginacion || null);
        setBusquedaInfo(resultado.data.busqueda || null);
        
        if (page === 1) {
          mostrarInfo(`Se encontraron ${resultado.data.paginacion?.total_documentos || 0} documentos`);
        }
      } else {
        mostrarError(resultado.error);
        setResultados([]);
        setPaginacion(null);
        setBusquedaInfo(null);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      mostrarError('Error inesperado durante la búsqueda');
    } finally {
      setCargando(false);
    }
  }, [terminoBusqueda, busquedaGlobal, mostrarError, mostrarInfo]);

  // Función para ver documento completo
  const verDocumento = useCallback(async (documentoId, documento = null) => {
    setCargando(true);
    
    try {
      // Determinar si necesitamos acceso global
      // Si tenemos la info del documento y no es del usuario actual, usar acceso global
      const esGlobal = documento && documento.usuario_info && documento.usuario_info.username !== usuario?.username;
      
      const resultado = await documentoService.obtenerDocumento(documentoId, esGlobal);
      
      if (resultado.success) {
        setDocumentoSeleccionado(resultado.data);
        setMostrarModalDocumento(true);
      } else {
        mostrarError(resultado.error);
      }
    } catch (error) {
      console.error('Error al cargar documento:', error);
      mostrarError('Error al cargar el documento');
    } finally {
      setCargando(false);
    }
  }, [mostrarError, usuario]);

  // Función para eliminar documento
  const eliminarDocumento = useCallback(async (documentoId, nombreArchivo) => {
    setDocumentoAEliminar({ id: documentoId, nombre: nombreArchivo });
    setMostrarModalConfirmacion(true);
  }, []);

  // Función para confirmar eliminación
  const confirmarEliminacion = useCallback(async () => {
    if (!documentoAEliminar) return;

    setCargando(true);
    setMostrarModalConfirmacion(false);
    
    try {
      const resultado = await documentoService.eliminarDocumento(documentoAEliminar.id);
      
      if (resultado.success) {
        mostrarExito(`Documento "${documentoAEliminar.nombre}" eliminado exitosamente`);
        
        // Actualizar resultados
        setResultados(prev => prev.filter(doc => doc.id !== documentoAEliminar.id));
        
        // Actualizar estadísticas
        cargarEstadisticas();
      } else {
        mostrarError(resultado.error);
      }
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      mostrarError('Error al eliminar el documento');
    } finally {
      setCargando(false);
      setDocumentoAEliminar(null);
    }
  }, [documentoAEliminar, mostrarExito, mostrarError, cargarEstadisticas]);

  // Función para copiar texto al portapapeles
  const copiarTexto = useCallback(async (texto, enModal = false) => {
    try {
      await navigator.clipboard.writeText(texto);
      
      if (enModal) {
        // Mostrar feedback dentro del modal
        setFeedbackModal({
          tipo: 'success',
          mensaje: 'Texto copiado al portapapeles',
          timestamp: Date.now()
        });
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => {
          setFeedbackModal(null);
        }, 3000);
      } else {
        // Usar el sistema global de notificaciones
        mostrarExito('Texto copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error al copiar:', error);
      
      if (enModal) {
        // Mostrar error dentro del modal
        setFeedbackModal({
          tipo: 'error',
          mensaje: 'No se pudo copiar el texto',
          timestamp: Date.now()
        });
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => {
          setFeedbackModal(null);
        }, 3000);
      } else {
        // Usar el sistema global de notificaciones
        mostrarError('No se pudo copiar el texto');
      }
    }
  }, [mostrarExito, mostrarError]);

  return (
    <LayoutPrincipal>
      {/* Header con diseño consistente */}
      <div style={estilosHeader}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <IconoBuscar tamaño={esMobile ? 'lg' : 'xl'} color={colores.fondoAlt} />
          <h1 style={{
            margin: 0,
            fontSize: esMobile ? '2rem' : '2.5rem',
            fontWeight: '700'
          }}>
            Buscador de Documentos
          </h1>
        </div>
        <p style={{
          margin: 0,
          opacity: 0.95,
          fontSize: esMobile ? '1rem' : '1.2rem',
          fontWeight: '300'
        }}>
          Encuentra información rápidamente en todos tus documentos procesados
        </p>
      </div>

      {/* Estadísticas del usuario */}
      {estadisticas && (
        <div style={estilosCard}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              margin: 0,
              color: colores.texto,
              fontSize: '1.4rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <IconoEstadisticas tamaño="md" />
              Resumen de Documentos
            </h3>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => setMostrarModalEstadisticas(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: colores.gradientePrincipal,
                border: 'none',
                borderRadius: '10px',
                padding: '0.6rem 1.2rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,84,166,0.3)',
                color: colores.fondoAlt // Texto blanco explícito
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0,84,166,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,84,166,0.3)';
              }}
            >
              <IconoVer tamaño="sm" color={colores.fondoAlt} />
              Ver Detalles
            </Button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: esMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              background: `linear-gradient(135deg, ${colores.fondo}, rgba(0,84,166,0.05))`,
              borderRadius: '12px',
              border: `1px solid ${colores.borde}`,
              textAlign: 'center'
            }}>
              <div style={{ color: colores.textoSecundario, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Total Documentos
              </div>
              <div style={{ color: colores.texto, fontWeight: '600', fontSize: '1.5rem' }}>
                {estadisticas.estadisticas_generales?.total_documentos || 0}
              </div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: `linear-gradient(135deg, ${colores.fondo}, rgba(0,166,118,0.05))`,
              borderRadius: '12px',
              border: `1px solid ${colores.borde}`,
              textAlign: 'center'
            }}>
              <div style={{ color: colores.textoSecundario, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Tamaño Total
              </div>
              <div style={{ color: colores.texto, fontWeight: '600', fontSize: '1.5rem' }}>
                {estadisticas.estadisticas_generales?.total_tamaño_legible || '0 B'}
              </div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: `linear-gradient(135deg, ${colores.fondo}, rgba(255,140,0,0.05))`,
              borderRadius: '12px',
              border: `1px solid ${colores.borde}`,
              textAlign: 'center'
            }}>
              <div style={{ color: colores.textoSecundario, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Recientes (7 días)
              </div>
              <div style={{ color: colores.texto, fontWeight: '600', fontSize: '1.5rem' }}>
                {estadisticas.documentos_recientes_7_dias || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de búsqueda */}
      <div style={estilosCard}>
        <h3 style={{
          margin: '0 0 1.5rem 0',
          color: colores.texto,
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          Buscar en Documentos
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: esMobile ? 'column' : 'row',
          gap: '1rem',
          marginBottom: '1rem',
          alignItems: esMobile ? 'stretch' : 'flex-end' // Alineamos al final para que coincidan las alturas
        }}>
          <div style={{ 
            flex: esMobile ? 1 : '2', // En desktop, el campo de búsqueda ocupa 2/3 del espacio
            position: 'relative'
          }}>
            <div style={{
              position: 'relative',
              marginBottom: 0 // Removemos cualquier margin bottom
            }}>
              <input
                type="text"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                placeholder="Ingresa el texto que quieres buscar..."
                onKeyPress={(e) => e.key === 'Enter' && realizarBusqueda()}
                disabled={cargando}
                style={{
                  width: '100%',
                  padding: esMobile ? '0.875rem 1rem' : '1rem 1.25rem',
                  fontSize: esMobile ? '0.9rem' : '1rem',
                  height: esMobile ? '2.75rem' : '3.25rem', // Altura exacta del botón
                  boxSizing: 'border-box',
                  border: `2px solid ${colores.borde}`,
                  borderRadius: '12px',
                  backgroundColor: cargando ? '#f8f9fa' : colores.fondoAlt,
                  color: colores.texto,
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontWeight: '400'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colores.primario;
                  e.target.style.boxShadow = `0 0 0 3px ${colores.primario + '20'}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colores.borde;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
          <div style={{ 
            flex: esMobile ? 1 : '1', // En desktop, el botón ocupa 1/3 del espacio
            display: 'flex'
          }}>
          <Button
            onClick={() => realizarBusqueda()}
            disabled={cargando || !terminoBusqueda.trim()}
            size={esMobile ? "medium" : "large"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%', // Toma todo el ancho del contenedor
              minWidth: esMobile ? 'auto' : '200px', // Mínimo más amplio en desktop
              background: cargando || !terminoBusqueda.trim() 
                ? `linear-gradient(135deg, ${colores.primario}40, ${colores.primarioClaro}40)`
                : colores.gradientePrincipal,
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: esMobile ? '0.9rem' : '1rem',
              transition: 'all 0.3s ease',
              boxShadow: cargando || !terminoBusqueda.trim() 
                ? '0 2px 8px rgba(0,84,166,0.15)' 
                : '0 4px 15px rgba(0,84,166,0.3)',
              color: colores.fondoAlt,
              cursor: cargando || !terminoBusqueda.trim() ? 'not-allowed' : 'pointer',
              opacity: cargando || !terminoBusqueda.trim() ? 0.7 : 1,
              height: esMobile ? '2.75rem' : '3.25rem', // Altura exacta
              alignSelf: esMobile ? 'stretch' : 'flex-start',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!cargando && terminoBusqueda.trim()) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 25px rgba(0,84,166,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!cargando && terminoBusqueda.trim()) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,84,166,0.3)';
              }
            }}
          >
            {cargando ? (
              <IconoCargando tamaño="sm" />
            ) : (
              <IconoBuscar tamaño="sm" />
            )}
            {esMobile ? 'Buscar' : 'Buscar Documentos'}
          </Button>
          </div>
        </div>
        
        {/* Opción de búsqueda global */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: colores.textoSecundario,
          fontSize: '0.9rem',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={busquedaGlobal}
            onChange={(e) => setBusquedaGlobal(e.target.checked)}
            disabled={cargando}
            style={{ margin: 0 }}
          />
          Buscar en documentos de todos los usuarios (búsqueda global)
        </label>
      </div>

      {/* Información de búsqueda */}
      {busquedaInfo && (
        <div style={{
          ...estilosCard,
          background: `linear-gradient(135deg, rgba(0,84,166,0.05), rgba(255,255,255,0.95))`,
          border: `2px solid ${colores.primario}20`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <strong>Término:</strong> "{busquedaInfo.termino}" | 
              <strong> Tipo:</strong> {busquedaInfo.global ? ' Global' : ' Personal'} | 
              <strong> Resultados:</strong> {busquedaInfo.resultados_encontrados}
            </div>
            
            {paginacion && paginacion.total_paginas > 1 && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => realizarBusqueda(terminoBusqueda, paginacion.pagina_actual - 1)}
                  disabled={!paginacion.anterior || cargando}
                >
                  Anterior
                </Button>
                
                <span style={{ color: colores.textoSecundario }}>
                  Página {paginacion.pagina_actual} de {paginacion.total_paginas}
                </span>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => realizarBusqueda(terminoBusqueda, paginacion.pagina_actual + 1)}
                  disabled={!paginacion.siguiente || cargando}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resultados de búsqueda */}
      {resultados.length > 0 && (
        <div style={estilosCard}>
          <h3 style={{
            margin: '0 0 1.5rem 0',
            color: colores.texto,
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            Resultados de Búsqueda
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {resultados.map((documento) => (
              <div
                key={documento.id}
                style={{
                  padding: '1.5rem',
                  background: colores.fondo,
                  borderRadius: '12px',
                  border: `1px solid ${colores.borde}`,
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header del documento */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h4 style={{
                      margin: '0 0 0.5rem 0',
                      color: colores.texto,
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <IconoDocumento tamaño="sm" />
                      {documento.nombre_archivo}
                    </h4>
                    
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      fontSize: '0.85rem',
                      color: colores.textoSecundario
                    }}>
                      <span>Tamaño: {documento.tamaño_legible}</span>
                      <span>Método: {documento.metodo_extraccion}</span>
                      <span>Fecha: {documentoService.formatearFecha(documento.fecha_procesamiento)}</span>
                      {documento.usuario_info && (
                        <span>Por: {documento.usuario_info.username}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Botones de acción con altura consistente */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexShrink: 0,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => verDocumento(documento.id, documento)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.4rem',
                        background: `linear-gradient(135deg, ${colores.primario}, ${colores.primarioClaro})`,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,84,166,0.3)',
                        color: colores.fondoAlt,
                        height: '2.25rem', // Altura fija para consistencia
                        minWidth: '4rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,84,166,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,84,166,0.3)';
                      }}
                    >
                      <IconoVer tamaño="xs" />
                      Ver
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copiarTexto(documento.fragmento_relevante)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.4rem',
                        background: 'rgba(0,166,118,0.1)',
                        border: `2px solid ${colores.exito}`,
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        color: colores.exito,
                        transition: 'all 0.3s ease',
                        height: '2.25rem', // Altura fija para consistencia
                        minWidth: '4.5rem',
                        outline: 'none',
                        outlineOffset: '0'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = colores.exito;
                        e.target.style.color = colores.fondoAlt;
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,166,118,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0,166,118,0.1)';
                        e.target.style.color = colores.exito;
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <IconoCopiar tamaño="xs" />
                      Copiar
                    </Button>
                    
                    {/* Solo mostrar eliminar si el documento pertenece al usuario actual */}
                    {documento.usuario_info?.username === usuario?.username && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarDocumento(documento.id, documento.nombre_archivo)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.4rem',
                          background: 'rgba(220,53,69,0.1)',
                          border: `2px solid ${colores.peligro}`,
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          color: colores.peligro,
                          transition: 'all 0.3s ease',
                          height: '2.25rem', // Altura fija para consistencia
                          minWidth: '5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = colores.peligro;
                          e.target.style.color = colores.fondoAlt;
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(220,53,69,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(220,53,69,0.1)';
                          e.target.style.color = colores.peligro;
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <IconoEliminar tamaño="xs" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Fragmento relevante */}
                <div style={{
                  padding: '1rem',
                  background: 'rgba(0,84,166,0.03)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${colores.primario}`,
                  fontStyle: 'italic',
                  color: colores.textoSecundario,
                  lineHeight: 1.6
                }}>
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: documentoService.resaltarTermino(documento.fragmento_relevante, busquedaInfo?.termino)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {busquedaInfo && resultados.length === 0 && !cargando && (
        <div style={{
          ...estilosCard,
          textAlign: 'center',
          padding: '3rem 2rem'
        }}>
          <IconoBuscar tamaño="xl" color={colores.textoSecundario} />
          <h3 style={{
            margin: '1rem 0 0.5rem 0',
            color: colores.texto,
            fontSize: '1.2rem'
          }}>
            No se encontraron resultados
          </h3>
          <p style={{
            margin: 0,
            color: colores.textoSecundario
          }}>
            Intenta con otros términos de búsqueda o activa la búsqueda global
          </p>
        </div>
      )}

      {/* Modal para ver documento completo - Versión mejorada con PDF y texto lado a lado */}
      <Modal
        abierto={mostrarModalDocumento}
        onCerrar={() => {
          setMostrarModalDocumento(false);
          setDocumentoSeleccionado(null);
        }}
        titulo="Detalles del Documento"
        mostrarCancelar={true}
        textoCancelar="Cerrar"
      >
        {documentoSeleccionado && (
          <div style={{ 
            maxHeight: esMobile ? '80vh' : '85vh', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%', // Solo 100% del contenedor del modal
            maxWidth: '100%' // No exceder el ancho del modal
          }}>
            {/* Header compacto con información del documento */}
            <div style={{
              background: `linear-gradient(135deg, ${colores.fondo}, rgba(0,84,166,0.05))`,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              border: `1px solid ${colores.borde}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <IconoDocumento tamaño="md" color={colores.primario} />
                  <div>
                    <h3 style={{
                      margin: 0,
                      color: colores.texto,
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      wordBreak: 'break-word'
                    }}>
                      {documentoSeleccionado.nombre_archivo}
                    </h3>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      fontSize: '0.8rem',
                      color: colores.textoSecundario,
                      marginTop: '0.25rem'
                    }}>
                      <span>{documentoSeleccionado.tamaño_legible}</span>
                      <span>{documentoSeleccionado.metodo_extraccion === 'pypdf' ? 'Texto directo' : 'OCR'}</span>
                      <span>{documentoService.formatearFecha(documentoSeleccionado.fecha_procesamiento)}</span>
                      {documentoSeleccionado.usuario_info && (
                        <span>Por: {documentoSeleccionado.usuario_info.username}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copiarTexto(documentoSeleccionado.texto_extraido, true)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    background: 'rgba(0,166,118,0.1)',
                    border: `2px solid ${colores.exito}`,
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    color: colores.exito,
                    transition: 'all 0.3s ease',
                    height: '2.25rem',
                    minWidth: '4.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = colores.exito;
                    e.target.style.color = colores.fondoAlt;
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,166,118,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0,166,118,0.1)';
                    e.target.style.color = colores.exito;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <IconoCopiar tamaño="xs" />
                  Copiar Todo
                </Button>
              </div>
            </div>
            
            {/* Contenido principal: PDF y texto lado a lado (responsive) con mayor altura */}
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: esMobile ? '1fr' : '1fr 1fr',
              gap: '1rem',
              minHeight: esMobile ? '70vh' : '75vh',
              // Removemos maxHeight para permitir que el contenido se expanda naturalmente
              overflow: 'visible',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              padding: '4px' // Padding para evitar que los bordes se corten
            }}>
              {/* Panel izquierdo: PDF original (oculto en móvil para ahorrar espacio) */}
              {!esMobile && (
                <div 
                  className="container-with-border"
                  style={{
                    background: 'rgba(248, 250, 252, 0.8)',
                    borderRadius: '12px',
                    border: `2px solid ${colores.borde}`,
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    maxWidth: 'calc(100% - 12px)', // Ajuste para el margen
                    // Usamos la misma altura fija que el panel de texto
                    height: '75vh',
                    boxSizing: 'border-box'
                  }}>
                  <div style={{
                    padding: '1rem',
                    background: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))`,
                    borderBottom: `1px solid ${colores.borde}`,
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: colores.texto,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexShrink: 0 // Evita que el header se comprima
                  }}>
                    <IconoPDF tamaño="sm" color={colores.peligro} />
                    PDF Original
                  </div>
                  
                  <div 
                    className="scroll-container"
                    style={{
                      flex: 1,
                      minHeight: 0, // Importante para el comportamiento flex correcto
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem',
                      background: 'rgba(255,255,255,0.5)',
                      overflow: 'auto'
                    }}>
                    <div style={{ textAlign: 'center', color: colores.textoSecundario }}>
                      <IconoPDF tamaño="xxl" color={colores.textoSecundario} />
                      <p style={{ margin: '1rem 0 0 0', fontSize: '1rem' }}>
                        Vista previa del PDF no disponible
                      </p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                        El contenido se muestra como texto extraído en el panel derecho
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Panel de texto extraído (ancho completo en móvil) */}
              <div 
                className="container-with-border flex-scroll-container"
                style={{
                  background: 'rgba(248, 250, 252, 0.8)',
                  borderRadius: '12px',
                  border: `2px solid ${colores.borde}`,
                  gridColumn: esMobile ? '1' : 'auto',
                  minWidth: 0,
                  maxWidth: 'calc(100% - 12px)', // Ajuste para el margen
                  // Usamos una altura fija específica para asegurar el scroll
                  height: esMobile ? '70vh' : '75vh',
                  boxSizing: 'border-box',
                  overflow: 'visible'
                }}>
                <div style={{
                  padding: '1rem',
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))`,
                  borderBottom: `1px solid ${colores.borde}`,
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  color: colores.texto,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0 // Evita que el header se comprima
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '4px',
                      height: '16px',
                      background: colores.primario,
                      borderRadius: '2px'
                    }}></div>
                    Texto Extraído {esMobile ? '(PDF)' : ''}
                  </div>
                  <span style={{
                    background: colores.primario,
                    color: colores.fondoAlt,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {documentoSeleccionado.texto_extraido?.length || 0} caracteres
                  </span>
                </div>
                
                <div 
                  className="scroll-container flex-scroll-content"
                  style={{
                    padding: esMobile ? '1rem' : '1.5rem',
                    fontFamily: '"Segoe UI", "SF Pro Text", "Roboto", sans-serif',
                    fontSize: esMobile ? '0.85rem' : '0.9rem',
                    lineHeight: 1.7,
                    color: colores.texto,
                    whiteSpace: 'pre-wrap',
                    background: 'rgba(255,255,255,0.7)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                  {documentoSeleccionado.texto_extraido || 'No hay texto extraído disponible'}
                </div>
              </div>
            </div>
            
            {/* Footer con botones de acción más compacto */}
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '8px',
              border: `1px solid ${colores.borde}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: colores.textoSecundario,
                fontSize: '0.85rem'
              }}>
                <IconoInfo tamaño="sm" />
                <span>Scroll para navegar por el contenido completo</span>
                
                {/* Mensaje de feedback interno */}
                {feedbackModal && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    marginLeft: '0.5rem',
                    background: feedbackModal.tipo === 'success' ? 'rgba(0,166,118,0.15)' : 'rgba(220,53,69,0.15)',
                    color: feedbackModal.tipo === 'success' ? colores.exito : colores.peligro,
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    animation: 'fadeIn 0.3s ease',
                    border: `1px solid ${feedbackModal.tipo === 'success' ? colores.exito + '40' : colores.peligro + '40'}`
                  }}>
                    {feedbackModal.tipo === 'success' 
                      ? <IconoExito tamaño="xs" /> 
                      : <IconoError tamaño="xs" />
                    }
                    {feedbackModal.mensaje}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setMostrarModalDocumento(false);
                    setDocumentoSeleccionado(null);
                  }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    background: colores.primario,
                    border: `2px solid ${colores.primario}`,
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    color: colores.fondoAlt,
                    transition: 'all 0.3s ease',
                    height: '2.25rem',
                    minWidth: '4.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = colores.primarioClaro;
                    e.target.style.borderColor = colores.primarioClaro;
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 4px 12px ${colores.primario}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = colores.primario;
                    e.target.style.borderColor = colores.primario;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para estadísticas detalladas */}
      <Modal
        abierto={mostrarModalEstadisticas}
        onCerrar={() => setMostrarModalEstadisticas(false)}
        titulo="Estadísticas Detalladas"
      >
        {estadisticas && (
          <div>
            {/* Estadísticas generales */}
            <div style={{
              padding: '1rem',
              background: colores.fondo,
              borderRadius: '8px',
              marginBottom: '1rem',
              border: `1px solid ${colores.borde}`
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: colores.texto }}>
                Resumen General
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <div><strong>Total de documentos:</strong> {estadisticas.estadisticas_generales?.total_documentos || 0}</div>
                <div><strong>Tamaño total:</strong> {estadisticas.estadisticas_generales?.total_tamaño_legible || '0 B'}</div>
                <div><strong>Tiempo promedio de procesamiento:</strong> {estadisticas.estadisticas_generales?.tiempo_promedio_procesamiento || 0} segundos</div>
                <div><strong>Documentos recientes (7 días):</strong> {estadisticas.documentos_recientes_7_dias || 0}</div>
              </div>
            </div>
            
            {/* Distribución por método */}
            {estadisticas.distribucion_por_metodo && estadisticas.distribucion_por_metodo.length > 0 && (
              <div style={{
                padding: '1rem',
                background: colores.fondo,
                borderRadius: '8px',
                border: `1px solid ${colores.borde}`
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: colores.texto }}>
                  Distribución por Método de Extracción
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {estadisticas.distribucion_por_metodo.map((metodo, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        background: 'rgba(0,84,166,0.05)',
                        borderRadius: '4px'
                      }}
                    >
                      <span style={{ textTransform: 'capitalize' }}>
                        {metodo.metodo_extraccion === 'pypdf' ? 'PyPDF (Texto directo)' : 'OCR (Reconocimiento óptico)'}
                      </span>
                      <span style={{ fontWeight: '600' }}>
                        {metodo.cantidad} documento{metodo.cantidad !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de confirmación para eliminar documento */}
      <Modal
        abierto={mostrarModalConfirmacion}
        onCerrar={() => {
          setMostrarModalConfirmacion(false);
          setDocumentoAEliminar(null);
        }}
        onConfirmar={confirmarEliminacion}
        titulo="Confirmar Eliminación"
        mensaje={`¿Estás seguro de que quieres eliminar el documento "${documentoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        variant="danger"
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        cargando={cargando}
      />
    </LayoutPrincipal>
  );
};

export default BuscadorPage;
