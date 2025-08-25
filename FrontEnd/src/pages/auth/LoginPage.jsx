import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import TextField from '../../components/ui/TextField';
import PasswordField from '../../components/ui/PasswordField';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import useFormulario from '../../hooks/useFormulario';
import { validadoresLogin } from '../../services/utils/validadores';

/**
 * Página de inicio de sesión
 * 
 * Características:
 * - Formulario controlado con validación en tiempo real
 * - Redirección automática si ya está autenticado
 * - Manejo de errores del servidor via notificaciones
 * - Estados de carga durante la autenticación
 * - Navegación al dashboard tras login exitoso
 * - Gestión optimizada de mensajes de estado
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { iniciarSesion, autenticado, cargando } = useAuth();

  // Valores iniciales del formulario
  const valoresIniciales = {
    username: '',
    password: ''
  };

  const {
    valores,
    errores,
    onChange,
    esValido,
    reset
  } = useFormulario(valoresIniciales, validadoresLogin);

  // Mostrar mensaje de éxito del registro si viene del state
  useEffect(() => {
    if (location.state?.mensaje) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (autenticado) {
      const origen = location.state?.from?.pathname || '/dashboard';
      navigate(origen, { replace: true });
    }
  }, [autenticado, navigate, location.state]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!esValido()) {
      return;
    }

    const resultado = await iniciarSesion(valores.username, valores.password);
    
    if (resultado.ok) {
      // La redirección se maneja en el useEffect
      reset();
    }
    // Los errores se muestran automáticamente via errorAuth del contexto
  };

  const hayErrores = Object.keys(errores).some(key => errores[key]);
  const formularioValido = valores.username && valores.password && !hayErrores;

  return (
    <AuthLayout
      titulo="Iniciar Sesión"
      subtitulo="Accede a tu cuenta para gestionar tus documentos"
    >
      <form onSubmit={manejarSubmit} noValidate>
        {/* Los mensajes de éxito y error ahora se manejan via notificaciones globales */}

        {/* Campo de usuario */}
        <TextField
          type="text"
          name="username"
          id="username"
          label="Nombre de usuario"
          placeholder="Ingresa tu nombre de usuario"
          value={valores.username}
          onChange={onChange}
          error={errores.username}
          required
          autoComplete="username"
          disabled={cargando}
        />

        {/* Campo de contraseña */}
        <PasswordField
          name="password"
          id="password"
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          value={valores.password}
          onChange={onChange}
          error={errores.password}
          required
          autoComplete="current-password"
          disabled={cargando}
        />

        {/* Botón de submit */}
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          loading={cargando}
          disabled={!formularioValido || cargando}
        >
          {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>

        {/* Enlaces adicionales */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;