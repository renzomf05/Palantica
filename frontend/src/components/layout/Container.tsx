import React, { type ReactNode, type CSSProperties } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * Contenedor maestro unificado de Palantica.
 * Garantiza centrado perfecto (margin-inline: auto), ancho máximo de 1320px
 * y padding responsivo mediante inline style y clase .palantica-container en @layer components.
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  style,
  id,
}) => {
  return (
    <div
      id={id}
      className={`palantica-container w-full max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-10 ${className}`}
      style={{
        width: '100%',
        maxWidth: '1320px',
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
