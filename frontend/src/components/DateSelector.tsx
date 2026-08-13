import { useRef } from 'react';
import { IconButton } from './ui/Button';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { addDays, formatDateLabel, todayISO } from '@/utils/format';

interface DateSelectorProps {
  /** Fecha ISO `YYYY-MM-DD`. */
  value: string;
  onChange: (date: string) => void;
}

/**
 * Selector de día: flechas para moverse de uno en uno y un input de fecha
 * nativo (oculto tras el icono de calendario) para saltar a cualquier día.
 */
export function DateSelector({ value, onChange }: DateSelectorProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const isToday = value === todayISO();

  function openPicker() {
    const input = dateInputRef.current;
    if (!input) return;
    // showPicker no existe en todos los navegadores; el foco es el respaldo.
    if (typeof input.showPicker === 'function') input.showPicker();
    else input.focus();
  }

  return (
    <div className="flex items-center gap-1.5">
      <IconButton
        aria-label="Día anterior"
        variant="secondary"
        onClick={() => onChange(addDays(value, -1))}
      >
        <ChevronLeftIcon className="size-4.5" />
      </IconButton>

      <div className="relative flex min-w-0 flex-1 items-center justify-center">
        <button
          type="button"
          onClick={openPicker}
          className="hover:bg-surface-2 flex min-w-0 items-center gap-2 rounded-lg px-3 py-1.5 transition-colors"
        >
          <CalendarIcon className="text-ink-muted size-4 shrink-0" />
          <span className="text-ink truncate text-sm font-medium first-letter:uppercase">
            {formatDateLabel(value)}
          </span>
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={value}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          aria-label="Elegir fecha"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0 w-full opacity-0"
        />
      </div>

      <IconButton
        aria-label="Día siguiente"
        variant="secondary"
        disabled={isToday}
        onClick={() => onChange(addDays(value, 1))}
      >
        <ChevronRightIcon className="size-4.5" />
      </IconButton>
    </div>
  );
}
