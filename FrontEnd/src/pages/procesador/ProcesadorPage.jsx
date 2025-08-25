import React, { useState, useRef, useCallback } from 'react';
import LayoutPrincipal from '../../components/layout/LayoutPrincipal';
import Button from '../../components/ui/Button';
import colores from '../../config/colores';
import { validatePDFFile } from '../../config/fileValidation';
import { useResponsive } from '../../hooks/useResponsive';
import useAuth from '../../hooks/useAuth';
import pdfService from '../../services/api/pdfService';
// Importar iconos del sistema centralizado
import { 
  IconoSubir, 
  IconoDescargar, 
  IconoCopiar, 
  IconoVer, 
  IconoPDF,
  IconoBuscar,
  IconoActualizar,
  IconoCargando
} from '../../components/icons/Iconos';

/**
 * Página del Procesador OCR - Extracción de texto de PDF
 * 
 * Funcionalidades:
 * - Carga de archivos PDF con drag & drop profesional
 * - Vista previa del PDF integrada
 * - Extracción y visualización de texto optimizada
 * - Interfaz moderna y unificada con el dashboard
 * - Notificaciones integradas para feedback del usuario
 * - Iconos profesionales consistentes
 * - Estados de carga y feedback visual mejorados
 */
const ProcesadorPage = () => {
  const { esMobile, esTablet } = useResponsive();
  const { mostrarExito, mostrarError, mostrarInfo } = useAuth();
  const fileInputRef = useRef(null);
  
  // Para ocultar vista previa en móviles y tablets
  const ocultarVistaPrevia = esMobile || esTablet;
  
  // Estados principales
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  // Manejo de archivos
  const procesarArchivo = useCallback((archivo) => {
    if (!archivo) return;

    // Usar validación centralizada
    const validationResult = validatePDFFile(archivo);
    
    if (!validationResult.isValid) {
      mostrarError(validationResult.error, {
        titulo: validationResult.errorTitle
      });
      return;
    }

    setSelectedFile(archivo);
    setExtractedText('');
    
    // Crear vista previa
    const fileURL = URL.createObjectURL(archivo);
    setPdfPreview(fileURL);
    
    mostrarInfo(`Archivo "${archivo.name}" cargado correctamente`, {
      autoCloseMs: 3000
    });
  }, [mostrarError, mostrarInfo]);

  // Manejo de drag & drop
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      procesarArchivo(files[0]);
    }
  }, [procesarArchivo]);

  // Selección de archivo
  const handleFileSelect = useCallback((e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      procesarArchivo(archivo);
    }
  }, [procesarArchivo]);

  // Extracción de texto
  const extraerTexto = useCallback(async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    mostrarInfo('Procesando documento PDF...', {
      titulo: 'Extrayendo texto'
    });

    try {
      const resultado = await pdfService.extractText(selectedFile);
      
      if (resultado.success) {
        setExtractedText(resultado.data.texto_extraido);
        
        mostrarExito(
          `Texto extraído exitosamente usando método: ${resultado.data.metodo}`,
          {
            titulo: 'Extracción completada',
            autoCloseMs: 4000
          }
        );
      } else {
        throw new Error(resultado.error);
      }
    } catch (error) {
      console.error('Error extrayendo texto:', error);
      mostrarError(
        error.response?.data?.error || 'Error al procesar el documento',
        {
          titulo: 'Error en la extracción'
        }
      );
    } finally {
      setIsExtracting(false);
    }
  }, [selectedFile, mostrarInfo, mostrarExito, mostrarError]);

  // Copiar texto
  const copiarTexto = useCallback(async () => {
    if (!extractedText) return;

    try {
      await navigator.clipboard.writeText(extractedText);
      setTextCopied(true);
      mostrarExito('Texto copiado al portapapeles', {
        autoCloseMs: 2000
      });
      
      setTimeout(() => setTextCopied(false), 2000);
    } catch (error) {
      mostrarError('Error al copiar el texto');
    }
  }, [extractedText, mostrarExito, mostrarError]);

  // Descargar texto
  const descargarTexto = useCallback(() => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile?.name?.replace('.pdf', '') || 'documento'}_extraido.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarExito('Archivo de texto descargado', {
      autoCloseMs: 2000
    });
  }, [extractedText, selectedFile, mostrarExito]);

  // Limpiar todo
  const limpiarTodo = useCallback(() => {
    setSelectedFile(null);
    setExtractedText('');
    setIsExtracting(false);
    setTextCopied(false);
    
    if (pdfPreview) {
      URL.revokeObjectURL(pdfPreview);
      setPdfPreview(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    mostrarInfo('Área de trabajo limpiada', {
      autoCloseMs: 2000
    });
  }, [pdfPreview, mostrarInfo]);

  // Estilos unificados con el dashboard
  const estilosCard = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(1.25rem)',
    borderRadius: '1.25rem',
    padding: esMobile ? '1.5rem' : '2rem',
    boxShadow: '0 0.625rem 1.875rem rgba(0,0,0,0.1)',
    border: `1px solid rgba(255,255,255,0.2)`,
    transition: 'all 0.3s ease',
    marginBottom: '2rem'
  };

  const estilosDropZone = {
    ...estilosCard,
    border: isDragActive 
      ? `2px dashed ${colores.primario}` 
      : selectedFile 
        ? `2px solid ${colores.exito}50`
        : `2px dashed ${colores.borde}`,
    backgroundColor: isDragActive 
      ? `${colores.primario}10` 
      : selectedFile 
        ? `${colores.exito}05`
        : 'rgba(255,255,255,0.95)',
    cursor: 'pointer',
    textAlign: 'center',
    padding: esMobile ? '2rem 1rem' : '3rem 2rem',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  const estilosVistaPrevia = {
    ...estilosCard,
    height: esMobile ? '31.25rem' : '40.625rem',
    display: 'flex',
    flexDirection: 'column'
  };

  const estilosTextoExtraido = {
    ...estilosCard,
    height: esMobile ? '31.25rem' : '40.625rem',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <LayoutPrincipal
      titulo="Extractor de Texto PDF"
      subtitulo="Convierte tus documentos PDF en texto editable de forma inteligente"
    >
      <div style={{
        maxWidth: '100rem',
        margin: '0 auto',
        width: '100%'
      }}>
      {/* Zona de carga de archivos */}
      <div 
        style={estilosDropZone}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <div>
            <IconoPDF tamaño="xxl" color={colores.exito} />
            <h3 style={{
              margin: '1rem 0 0.5rem 0',
              color: colores.texto,
              fontSize: esMobile ? '1.2rem' : '1.4rem'
            }}>
              Archivo Seleccionado
            </h3>
            <p style={{
              margin: '0 0 1rem 0',
              color: colores.textoSecundario,
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              {selectedFile.name}
            </p>
            <p style={{
              margin: 0,
              color: colores.textoSecundario,
              fontSize: '0.9rem'
            }}>
              Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <IconoSubir tamaño="xxl" color={colores.primario} />
            <h3 style={{
              margin: '1rem 0 0.5rem 0',
              color: colores.texto,
              fontSize: esMobile ? '1.2rem' : '1.4rem'
            }}>
              {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu PDF aquí'}
            </h3>
            <p style={{
              margin: 0,
              color: colores.textoSecundario,
              fontSize: '1rem'
            }}>
              o haz clic para seleccionar un archivo
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      {selectedFile && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <Button
            variant="primary"
            size="large"
            onClick={extraerTexto}
            disabled={isExtracting}
            loading={isExtracting}
          >
            {isExtracting ? (
              <>Extrayendo...</>
            ) : (
              <>
                <IconoBuscar tamaño="sm" />
                Extraer Texto
              </>
            )}
          </Button>
          
          <Button
            variant="secondary"
            size="medium"
            onClick={limpiarTodo}
          >
            <IconoActualizar tamaño="sm" />
            Limpiar
          </Button>
        </div>
      )}

      {/* Área de resultados */}
      {selectedFile && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: ocultarVistaPrevia ? '1fr' : '1fr 1fr',
          gap: '1rem',
          maxWidth: '100%',
          width: '100%'
        }}>
          {/* Vista previa del PDF - Solo en desktop */}
          {!ocultarVistaPrevia && (
            <div style={estilosVistaPrevia}>
              <h3 style={{
                margin: '0 0 1rem 0',
                color: colores.texto,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <IconoVer tamaño="md" />
                Vista Previa
              </h3>
              
              {pdfPreview ? (
                <iframe
                  src={pdfPreview}
                  style={{
                    width: '100%',
                    flex: 1,
                    border: 'none',
                    borderRadius: '0.75rem',
                    boxShadow: '0 0.25rem 1rem rgba(0,0,0,0.1)'
                  }}
                  title="Vista previa del PDF"
                />
              ) : (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colores.textoSecundario,
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <IconoPDF tamaño="xxl" color={colores.borde} />
                  <p>Cargando vista previa...</p>
                </div>
              )}
            </div>
          )}

          {/* Texto extraído */}
          <div style={{
            ...estilosTextoExtraido,
            gridColumn: ocultarVistaPrevia ? '1' : 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                margin: 0,
                color: colores.texto,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <IconoPDF tamaño="md" />
                Texto Extraído
              </h3>
              
              {extractedText && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={copiarTexto}
                    disabled={textCopied}
                  >
                    <IconoCopiar tamaño="sm" />
                    {textCopied ? 'Copiado' : 'Copiar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="small"
                    onClick={descargarTexto}
                  >
                    <IconoDescargar tamaño="sm" />
                    Descargar
                  </Button>
                </div>
              )}
            </div>
            
            {extractedText ? (
              <textarea
                value={extractedText}
                readOnly
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: `1px solid ${colores.borde}`,
                  borderRadius: '0.75rem',
                  backgroundColor: colores.fondo,
                  color: colores.texto,
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
                placeholder="El texto extraído aparecerá aquí..."
              />
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colores.textoSecundario,
                flexDirection: 'column',
                gap: '1rem',
                border: `1px dashed ${colores.borde}`,
                borderRadius: '0.75rem'
              }}>
                {isExtracting ? (
                  <>
                    <IconoCargando tamaño="xxl" girando color={colores.primario} />
                    <p>Procesando documento...</p>
                  </>
                ) : (
                  <>
                    <IconoPDF tamaño="xxl" color={colores.borde} />
                    <p>Haz clic en "Extraer Texto" para procesar el documento</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </LayoutPrincipal>
  );
};

export default ProcesadorPage;
