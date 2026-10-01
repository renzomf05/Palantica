import { useState, useEffect, useRef, type RefObject } from 'react';

interface UseFitTextOptions {
  minFontSize?: number;
  maxFontSize?: number;
}

export function useFitText<T extends HTMLElement = HTMLHeadingElement>(
  options: UseFitTextOptions = {}
): {
  ref: RefObject<T | null>;
  fontSize: number;
} {
  const { minFontSize = 24, maxFontSize = 48 } = options;
  const ref = useRef<T | null>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSize);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const adjust = () => {
      const parent = element.parentElement;
      const width = parent ? parent.clientWidth : window.innerWidth;
      if (width <= 0) return;

      // Ajuste proporcional según el ancho de pantalla/contenedor
      const calculated = Math.min(
        maxFontSize,
        Math.max(minFontSize, Math.round(width * 0.045))
      );
      setFontSize(calculated);
      element.style.fontSize = `${calculated}px`;
    };

    adjust();
    window.addEventListener('resize', adjust);
    return () => window.removeEventListener('resize', adjust);
  }, [minFontSize, maxFontSize]);

  return { ref, fontSize };
}
