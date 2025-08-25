import React from 'react';
import { 
  FileText, 
  User, 
  LogOut, 
  ArrowRight,
  Upload,
  Download,
  Eye,
  Copy,
  Check,
  X,
  Menu,
  Home,
  Search,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Filter,
  BarChart3,
  FileSearch
} from 'lucide-react';

/**
 * Sistema de Iconos Centralizado
 * 
 * Utiliza Lucide React como librería principal con fallbacks.
 * Proporciona iconos consistentes y escalables en toda la aplicación.
 * 
 * Características:
 * - Iconos vectoriales de alta calidad
 * - Tamaños estandarizados y configurables
 * - Colores personalizables
 * - Optimización automática
 * - Fácil mantenimiento y escalabilidad
 * 
 * @param {Object} props
 * @param {string} props.nombre - Nombre del icono a renderizar
 * @param {number|string} props.tamaño - Tamaño del icono (16, 20, 24, 32, 48)
 * @param {string} props.color - Color del icono (usa CSS o variables de color)
 * @param {string} props.className - Clases CSS adicionales
 * @param {Object} props.style - Estilos inline adicionales
 */

const mapaIconos = {
  // Documentos y Archivos
  'pdf': FileText,
  'archivo': FileText,
  'texto': FileText,
  
  // Usuario y Autenticación  
  'usuario': User,
  'perfil': User,
  'cuenta': User,
  'salir': LogOut,
  'logout': LogOut,
  'cerrar-sesion': LogOut,
  'login': User,
  
  // Navegación
  'flecha-derecha': ArrowRight,
  'siguiente': ArrowRight,
  'continuar': ArrowRight,
  'home': Home,
  'inicio': Home,
  'menu': Menu,
  'hamburguesa': Menu,
  
  // Acciones de Archivo
  'subir': Upload,
  'cargar': Upload,
  'upload': Upload,
  'descargar': Download,
  'bajar': Download,
  'download': Download,
  
  // Visualización
  'ver': Eye,
  'vista': Eye,
  'preview': Eye,
  'ojo': Eye,
  
  // Edición y CRUD
  'copiar': Copy,
  'duplicar': Copy,
  
  // Estados y Feedback
  'check': Check,
  'correcto': Check,
  'bien': Check,
  'tick': Check,
  'confirmado': CheckCircle,
  'exito': CheckCircle,
  'success': CheckCircle,
  'cerrar': X,
  'x': X,
  'cancelar': X,
  'error': XCircle,
  'fallo': XCircle,
  'error-circulo': XCircle,
  'advertencia': AlertTriangle,
  'alerta': AlertTriangle,
  'warning': AlertTriangle,
  'info': Info,
  'informacion': Info,
  'cargando': Loader2,
  'loading': Loader2,
  'spinner': Loader2,
  
  // Utilidades
  'buscar': Search,
  'lupa': Search,
  'search': Search,
  'actualizar': RefreshCw,
  'refresh': RefreshCw,
  'recargar': RefreshCw,
  
  // Nuevos iconos para el buscador
  'eliminar': Trash2,
  'delete': Trash2,
  'basura': Trash2,
  'filtro': Filter,
  'filter': Filter,
  'estadisticas': BarChart3,
  'stats': BarChart3,
  'grafico': BarChart3,
  'documento': FileSearch,
  'buscar-documento': FileSearch
};

// Configuración de tamaños predefinidos
const tamañosPredefinidos = {
  'xs': 14,
  'sm': 16,
  'md': 20,
  'lg': 24,
  'xl': 32,
  'xxl': 48
};

/**
 * Componente principal de iconos
 */
const Icono = ({ 
  nombre, 
  tamaño = 'md', 
  color = 'currentColor', 
  className = '', 
  style = {},
  ...props 
}) => {
  // Obtener el componente del icono
  const ComponenteIcono = mapaIconos[nombre];
  
  // Si no existe el icono, mostrar un icono de placeholder
  if (!ComponenteIcono) {
    console.warn(`Icono "${nombre}" no encontrado. Iconos disponibles:`, Object.keys(mapaIconos));
    return <Info size={tamaño} color={color} className={className} style={style} {...props} />;
  }
  
  // Determinar el tamaño final
  const tamañoFinal = tamañosPredefinidos[tamaño] || (typeof tamaño === 'number' ? tamaño : 20);
  
  return (
    <ComponenteIcono 
      size={tamañoFinal} 
      color={color} 
      className={`icono icono--${nombre} ${className}`}
      style={{ 
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style 
      }} 
      {...props}
    />
  );
};

/**
 * Componentes de iconos específicos para casos comunes
 */

export const IconoPDF = (props) => (
  <Icono nombre="pdf" tamaño="xl" {...props} />
);

export const IconoUsuario = (props) => (
  <Icono nombre="usuario" tamaño="md" {...props} />
);

export const IconoSalir = (props) => (
  <Icono nombre="salir" tamaño="md" {...props} />
);

export const IconoFlecha = (props) => (
  <Icono nombre="flecha-derecha" tamaño="sm" {...props} />
);

export const IconoSubir = (props) => (
  <Icono nombre="subir" tamaño="lg" {...props} />
);

export const IconoDescargar = (props) => (
  <Icono nombre="descargar" tamaño="md" {...props} />
);

export const IconoCopiar = (props) => (
  <Icono nombre="copiar" tamaño="md" {...props} />
);

export const IconoVer = (props) => (
  <Icono nombre="ver" tamaño="md" {...props} />
);

export const IconoMenu = (props) => (
  <Icono nombre="menu" tamaño="md" {...props} />
);

export const IconoHome = (props) => (
  <Icono nombre="home" tamaño="md" {...props} />
);

export const IconoCargando = ({ girando = true, ...props }) => (
  <Icono 
    nombre="cargando" 
    tamaño="md" 
    style={{ 
      animation: girando ? 'spin 1s linear infinite' : 'none',
      '@keyframes spin': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' }
      }
    }} 
    {...props} 
  />
);

export const IconoExito = (props) => (
  <Icono nombre="exito" tamaño="md" {...props} />
);

export const IconoError = (props) => (
  <Icono nombre="error" tamaño="md" {...props} />
);

export const IconoAdvertencia = (props) => (
  <Icono nombre="advertencia" tamaño="md" {...props} />
);

export const IconoInfo = (props) => (
  <Icono nombre="info" tamaño="md" {...props} />
);

export const IconoBuscar = (props) => (
  <Icono nombre="buscar" tamaño="md" {...props} />
);

export const IconoActualizar = (props) => (
  <Icono nombre="actualizar" tamaño="md" {...props} />
);

// Nuevos iconos para el buscador
export const IconoEliminar = (props) => (
  <Icono nombre="eliminar" tamaño="md" {...props} />
);

export const IconoFiltro = (props) => (
  <Icono nombre="filtro" tamaño="md" {...props} />
);

export const IconoEstadisticas = (props) => (
  <Icono nombre="estadisticas" tamaño="md" {...props} />
);

export const IconoDocumento = (props) => (
  <Icono nombre="documento" tamaño="md" {...props} />
);

// Exportación por defecto del componente principal
export default Icono;