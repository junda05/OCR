import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LayoutPrincipal from '../../components/layout/LayoutPrincipal';
import colores from '../../config/colores';
import { useResponsive } from '../../hooks/useResponsive';
import { IconoPDF, IconoUsuario, IconoFlecha, IconoBuscar } from '../../components/icons/Iconos';

/**
 * Dashboard Principal del Sistema OCR
 * 
 * Características:
 * - Diseño moderno con gradientes y sombras
 * - Funcionalidad principal: Extracción de texto de PDFs
 * - Navegación intuitiva
 * - Completamente responsive
 * - Iconos profesionales centralizados
 * - Layout unificado y reutilizable
 * - Datos completos del usuario con opción de recarga
 */
const DashboardPage = () => {
  const { usuario} = useAuth();
  const { esMobile } = useResponsive();
  const navigate = useNavigate();

  // Estilos principales
  const estilosWelcome = {
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

  const estilosCard = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: `1px solid rgba(255,255,255,0.2)`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  };

  const funcionalidades = [
    {
      id: 'procesador',
      titulo: 'Extractor de Texto',
      descripcion: 'Convierte documentos PDF en texto editable de forma rápida y precisa',
      icono: <IconoPDF tamaño="xxl" />,
      color: colores.primario,
      gradiente: 'linear-gradient(135deg, #0054A6, #3377c2)',
      textoBoton: 'Comenzar Extracción',
      accion: () => navigate('/procesador')
    },
    {
      id: 'buscador',
      titulo: 'Buscador de Documentos',
      descripcion: 'Encuentra información rápidamente en todos tus documentos procesados',
      icono: <IconoBuscar tamaño="xxl" />,
      color: '#00A676',
      gradiente: 'linear-gradient(135deg, #00A676, #33c299)',
      textoBoton: 'Explorar Documentos',
      accion: () => navigate('/buscador')
    }
  ];

  return (
    <LayoutPrincipal
      titulo="Dashboard OCR"
      subtitulo="Sistema de Extracción de Texto Profesional"
      mostrarNavegacion={false}
    >
      {/* Welcome Section */}
      <div style={estilosWelcome}>
        {/* Efecto de decoración */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            margin: '0 0 1rem 0',
            fontSize: esMobile ? '1.5rem' : '2rem',
            fontWeight: '600'
          }}>
            ¡Bienvenido, {usuario?.first_name || usuario?.username || 'Usuario'}!
          </h2>
          <p style={{
            margin: 0,
            opacity: 0.95,
            fontSize: esMobile ? '1rem' : '1.2rem',
            fontWeight: '300'
          }}>
            Transforma tus documentos PDF en texto editable con tecnología de vanguardia
          </p>
        </div>
      </div>

      {/* Funcionalidades Principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: esMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {funcionalidades.map((funcionalidad, index) => (
          <div 
            key={index}
            style={{
              ...estilosCard,
              cursor: 'pointer',
              background: `linear-gradient(135deg, ${colores.fondo}, rgba(0,84,166,0.02))`,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
            onClick={funcionalidad.accion}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
            }}
          >
            {/* Línea de color superior */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: funcionalidad.gradiente
            }} />
            
            {/* Contenido de la card */}
            <div style={{ 
              textAlign: 'center',
              pointerEvents: 'none' // Evita conflictos de hover con elementos internos
            }}>
              <div style={{ 
                marginBottom: '1.5rem',
                color: funcionalidad.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {funcionalidad.icono}
              </div>
              
              <h3 style={{
                margin: '0 0 1rem 0',
                color: colores.texto,
                fontSize: esMobile ? '1.4rem' : '1.6rem',
                fontWeight: '600'
              }}>
                {funcionalidad.titulo}
              </h3>
              
              <p style={{
                margin: '0 0 1.5rem 0',
                color: colores.textoSecundario,
                fontSize: esMobile ? '0.9rem' : '1rem',
                lineHeight: '1.6'
              }}>
                {funcionalidad.descripcion}
              </p>

              {/* Botón de acción */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: funcionalidad.gradiente,
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}>
                {funcionalidad.textoBoton}
                <IconoFlecha tamaño="sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información del Usuario */}
      <div style={{
        ...estilosCard,
        cursor: 'default'
      }}>
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
            <IconoUsuario tamaño="md" />
            Información del Usuario
          </h3>
          
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: esMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '1.5rem'
        }}>
          <div style={{
            padding: '1rem',
            background: `linear-gradient(135deg, ${colores.fondo}, rgba(0,84,166,0.05))`,
            borderRadius: '12px',
            border: `1px solid ${colores.borde}`
          }}>
            <div style={{ color: colores.textoSecundario, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Usuario
            </div>
            <div style={{ color: colores.texto, fontWeight: '500', fontSize: '1.1rem' }}>
              {usuario?.username || 'N/A'}
            </div>
          </div>
          
          <div style={{
            padding: '1rem',
            background: `linear-gradient(135deg, ${colores.fondo}, rgba(0,166,118,0.05))`,
            borderRadius: '12px',
            border: `1px solid ${colores.borde}`
          }}>
            <div style={{ color: colores.textoSecundario, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Email
            </div>
            <div style={{ color: colores.texto, fontWeight: '500', fontSize: '1.1rem' }}>
              {usuario?.email || 'N/A'}
            </div>
          </div>
          
          <div style={{
            padding: '1rem',
            background: `linear-gradient(135deg, ${colores.fondo}, rgba(2,136,209,0.05))`,
            borderRadius: '12px',
            border: `1px solid ${colores.borde}`
          }}>
            <div style={{ color: colores.textoSecundario, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Nombre
            </div>
            <div style={{ color: colores.texto, fontWeight: '500', fontSize: '1.1rem' }}>
              {usuario?.first_name || 'N/A'}
            </div>
          </div>
          
          <div style={{
            padding: '1rem',
            background: `linear-gradient(135deg, ${colores.fondo}, rgba(255,160,0,0.05))`,
            borderRadius: '12px',
            border: `1px solid ${colores.borde}`
          }}>
            <div style={{ color: colores.textoSecundario, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Apellido
            </div>
            <div style={{ color: colores.texto, fontWeight: '500', fontSize: '1.1rem' }}>
              {usuario?.last_name || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </LayoutPrincipal>
  );
};

export default DashboardPage;
