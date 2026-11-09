import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  /** Ref directo al elemento HTML desplazable */
  innerRef?: React.Ref<HTMLDivElement>;
  /** Clase para el contenedor de desplazamiento interno */
  className?: string;
  /** Clase para el contenedor envolvente relativo */
  containerClassName?: string;
  /** Tema de degradado para bordes cuando hay contenido oculto */
  gradientTheme?: 'white' | 'slate' | 'transparent';
  /** Si debe mostrar flechas discretas de navegación en escritorio cuando haya desbordamiento */
  showArrows?: boolean;
  /** Tamaño de las flechas de navegación */
  arrowSize?: 'sm' | 'md';
  /** Píxeles a desplazar por cada clic en flecha */
  scrollStep?: number;
  /** Traducir rueda vertical del mouse a desplazamiento horizontal en desktop */
  enableWheelScroll?: boolean;
  /** Permitir arrastre horizontal con mouse en escritorio sin bloquear clics de botones */
  enableDragScroll?: boolean;
  /** Evento opcional para notificar cambios de scroll */
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  /** Identificador de accesibilidad */
  ariaLabel?: string;
}

export interface HorizontalScrollContainerHandle {
  scrollLeft: () => void;
  scrollRight: () => void;
  scrollToStart: () => void;
  scrollToEnd: () => void;
  getScrollElement: () => HTMLDivElement | null;
}

export const HorizontalScrollContainer = forwardRef<
  HorizontalScrollContainerHandle,
  HorizontalScrollContainerProps
