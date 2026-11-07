import React, { useState } from 'react';
import { PlaceCategory } from '../../types/catalog.ts';
import { Utensils, Landmark, Waves, Sparkles, Building2, Palette, MapPin } from 'lucide-react';

interface PlaceImageProps {
  src?: string;
  alt: string;
  category?: PlaceCategory | string;
  className?: string;
  aspectRatio?: string;
  sizes?: string;
}

const CATEGORY_THEMES: Record<
  string,
  { gradient: string; icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  restaurantes: {
    gradient: 'from-amber-600/90 via-orange-600/85 to-stone-900',
    icon: Utensils,
    label: 'Gastronomía',
  },
  gastronomia: {
    gradient: 'from-amber-600/90 via-orange-600/85 to-stone-900',
    icon: Utensils,
    label: 'Gastronomía',
  },
  arqueologia: {
    gradient: 'from-amber-800/95 via-yellow-900/90 to-stone-950',
    icon: Landmark,
    label: 'Arqueología',
  },
  playas: {
    gradient: 'from-sky-600/90 via-cyan-700/85 to-slate-900',
    icon: Waves,
    label: 'Balneario & Surf',
  },
  atractivos: {
    gradient: 'from-emerald-700/90 via-teal-800/85 to-slate-900',
    icon: Sparkles,
    label: 'Atractivo Cultural',
  },
  hoteles: {
    gradient: 'from-indigo-700/90 via-slate-800/85 to-stone-900',
    icon: Building2,
    label: 'Hospedaje',
  },
  museos: {
    gradient: 'from-purple-700/90 via-violet-900/85 to-slate-950',
    icon: Palette,
    label: 'Museo & Arte',
  },
};

export const PlaceImage: React.FC<PlaceImageProps> = ({
  src,
  alt,
  category = 'atractivos',
  className = 'w-full h-full object-cover',
}) => {
  const [hasError, setHasError] = useState(!src || src.trim() === '');
  const [isLoaded, setIsLoaded] = useState(false);

  const theme = CATEGORY_THEMES[category] || {
    gradient: 'from-[#17243A] via-slate-800 to-stone-900',
    icon: MapPin,
    label: 'La Libertad',
  };
  const IconComponent = theme.icon;

  if (hasError || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center p-3 text-white overflow-hidden bg-gradient-to-br ${theme.gradient} ${className}`}
        aria-label={alt}
      >
        <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center mb-1.5 border border-white/20 shadow-2xs">
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <span className="text-[10px] font-semibold tracking-wider uppercase text-white/90 text-center line-clamp-1">
          {theme.label}
        </span>
        <span className="text-[9px] text-white/70 line-clamp-1 max-w-[90%] text-center mt-0.5 font-medium">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-slate-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
