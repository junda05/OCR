/**
 * Validadores personalizados para formularios
 * Alineados con las validaciones del backend Django
 */

export const validadorEmail = (email) => {
  if (!email) return 'El email es obligatorio';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return 'Ingresa un email válido';
  return null;
};

export const validadorUsername = (username) => {
  if (!username) return 'El nombre de usuario es obligatorio';
  if (username.length < 3) return 'Mínimo 3 caracteres';
  if (username.length > 30) return 'Máximo 30 caracteres';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Solo letras, números y guiones bajos';
  }
  return null;
};

export const validadorPassword = (password) => {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Debe contener al menos una letra minúscula';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Debe contener al menos una letra mayúscula';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Debe contener al menos un número';
  }
  return null;
};

export const validadorPasswordConfirm = (password, passwordConfirm) => {
  if (!passwordConfirm) return 'Confirma tu contraseña';
  if (password !== passwordConfirm) return 'Las contraseñas no coinciden';
  return null;
};

export const validadorNombre = (nombre) => {
  if (!nombre) return 'El nombre es obligatorio';
  if (nombre.length < 3) return 'Mínimo 3 caracteres';
  if (nombre.length > 30) return 'Máximo 30 caracteres';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
    return 'Solo letras y espacios';
  }
  return null;
};

export const validadorApellido = (apellido) => {
  if (!apellido) return 'El apellido es obligatorio';
  if (apellido.length < 3) return 'Mínimo 3 caracteres';
  if (apellido.length > 30) return 'Máximo 30 caracteres';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) {
    return 'Solo letras y espacios';
  }
  return null;
};

/**
 * Validadores para el formulario de login
 */
export const validadoresLogin = {
  username: validadorUsername,
  password: (password) => {
    if (!password) return 'La contraseña es obligatoria';
    return null; // En login no validamos formato, solo que exista
  }
};

/**
 * Validadores para el formulario de registro
 */
export const validadoresRegistro = {
  username: validadorUsername,
  email: validadorEmail,
  first_name: validadorNombre,
  last_name: validadorApellido,
  password: validadorPassword,
  password_confirm: (valor, valores) => validadorPasswordConfirm(valores.password, valor)
};
