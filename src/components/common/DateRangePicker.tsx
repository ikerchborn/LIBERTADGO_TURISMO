import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  formatSingleDateShort,
  getCalendarGridDays,
  getSpanishMonthYear,
  getYearMonthFromDateString,
} from '../../utils/dateUtils.ts';

export type DateRangeField = 'start' | 'end';

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
  startLabel?: string;
  endLabel?: string;
  startId?: string;
  endId?: string;
  labelClassName?: string;
  gapClassName?: string;
}

const WEEKDAYS_ES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const POPOVER_SHADOW =
  '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)';

function getTodayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  startLabel = 'Fecha de llegada',
  endLabel = 'Fecha de salida',
  startId = 'start-date-input',
  endId = 'end-date-input',
  labelClassName = 'block text-[11px] font-semibold text-[#17243A] uppercase tracking-wider mb-1',
  gapClassName = 'gap-2.5',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<DateRangeField>('start');
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number } | null>(null);

  const initialYm = useMemo(() => {
    return (
      getYearMonthFromDateString(startDate) ||
      getYearMonthFromDateString(endDate) || {
        year: new Date().getFullYear(),
        monthIndex0: new Date().getMonth(),
      }
    );
  }, [startDate, endDate]);

  const [viewYear, setViewYear] = useState<number>(initialYm.year);
  const [viewMonth, setViewMonth] = useState<number>(initialYm.monthIndex0);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const todayStr = useMemo(() => getTodayDateString(), []);

  const updatePosition = useCallback(() => {
    const mobile = window.innerWidth < 640;
    setIsMobileViewport(mobile);

    if (mobile || !containerRef.current) {
      setPopoverCoords(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = 336;
    const estimatedHeight = 368;
    const padding = 12;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    const top = openAbove
      ? Math.max(padding, rect.top - estimatedHeight - 8)
      : Math.min(window.innerHeight - estimatedHeight - padding, rect.bottom + 8);

    const preferredLeft = activeField === 'end' ? rect.right - popoverWidth : rect.left;
    const left = Math.max(
      padding,
      Math.min(preferredLeft, window.innerWidth - popoverWidth - padding)
    );

    setPopoverCoords({ top, left });
  }, [activeField]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleResizeOrScroll = () => updatePosition();
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  const openForField = (field: DateRangeField) => {
    const targetDate = field === 'start' ? startDate || endDate : endDate || startDate;
    const ym = getYearMonthFromDateString(targetDate);
    if (ym) {
      setViewYear(ym.year);
      setViewMonth(ym.monthIndex0);
    }
    setActiveField(field);
    setHoverDate(null);
    setIsOpen(true);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dateString: string) => {
    if (activeField === 'start') {
      const nextEnd = endDate && dateString <= endDate ? endDate : '';
      onChange({ startDate: dateString, endDate: nextEnd });
      setActiveField('end');
      setHoverDate(null);
      return;
    }

    if (!startDate || dateString < startDate) {
      onChange({ startDate: dateString, endDate: '' });
      setActiveField('end');
      setHoverDate(null);
      return;
    }

    onChange({ startDate, endDate: dateString });
    setHoverDate(null);
    setIsOpen(false);
  };

  const calendarCells = useMemo(
    () => getCalendarGridDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const monthTitle = useMemo(
    () => getSpanishMonthYear(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const visualRangeEnd = useMemo(() => {
    if (endDate) return endDate;
    if (activeField === 'end' && startDate && hoverDate && hoverDate >= startDate) {
      return hoverDate;
    }
    return '';
  }, [endDate, activeField, startDate, hoverDate]);

  const hasRangeSpan = Boolean(startDate && visualRangeEnd && startDate < visualRangeEnd);

  const calendarCard = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Selector de rango de fechas"
      style={{
        boxShadow: POPOVER_SHADOW,
        ...(isMobileViewport || !popoverCoords
          ? {}
          : { top: `${popoverCoords.top}px`, left: `${popoverCoords.left}px` }),
      }}
      className={
        isMobileViewport
          ? 'w-full max-w-[340px] bg-[#FFFFFF] rounded-[16px] border border-[#E2E8F0] p-5'
          : 'fixed z-[80] w-[336px] bg-[#FFFFFF] rounded-[16px] border border-[#E2E8F0] p-5'
      }
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F5F9]">
        <h3 className="font-display font-semibold text-[16px] sm:text-[17px] text-[#0F172A] tracking-tight">
          {monthTitle}
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
            className="w-7 h-7 rounded-[8px] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
            className="w-7 h-7 rounded-[8px] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cabecera días de la semana (Lu - Do) */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS_ES.map((dayName) => (
          <div
            key={dayName}
            className="text-center text-[12px] font-semibold text-[#64748B] py-1 select-none"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div
        className="grid grid-cols-7 gap-y-1"
        onMouseLeave={() => setHoverDate(null)}
      >
        {calendarCells.map((cell) => {
          const isStart = Boolean(startDate && cell.dateString === startDate);
          const isEnd = Boolean(visualRangeEnd && cell.dateString === visualRangeEnd);
          const isBetween = Boolean(
            hasRangeSpan &&
              cell.dateString > startDate &&
              cell.dateString < visualRangeEnd
          );
          const isConfirmedEnd = Boolean(endDate && cell.dateString === endDate);
          const isToday = cell.dateString === todayStr;

          let buttonClasses =
            'relative z-10 w-9 h-9 mx-auto flex items-center justify-center rounded-[8px] text-[14px] transition-colors cursor-pointer select-none ';

          if (isStart || isConfirmedEnd) {
            buttonClasses += 'bg-[#E35B44] hover:bg-[#D14932] text-[#FFFFFF] font-semibold';
          } else if (isEnd && !endDate) {
            buttonClasses += 'bg-[#E35B44]/85 text-[#FFFFFF] font-semibold';
          } else if (isBetween) {
            buttonClasses += 'text-[#0F172A] font-medium hover:bg-[#F9D9D3]';
          } else if (!cell.isCurrentMonth) {
            buttonClasses += 'text-[#94A3B8] font-normal hover:bg-[#F1F5F9]';
          } else {
            buttonClasses += 'text-[#1E293B] font-medium hover:bg-[#F1F5F9]';
          }

          if (isToday && !isStart && !isEnd) {
            buttonClasses += ' ring-1 ring-[#CBD5E1]';
          }

          return (
            <div key={cell.dateString} className="relative flex items-center justify-center">
              {isBetween && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#FCECE9]"
                />
              )}
              {isStart && hasRangeSpan && (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 left-1/2 bg-[#FCECE9]"
                />
              )}
              {isEnd && hasRangeSpan && (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 right-1/2 bg-[#FCECE9]"
                />
              )}

              <button
                type="button"
                onClick={() => handleDayClick(cell.dateString)}
                onMouseEnter={() => {
                  if (activeField === 'end' && startDate && !endDate) {
                    setHoverDate(cell.dateString);
                  }
                }}
                aria-label={formatSingleDateShort(cell.dateString)}
                aria-pressed={isStart || isConfirmedEnd}
                className={buttonClasses}
              >
                {cell.dayNumber}
              </button>
            </div>
          );
        })}
      </div>

      {/* Pie informativo */}
      <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-[11px]">
        <span className="text-[#64748B] font-medium">
          {activeField === 'start'
            ? 'Selecciona fecha de llegada'
            : 'Selecciona fecha de salida'}
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-[#0F172A] hover:text-[#E35B44] font-semibold transition-colors cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative">
      <div className={`grid grid-cols-1 min-[360px]:grid-cols-2 ${gapClassName}`}>
        <div>
          <label htmlFor={startId} className={labelClassName}>
            {startLabel}
          </label>
          <button
            id={startId}
            type="button"
            onClick={() => openForField('start')}
            aria-expanded={isOpen && activeField === 'start'}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-xl border text-left transition-colors cursor-pointer ${
              isOpen && activeField === 'start'
                ? 'bg-white border-[#E35B44] ring-2 ring-[#E35B44]/15 text-[#0F172A]'
                : 'bg-[#F7F8FA] border-[#E2E8F0] hover:border-slate-300 text-[#17243A]'
            }`}
          >
            <span className="font-medium truncate">
              {startDate ? formatSingleDateShort(startDate) : 'Seleccionar'}
            </span>
            <Calendar className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          </button>
        </div>

        <div>
          <label htmlFor={endId} className={labelClassName}>
            {endLabel}
          </label>
          <button
            id={endId}
            type="button"
            onClick={() => openForField('end')}
            aria-expanded={isOpen && activeField === 'end'}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-xl border text-left transition-colors cursor-pointer ${
              isOpen && activeField === 'end'
                ? 'bg-white border-[#E35B44] ring-2 ring-[#E35B44]/15 text-[#0F172A]'
                : 'bg-[#F7F8FA] border-[#E2E8F0] hover:border-slate-300 text-[#17243A]'
            }`}
          >
            <span className={`font-medium truncate ${!endDate ? 'text-[#64748B]' : ''}`}>
              {endDate ? formatSingleDateShort(endDate) : 'Seleccionar'}
            </span>
            <Calendar className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          </button>
        </div>
      </div>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          isMobileViewport ? (
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-[1px]"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setIsOpen(false);
              }}
            >
              {calendarCard}
            </div>
          ) : (
            calendarCard
          ),
          document.body
        )}
    </div>
  );
};
