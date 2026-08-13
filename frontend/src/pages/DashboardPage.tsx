import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DateSelector } from '@/components/DateSelector';
import { MacroDonut } from '@/components/MacroDonut';
import { MacroTargetRow } from '@/components/MacroTargetRow';
import { MealItem } from '@/components/MealItem';
import { FlameIcon, PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Card, EmptyState } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppData } from '@/store/appDataContext';
import { MACRO_ORDER } from '@/utils/macros';
import { formatKcal, formatNumber, todayISO } from '@/utils/format';
import { calcNutritionTargets } from '@/utils/nutrition';

/** Resumen diario: calorías, macros y las comidas registradas del día. */
export function DashboardPage() {
  const { user, getEntriesByDate, getSummary, deleteLog } = useAppData();
  const [date, setDate] = useState(todayISO());

  const entries = getEntriesByDate(date);
  const summary = getSummary(date);
  const targets = calcNutritionTargets(user);

  const remaining = targets.target_cal - summary.total_cal;
  const macroTargets = {
    protein: targets.protein_g,
    carbs: targets.carbs_g,
    fat: targets.fat_g,
  };
  const macroCurrent = {
    protein: summary.total_protein,
    carbs: summary.total_carbs,
    fat: summary.total_fat,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ---------- Cabecera con selector de día ---------- */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-ink text-2xl font-semibold tracking-tight">Resumen diario</h1>
          <p className="text-ink-muted mt-0.5 text-sm">
            {entries.length === 0
              ? 'Sin comidas registradas todavía.'
              : `${entries.length} ${entries.length === 1 ? 'comida registrada' : 'comidas registradas'}.`}
          </p>
        </div>
        <DateSelector value={date} onChange={setDate} />
      </header>

      {/* ---------- Calorías ---------- */}
      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-ink-muted flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
              <FlameIcon className="size-4" />
              Calorías
            </p>
            <p className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-ink text-4xl font-semibold tabular-nums">
                {formatNumber(summary.total_cal)}
              </span>
              <span className="text-ink-muted text-sm">
                / {formatNumber(targets.target_cal)} kcal
              </span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-ink-muted text-xs font-medium tracking-wide uppercase">
              {remaining >= 0 ? 'Te quedan' : 'Te has pasado'}
            </p>
            <p
              className={`mt-1.5 text-2xl font-semibold tabular-nums ${
                remaining >= 0 ? 'text-brand-ink' : 'text-danger'
              }`}
            >
              {formatKcal(Math.abs(remaining))}
            </p>
          </div>
        </div>

        <ProgressBar
          value={summary.total_cal}
          max={targets.target_cal}
          className="mt-4 h-2.5"
          aria-label={`Calorías: ${formatNumber(summary.total_cal)} de ${formatNumber(targets.target_cal)} kcal`}
        />
      </Card>

      {/* ---------- Macros: anillo + objetivos ---------- */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card title="Distribución de macros" className="p-5 pt-5">
          <div className="pt-2">
            <MacroDonut
              protein={summary.total_protein}
              carbs={summary.total_carbs}
              fat={summary.total_fat}
              totalCal={summary.total_cal}
              targetCal={targets.target_cal}
            />
          </div>
        </Card>

        {/* `flex` + `justify-center` centra las tres barras verticalmente: en
            escritorio esta tarjeta se estira a la altura de la del anillo. */}
        <Card title="Objetivos de hoy" className="flex flex-col p-5 pt-5">
          <div className="flex flex-1 flex-col justify-center gap-5 py-2">
            {MACRO_ORDER.map((macro) => (
              <MacroTargetRow
                key={macro}
                macro={macro}
                current={macroCurrent[macro]}
                target={macroTargets[macro]}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* ---------- Comidas del día ---------- */}
      <Card
        title="Comidas del día"
        action={
          <Link to="/registrar">
            <Button size="sm" variant="secondary">
              <PlusIcon className="size-4" />
              Añadir
            </Button>
          </Link>
        }
      >
        {entries.length === 0 ? (
          <EmptyState
            title="Aún no hay nada registrado"
            description="Añade tu primera comida del día para ver cómo avanzan tus calorías y macros."
            action={
              <Link to="/registrar">
                <Button size="sm">
                  <PlusIcon className="size-4" />
                  Registrar comida
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-line divide-y">
            {entries.map((entry) => (
              <MealItem key={entry.log.id} entry={entry} onDelete={deleteLog} />
            ))}
          </ul>
        )}
      </Card>

      {/* ---------- Acción principal (móvil) ---------- */}
      <Link to="/registrar" className="lg:hidden">
        <Button size="lg" fullWidth>
          <PlusIcon className="size-5" />
          Registrar comida
        </Button>
      </Link>
    </div>
  );
}
