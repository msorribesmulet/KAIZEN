import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addDays,
  formatDateLabel,
  formatGrams,
  formatKcal,
  formatNumber,
  fromISODate,
  toISODate,
} from './format';

describe('formatNumber', () => {
  it('usa coma decimal', () => {
    expect(formatNumber(31.5, 1)).toBe('31,5');
  });

  it('separa los miles con punto a partir de cinco cifras', () => {
    expect(formatNumber(18500)).toBe('18.500');
  });

  it('no separa los números de cuatro cifras, como pide la norma española', () => {
    expect(formatNumber(1850)).toBe('1850');
  });

  it('redondea a entero por defecto', () => {
    expect(formatNumber(2.5)).toBe('3');
  });
});

describe('formatKcal', () => {
  it('añade la unidad', () => {
    expect(formatKcal(420)).toBe('420 kcal');
  });
});

describe('formatGrams', () => {
  it('los enteros van sin decimales', () => {
    expect(formatGrams(31)).toBe('31 g');
  });

  it('los no enteros llevan un decimal', () => {
    expect(formatGrams(31.5)).toBe('31,5 g');
  });
});

describe('fechas ISO', () => {
  it('toISODate rellena mes y día con ceros', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('fromISODate y toISODate son inversas', () => {
    expect(toISODate(fromISODate('2026-09-25'))).toBe('2026-09-25');
  });

  it('addDays cruza el cambio de mes', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('addDays cruza el cambio de año hacia atrás', () => {
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('addDays conoce los años bisiestos', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('addDays no se descuadra con el cambio de hora de octubre', () => {
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
  });
});

describe('formatDateLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 25, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('nombra hoy, ayer y mañana', () => {
    expect(formatDateLabel('2026-09-25')).toBe('Hoy');
    expect(formatDateLabel('2026-09-24')).toBe('Ayer');
    expect(formatDateLabel('2026-09-26')).toBe('Mañana');
  });

  it('muestra el día de la semana sin año si es el año en curso', () => {
    expect(formatDateLabel('2026-08-12')).toBe('miércoles, 12 de agosto');
  });

  it('añade el año si es otro', () => {
    expect(formatDateLabel('2025-08-12')).toBe('martes, 12 de agosto de 2025');
  });
});
