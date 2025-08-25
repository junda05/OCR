import { useCallback, useState } from 'react';

export default function useFormulario(valoresIniciales = {}, validadores = {}) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});

  const validarCampo = useCallback((nombre, valor) => {
    const validador = validadores[nombre];
    if (!validador) return null;
    return validador(valor, valores);
  }, [validadores, valores]);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setValores(v => ({ ...v, [name]: value }));
    const error = validarCampo(name, value);
    setErrores(err => ({ ...err, [name]: error }));
  }, [validarCampo]);

  const esValido = useCallback(() => {
    const nuevosErrores = {};
    Object.keys(validadores).forEach(campo => {
      const error = validarCampo(campo, valores[campo]);
      if (error) nuevosErrores[campo] = error;
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [validadores, validarCampo, valores]);

  const reset = useCallback(() => {
    setValores(valoresIniciales);
    setErrores({});
  }, [valoresIniciales]);

  return { valores, errores, onChange, esValido, reset, setValores, setErrores };
}