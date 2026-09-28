import React from 'react';
import { Camera } from 'lucide-react';

interface PhotoPlaceholderProps {
  description: string;
  ratio?: string;
  className?: string;
  overlayOpacity?: number;
  contrast?: 'high' | 'medium' | 'subtle';
  children?: React.ReactNode;
}

export const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({
  description,
  ratio = '16/9',
  className = '',
  overlayOpacity = 0.35,
  contrast = 'high',
  children,
}) => {
  /* acá va la foto de: ${description} */
  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none group ${className}`}
      title={`Foto: ${description}`}
      aria-label={description}
      role="img"
      style={{
        aspectRatio: ratio !== 'full' ? ratio : undefined,
      }}
    >
      {/* Fondo fotográfico simulado de alto impacto editorial (grano y luz rasante) */}
      <div
        className="editorial-img-zoom absolute inset-0 w-full h-full"
        style={{
          background:
            contrast === 'high'
              ? 'radial-gradient(ellipse at 70% 20%, #2A2A28 0%, #151515 50%, #070707 100%)'
              : 'radial-gradient(circle at 30% 70%, #30302E 0%, #1C1C1B 60%, #0A0A0A 100%)',
        }}
      >
        {/* Patrón de textura y grano sutil */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Gradiente cinemático de iluminación lateral */}
        <div
          className="absolute inset-0 mix-blend-screen opacity-20 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(240, 78, 55, 0.25) 0%, transparent 45%, rgba(255, 255, 255, 0.08) 100%)',
          }}
        />
      </div>

      {/* Overlay oscuro para garantizar contraste AA de los textos superpuestos */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          backgroundColor: '#0A0A0A',
          opacity: overlayOpacity,
        }}
      />

      {/* Marca de agua técnica editorial en esquina para maquetación */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono tracking-widest text-white/70 uppercase">
        <Camera size={10} className="text-[#F04E37]" />
        <span>FOTO // {ratio}</span>
      </div>

      {/* Contenido superpuesto si lo hay */}
      {children}
    </div>
  );
};