>(
  (
    {
      children,
      innerRef,
      className = '',
      containerClassName = '',
      gradientTheme = 'white',
      showArrows = true,
      arrowSize = 'sm',
      scrollStep = 220,
      enableWheelScroll = true,
      enableDragScroll = true,
      onScroll,
      ariaLabel = 'Lista desplazable horizontal',
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof innerRef === 'function') {
          innerRef(node);
        } else if (innerRef && 'current' in innerRef) {
          (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [innerRef]
    );
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Estado para arrastre con mouse (drag to scroll)
    const isDraggingRef = useRef(false);
    const hasMovedRef = useRef(false);
    const startXRef = useRef(0);
    const startScrollLeftRef = useRef(0);

    const updateScrollBounds = useCallback(() => {
      const el = internalRef.current;
      if (!el) return;

      const tolerance = 3; // tolerancia de redondeo de subpíxeles
      const left = el.scrollLeft > tolerance;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance;

      setCanScrollLeft(left);
      setCanScrollRight(right);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        scrollLeft: () => {
          internalRef.current?.scrollBy({ left: -scrollStep, behavior: 'smooth' });
        },
        scrollRight: () => {
          internalRef.current?.scrollBy({ left: scrollStep, behavior: 'smooth' });
        },
        scrollToStart: () => {
          internalRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
        },
        scrollToEnd: () => {
          if (internalRef.current) {
            internalRef.current.scrollTo({
              left: internalRef.current.scrollWidth,
              behavior: 'smooth',
            });
          }
        },
        getScrollElement: () => internalRef.current,
      }),
      [scrollStep]
    );

    // Observar redimensionamiento y cambios en hijos
    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;

      updateScrollBounds();

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          updateScrollBounds();
        });
        resizeObserver.observe(el);
        if (el.firstElementChild) {
          resizeObserver.observe(el.firstElementChild);
        }
      }

      const handleWindowResize = () => updateScrollBounds();
      window.addEventListener('resize', handleWindowResize, { passive: true });

      return () => {
        resizeObserver?.disconnect();
        window.removeEventListener('resize', handleWindowResize);
      };
    }, [updateScrollBounds]);

    // Gestión de desplazamiento con la rueda del ratón (Wheel)
    useEffect(() => {
      const el = internalRef.current;
      if (!el || !enableWheelScroll) return;

      const handleWheel = (e: WheelEvent) => {
        // Si el usuario usa un trackpad o ratón con scroll horizontal real, dejar nativo
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          return;
        }

        // Si es scroll vertical y hay posibilidad de desplazarse horizontalmente
        const canScrollL = el.scrollLeft > 2;
        const canScrollR = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;

        if ((e.deltaY > 0 && canScrollR) || (e.deltaY < 0 && canScrollL)) {
          // Desplazar horizontalmente en lugar de perder el scroll en la página
          el.scrollLeft += e.deltaY;
          e.preventDefault();
          updateScrollBounds();
        }
      };

      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        el.removeEventListener('wheel', handleWheel);
      };
    }, [enableWheelScroll, updateScrollBounds]);

    // Gestión de arrastre con ratón (Mouse Drag to scroll)
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      // Solo botón izquierdo del ratón
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!enableDragScroll) return;

      const el = internalRef.current;
      if (!el) return;

      isDraggingRef.current = true;
      hasMovedRef.current = false;
      startXRef.current = e.clientX;
      startScrollLeftRef.current = el.scrollLeft;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      const el = internalRef.current;
      if (!el) return;

      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 5) {
        hasMovedRef.current = true;
        el.scrollLeft = startScrollLeftRef.current - deltaX;
        updateScrollBounds();
      }
    };

    const handlePointerUpOrCancel = () => {
      isDraggingRef.current = false;
    };

    const handleClickCapture = (e: React.MouseEvent) => {
      // Si el usuario arrastró activamente, anular el clic para que no active el botón involuntariamente
      if (hasMovedRef.current) {
        e.stopPropagation();
        e.preventDefault();
        hasMovedRef.current = false;
      }
    };

    const handleScrollInternal = (e: React.UIEvent<HTMLDivElement>) => {
      updateScrollBounds();
      onScroll?.(e);
    };

    // Estilos de degradados según tema
    const gradientStyles = {
      white: {
        left: 'from-white via-white/80 to-transparent',
        right: 'from-white via-white/80 to-transparent',
      },
      slate: {
        left: 'from-[#F8FAFC] via-[#F8FAFC]/85 to-transparent',
        right: 'from-[#F8FAFC] via-[#F8FAFC]/85 to-transparent',
      },
      transparent: {
        left: 'from-black/5 to-transparent',
        right: 'from-black/5 to-transparent',
      },
    }[gradientTheme];

    const arrowButtonClasses =
      arrowSize === 'sm'
        ? 'w-6 h-6 text-xs'
        : 'w-7 h-7 text-sm';
    const arrowIconClasses = arrowSize === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

    return (
      <div
        className={`relative min-w-0 max-w-full flex items-center group/hscroll ${containerClassName}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          isDraggingRef.current = false;
        }}
      >
        {/* Degradado y Flecha Izquierda */}
        {canScrollLeft && gradientTheme !== 'transparent' && (
          <div
            className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-r ${gradientStyles.left} transition-opacity duration-200`}
            aria-hidden="true"
          />
        )}

        {showArrows && canScrollLeft && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              internalRef.current?.scrollBy({ left: -scrollStep, behavior: 'smooth' });
            }}
            className={`absolute left-1 z-20 hidden md:flex items-center justify-center ${arrowButtonClasses} rounded-full bg-white/95 backdrop-blur-xs text-[#17243A] shadow-md border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isHovered ? 'opacity-100' : 'opacity-70'
            }`}
            title="Desplazar a la izquierda"
            aria-label="Desplazar opciones a la izquierda"
          >
            <ChevronLeft className={arrowIconClasses} />
          </button>
        )}

        {/* Contenedor con Scroll Horizontal Fluido */}
        <div
          ref={setRefs}
          onScroll={handleScrollInternal}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          onClickCapture={handleClickCapture}
          className={`flex items-center overflow-x-auto flex-nowrap min-w-0 max-w-full no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth ${className}`}
          style={{
            WebkitOverflowScrolling: 'touch',
            cursor: enableDragScroll && (canScrollLeft || canScrollRight) ? 'grab' : 'default',
          }}
          aria-label={ariaLabel}
        >
          {children}
        </div>

        {/* Degradado y Flecha Derecha */}
        {canScrollRight && gradientTheme !== 'transparent' && (
          <div
            className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-l ${gradientStyles.right} transition-opacity duration-200`}
            aria-hidden="true"
          />
        )}

        {showArrows && canScrollRight && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              internalRef.current?.scrollBy({ left: scrollStep, behavior: 'smooth' });
            }}
            className={`absolute right-1 z-20 hidden md:flex items-center justify-center ${arrowButtonClasses} rounded-full bg-white/95 backdrop-blur-xs text-[#17243A] shadow-md border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isHovered ? 'opacity-100' : 'opacity-70'
            }`}
            title="Desplazar a la derecha"
            aria-label="Desplazar opciones a la derecha"
          >
            <ChevronRight className={arrowIconClasses} />
          </button>
        )}
      </div>
    );
  }
);

HorizontalScrollContainer.displayName = 'HorizontalScrollContainer';
