import { useEffect, useState } from 'react';

export function useResponsive() {
  const [ancho, setAncho] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setAncho(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    ancho,
    esMobile: ancho <= 576,
    esTablet: ancho > 576 && ancho <= 992,
    esDesktop: ancho > 992
  };
}