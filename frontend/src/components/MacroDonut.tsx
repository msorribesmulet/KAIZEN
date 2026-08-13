import { useState } from 'react';
import type { MacroKey } from '@/types';
import { formatGrams, formatKcal, formatNumber, MACRO_LABELS } from '@/utils/format';
import { MACRO_COLORS, MACRO_ORDER, macroKcal } from '@/utils/macros';
import { cn } from '@/utils/cn';

interface MacroDonutProps {
  protein: number;
  carbs: number;
  fat: number;
  /** Calorías totales del día, mostradas en el centro del anillo. */
  totalCal: number;
  /** Objetivo calórico, para el subtítulo del centro. */
  targetCal?: number;
  size?: number;
  /**
   * Leyenda propia del anillo. Desactívala cuando la pantalla ya muestre un
   * desglose equivalente al lado, para no repetir la misma información.
   */
  showLegend?: boolean;
}

const STROKE = 18;
/** Hueco en grados entre segmentos: deja ver la pista y separa los rellenos. */
const GAP_DEG = 3;

/**
 * Anillo de distribución de macros.
 *
 * Cada macro ocupa la proporción de las CALORÍAS totales que aporta
 * (proteína y carbos ×4, grasa ×9), no la de gramos: así el anillo suma
 * exactamente las kcal del centro. Los gramos van en la leyenda.
 *
 * Al pasar el cursor (o enfocar con el teclado) sobre un segmento o su
 * entrada de leyenda, el centro pasa a detallar ese macro.
 */
export function MacroDonut({
  protein,
  carbs,
  fat,
  totalCal,
  targetCal,
  size = 200,
  showLegend = true,
}: MacroDonutProps) {
  const [active, setActive] = useState<MacroKey | null>(null);

  const grams: Record<MacroKey, number> = { protein, carbs, fat };
  const kcal: Record<MacroKey, number> = {
    protein: macroKcal('protein', protein),
    carbs: macroKcal('carbs', carbs),
    fat: macroKcal('fat', fat),
  };
  const totalMacroKcal = kcal.protein + kcal.carbs + kcal.fat;
  const isEmpty = totalMacroKcal <= 0;

  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapLength = (GAP_DEG / 360) * circumference;

  // Segmentos con longitud de arco acumulada, en el orden fijo de MACRO_ORDER.
  let cursor = 0;
  const segments = MACRO_ORDER.map((macro) => {
    const share = isEmpty ? 0 : kcal[macro] / totalMacroKcal;
    const length = share * circumference;
    const offset = cursor;
    cursor += length;
    return { macro, share, length, offset };
  }).filter((segment) => segment.length > 0);

  const activeSegment = segments.find((segment) => segment.macro === active);

  const describe = segments
    .map(
      (s) =>
        `${MACRO_LABELS[s.macro]} ${formatGrams(grams[s.macro])}, ${Math.round(s.share * 100)}%`,
    )
    .join('. ');

  return (
    // Container query, no breakpoint de viewport: anillo y leyenda se ponen en
    // fila según el ancho de la TARJETA (en el grid de escritorio es media
    // columna), no según el de la ventana. Así las etiquetas nunca se truncan.
    <div className="@container/donut">
      <div className="flex flex-col items-center gap-5 @md/donut:flex-row @md/donut:gap-7">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={isEmpty ? 'Sin macros registrados' : `Distribución de macros: ${describe}`}
            className="-rotate-90"
          >
            {/* Pista de fondo */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-surface-3)"
              strokeWidth={STROKE}
            />

            {segments.map(({ macro, length, offset }) => {
              // Un único segmento ocupa el anillo entero: sin hueco, o
              // desaparecería un trozo sin motivo.
              const isOnly = segments.length === 1;
              const dash = isOnly ? length : Math.max(1, length - gapLength);
              const dimmed = active !== null && active !== macro;

              return (
                <circle
                  key={macro}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={MACRO_COLORS[macro]}
                  strokeWidth={STROKE}
                  strokeLinecap="butt"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  onMouseEnter={() => setActive(macro)}
                  onMouseLeave={() => setActive(null)}
                  className={cn(
                    'cursor-default transition-opacity duration-200',
                    dimmed ? 'opacity-30' : 'opacity-100',
                  )}
                  style={{
                    transition: 'stroke-dasharray 600ms cubic-bezier(0.22,1,0.36,1), opacity 200ms',
                  }}
                />
              );
            })}
          </svg>

          {/* Centro: total de calorías, o el detalle del macro activo */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {activeSegment ? (
              <>
                <span className="text-ink-muted text-xs font-medium">
                  {MACRO_LABELS[activeSegment.macro]}
                </span>
                <span className="text-ink text-2xl font-semibold tabular-nums">
                  {formatGrams(grams[activeSegment.macro])}
                </span>
                <span className="text-ink-muted text-xs tabular-nums">
                  {Math.round(activeSegment.share * 100)}% · {formatKcal(kcal[activeSegment.macro])}
                </span>
              </>
            ) : (
              <>
                <span className="text-ink text-3xl font-semibold tabular-nums">
                  {formatNumber(totalCal)}
                </span>
                <span className="text-ink-muted text-xs">
                  {targetCal !== undefined ? `de ${formatNumber(targetCal)} kcal` : 'kcal'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Leyenda: la identidad nunca depende solo del color */}
        {showLegend && (
          <ul className="flex w-full min-w-0 flex-col gap-2.5">
            {MACRO_ORDER.map((macro) => {
              const share = isEmpty ? 0 : (kcal[macro] / totalMacroKcal) * 100;
              const dimmed = active !== null && active !== macro;

              return (
                <li key={macro}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(macro)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(macro)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left',
                      'hover:bg-surface-2 transition-[background-color,opacity] duration-200',
                      dimmed && 'opacity-45',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: MACRO_COLORS[macro] }}
                    />
                    <span className="text-ink-soft flex-1 text-sm">{MACRO_LABELS[macro]}</span>
                    <span className="text-ink shrink-0 text-sm font-medium tabular-nums">
                      {formatGrams(grams[macro])}
                    </span>
                    <span className="text-ink-muted w-10 shrink-0 text-right text-xs tabular-nums">
                      {Math.round(share)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
