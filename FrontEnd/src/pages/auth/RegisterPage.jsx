import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import TextField from '../../components/ui/TextField';
import PasswordField from '../../components/ui/PasswordField';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import useFormulario from '../../hooks/useFormulario';
import { validadoresRegistro } from '../../services/utils/validadores';

/**
 * Página de registro de usuarios
 * 
 * Características:
 * - Formulario con validación en tiempo real
 * - Confirmación de contraseña
 * - Manejo de errores específicos del backend
 * - Feedback visual del progreso
 * - Redirección automática tras registro exitoso con notificaciones
 * - Eliminación de delays innecesarios
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { registrar, autenticado, cargando, mostrarExito } = useAuth();

  // Valores iniciales del formulario
  const valoresIniciales = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  };

  const {
    valores,
    errores,
    onChange,
    esValido,
    reset,
    setErrores
  } = useFormulario(valoresIniciales, validadoresRegistro);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (autenticado) {
      navigate('/dashboard', { replace: true });
    }
  }, [autenticado, navigate]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!esValido()) {
      return;
    }

    const resultado = await registrar(valores);
    
    if (resultado.ok) {
      reset();
      // Mostrar notificación de éxito
      mostrarExito('Tu cuenta ha sido creada exitosamente. Redirigiendo al login...', {
        titulo: '¡Registro Completado!',
        autoCloseMs: 3000
      });
      
      // Navegar después de un breve delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            mensaje: 'Cuenta creada exitosamente. Puedes iniciar sesión ahora.'
          }
        });
      }, 2000); // Tiempo para que el usuario vea la notificación
    } else {
      // Manejar errores específicos del backend
      if (resultado.error?.response?.data) {
        const erroresBackend = resultado.error.response.data;
        const nuevosErrores = {};
        
        // Mapear errores del backend a campos del formulario
        Object.keys(erroresBackend).forEach(campo => {
          if (Array.isArray(erroresBackend[campo])) {
            nuevosErrores[campo] = erroresBackend[campo][0];
          } else {
            nuevosErrores[campo] = erroresBackend[campo];
          }
        });
        
        setErrores(prev => ({ ...prev, ...nuevosErrores }));
      }
    }
  };

  const hayErrores = Object.keys(errores).some(key => errores[key]);
  const todosLosCamposCompletos = Object.keys(valoresIniciales).every(key => valores[key]);
  const formularioValido = todosLosCamposCompletos && !hayErrores;

  // Indicador visual de fortaleza de contraseña
  const calcularFortalezaPassword = (password) => {
    if (!password) return { nivel: 0, texto: '', color: '#e0e0e0' };
    
    let puntos = 0;
    if (password.length >= 8) puntos += 1;
    if (/(?=.*[a-z])/.test(password)) puntos += 1;
    if (/(?=.*[A-Z])/.test(password)) puntos += 1;
    if (/(?=.*\d)/.test(password)) puntos += 1;
    if (/(?=.*[!@#$%^&*])/.test(password)) puntos += 1;
    
    const niveles = [
      { texto: 'Muy débil', color: '#f44336' },
      { texto: 'Débil', color: '#ff9800' },
      { texto: 'Regular', color: '#ffc107' },
      { texto: 'Buena', color: '#4caf50' },
      { texto: 'Muy fuerte', color: '#2e7d32' }
    ];
    
    return { 
      nivel: puntos, 
      ...niveles[Math.min(puntos - 1, 4)] || niveles[0] 
    };
  };

  const fortalezaPassword = calcularFortalezaPassword(valores.password);

  return (
    <AuthLayout
      titulo="Crear Cuenta"
      subtitulo="Únete a nuestra plataforma OCR y comienza a digitalizar tus documentos"
    >
      <form onSubmit={manejarSubmit} noValidate>
        {/* Los mensajes de éxito y error ahora se manejan via notificaciones globales */}
        
        {/* Campos de nombre */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1rem',
          marginBottom: '0rem'
        }}>
          <TextField
            type="text"
            name="first_name"
            id="first_name"
            label="Nombre"
            placeholder="Tu nombre"
            value={valores.first_name}
            onChange={onChange}
            error={errores.first_name}
            required
            autoComplete="given-name"
            disabled={cargando}
          />

          <TextField
            type="text"
            name="last_name"
            id="last_name"
            label="Apellido"
            placeholder="Tu apellido"
            value={valores.last_name}
            onChange={onChange}
            error={errores.last_name}
            required
            autoComplete="family-name"
            disabled={cargando}
          />
        </div>

        {/* Campo de usuario */}
        <TextField
          type="text"
          name="username"
          id="username"
          label="Nombre de usuario"
          placeholder="Elige un nombre de usuario único"
          value={valores.username}
          onChange={onChange}
          error={errores.username}
          required
          autoComplete="username"
          disabled={cargando}
        />

        {/* Campo de email */}
        <TextField
          type="email"
          name="email"
          id="email"
          label="Correo electrónico"
          placeholder="tu@email.com"
          value={valores.email}
          onChange={onChange}
          error={errores.email}
          required
          autoComplete="email"
          disabled={cargando}
        />

        {/* Campo de contraseña con indicador de fortaleza */}
        <PasswordField
          name="password"
          id="password"
          label="Contraseña"
          placeholder="Crea una contraseña segura"
          value={valores.password}
          onChange={onChange}
          error={errores.password}
          required
          autoComplete="new-password"
          disabled={cargando}
        />
        
        {/* Indicador de fortaleza */}
        {valores.password && (
          <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: fortalezaPassword.color }}>
                Fortaleza: {fortalezaPassword.texto}
              </span>
              <span style={{ color: '#6b7280' }}>
                {fortalezaPassword.nivel}/5
              </span>
            </div>
            <div style={{
              height: '4px',
              backgroundColor: '#e0e0e0',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(fortalezaPassword.nivel / 5) * 100}%`,
                backgroundColor: fortalezaPassword.color,
                transition: 'all 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {/* Confirmación de contraseña */}
        <PasswordField
          name="password_confirm"
          id="password_confirm"
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          value={valores.password_confirm}
          onChange={onChange}
          error={errores.password_confirm}
          required
          autoComplete="new-password"
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
          {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>

      </form>
    </AuthLayout>
  );
};

export default RegisterPage;