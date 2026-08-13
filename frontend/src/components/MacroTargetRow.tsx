import type { MacroKey } from '@/types';
import { formatGrams, MACRO_LABELS } from '@/utils/format';
import { MACRO_COLORS } from '@/utils/macros';
import { ProgressBar } from './ui/ProgressBar';

interface MacroTargetRowProps {
  macro: MacroKey;
  current: number;
  target: number;
}

/** Consumido vs objetivo de un macro, con barra de progreso en su color. */
export function MacroTargetRow({ macro, current, target }: MacroTargetRowProps) {
  const remaining = target - current;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-ink-soft flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{ backgroundColor: MACRO_COLORS[macro] }}
          />
          {MACRO_LABELS[macro]}
        </span>
        <span className="text-ink-muted text-sm tabular-nums">
          <span className="text-ink font-medium">{formatGrams(current)}</span>
          {' / '}
          {formatGrams(target)}
        </span>
      </div>

      <ProgressBar
        value={current}
        max={target}
        color={MACRO_COLORS[macro]}
        aria-label={`${MACRO_LABELS[macro]}: ${formatGrams(current)} de ${formatGrams(target)}`}
      />

      <p className="text-ink-muted text-xs tabular-nums">
        {remaining >= 0
          ? `Te faltan ${formatGrams(remaining)}`
          : `Te has pasado ${formatGrams(Math.abs(remaining))}`}
      </p>
    </div>
  );
}
