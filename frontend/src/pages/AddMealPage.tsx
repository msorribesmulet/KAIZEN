import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLog } from '@/api/logs';
import { CheckIcon, SearchIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Card, EmptyState } from '@/components/ui/Card';
import { DateSelector } from '@/components/DateSelector';
import { useAppData } from '@/store/appDataContext';
import type { Food, MacroKey } from '@/types';
import { cn } from '@/utils/cn';
import { formatGrams, formatNumber, MACRO_LABELS, todayISO } from '@/utils/format';
import { MACRO_COLORS, MACRO_ORDER } from '@/utils/macros';
import { calcServing } from '@/utils/nutrition';
import { normalizeForSearch } from '@/utils/text';

/** Buscar un alimento, indicar los gramos y añadirlo al día. */
export function AddMealPage() {
  const navigate = useNavigate();
  const { foods, loading, error } = useAppData();

  const [date, setDate] = useState(todayISO());
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Food | null>(null);
  const [gramsInput, setGramsInput] = useState('100');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    if (!q) return foods;
    return foods.filter((food) => normalizeForSearch(food.name).includes(q));
  }, [foods, query]);

  const grams = Number(gramsInput);
  const validGrams = Number.isFinite(grams) && grams > 0;
  const serving = selected && validGrams ? calcServing(selected, grams) : null;

  async function handleConfirm() {
    if (!selected || !validGrams) return;

    setSaving(true);
    setSaveError(null);

    try {
      await createLog({ date, food_id: selected.id, grams });
      navigate('/dashboard');
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'No se pudo registrar');
      setSaving(false);
    }
  }

  function handleSelect(food: Food) {
    setSelected((current) => (current?.id === food.id ? null : food));
    setGramsInput('100');
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-ink text-2xl font-semibold tracking-tight">Registrar comida</h1>
          <p className="text-ink-muted mt-0.5 text-sm">
            Busca el alimento e indica cuántos gramos has tomado.
          </p>
        </div>
        <DateSelector value={date} onChange={setDate} />
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        {/* ---------- Buscador y lista ---------- */}
        {/* `overflow-hidden`: la lista scrollea dentro y debe recortarse contra
            las esquinas redondeadas de la tarjeta, no desbordarlas. */}
        <Card className="overflow-hidden">
          <div className="border-line border-b p-4">
            <div className="relative">
              <SearchIcon className="text-ink-muted pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4.5" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar alimento…"
                aria-label="Buscar alimento"
                className={cn(
                  'border-line bg-surface-2 text-ink h-11 w-full rounded-xl border pr-3.5 pl-11',
                  'placeholder:text-ink-muted transition-colors duration-150',
                  'hover:border-line-strong focus:border-brand focus:ring-brand/35 focus:ring-2 focus:outline-none',
                )}
              />
            </div>
          </div>

          {loading ? (
            <EmptyState title="Cargando el catálogo…" description="" />
          ) : error ? (
            <EmptyState title="No se pudo cargar el catálogo" description={error} />
          ) : results.length === 0 ? (
            <EmptyState
              title="Ningún alimento coincide"
              description={`No hay resultados para «${query}». Puedes crearlo desde la pantalla de Alimentos.`}
            />
          ) : (
            // El degradado del pie hace que la fila recortada se lea como
            // «sigue habiendo lista» y no como un error de maquetación.
            <div className="relative">
              <ul className="divide-line max-h-[26rem] divide-y overflow-y-auto">
                {results.map((food) => {
                  const isSelected = selected?.id === food.id;
                  return (
                    <li key={food.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(food)}
                        aria-pressed={isSelected}
                        className={cn(
                          'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150',
                          isSelected ? 'bg-brand/12' : 'hover:bg-surface-2/60',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'truncate text-sm font-medium',
                              isSelected ? 'text-brand-ink' : 'text-ink',
                            )}
                          >
                            {food.name}
                          </p>
                          <p className="text-ink-muted mt-0.5 text-xs tabular-nums">
                            {formatNumber(food.cal_100g)} kcal · P{' '}
                            {formatNumber(food.protein_100g, 1)} · C{' '}
                            {formatNumber(food.carbs_100g, 1)} · G {formatNumber(food.fat_100g, 1)}
                            <span className="ml-1">/ 100 g</span>
                          </p>
                        </div>
                        <span
                          className={cn(
                            'flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-150',
                            isSelected
                              ? 'border-brand bg-brand text-white'
                              : 'border-line-strong text-transparent',
                          )}
                        >
                          <CheckIcon className="size-3.5" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div
                aria-hidden="true"
                className="from-surface pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent"
              />
            </div>
          )}
        </Card>

        {/* ---------- Panel de cantidad y cálculo en vivo ---------- */}
        <Card title="Cantidad" className="lg:sticky lg:top-8">
          {!selected ? (
            <EmptyState
              title="Selecciona un alimento"
              description="Elige uno de la lista para calcular sus calorías y macros según los gramos."
            />
          ) : (
            <div className="flex flex-col gap-5 p-5">
              <div>
                <p className="text-ink text-base font-medium">{selected.name}</p>
                <p className="text-ink-muted mt-0.5 text-xs">
                  {formatNumber(selected.cal_100g)} kcal por 100 g
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="grams" className="text-ink-soft text-sm font-medium">
                  Gramos consumidos
                </label>
                <div className="relative">
                  <input
                    id="grams"
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step={1}
                    value={gramsInput}
                    onChange={(e) => setGramsInput(e.target.value)}
                    autoFocus
                    className={cn(
                      'border-line bg-surface-2 h-14 w-full rounded-xl border pr-12 pl-4',
                      'text-ink text-2xl font-semibold tabular-nums transition-colors duration-150',
                      'hover:border-line-strong focus:border-brand focus:ring-brand/35 focus:ring-2 focus:outline-none',
                    )}
                  />
                  <span className="text-ink-muted pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm">
                    g
                  </span>
                </div>

                {/* Cantidades habituales */}
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {[50, 100, 150, 200, 250].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGramsInput(String(preset))}
                      className={cn(
                        'border-line rounded-lg border px-2.5 py-1 text-xs tabular-nums',
                        'text-ink-soft hover:border-brand/50 hover:bg-brand/10 hover:text-brand-ink transition-colors duration-150',
                      )}
                    >
                      {preset} g
                    </button>
                  ))}
                </div>
              </div>

              {/* Cálculo en tiempo real */}
              <div className="border-line bg-surface-2/60 rounded-xl border p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-ink-muted text-xs font-medium tracking-wide uppercase">
                    Aporta
                  </span>
                  <span className="text-ink text-2xl font-semibold tabular-nums">
                    {serving ? formatNumber(serving.cal) : '—'}
                    <span className="text-ink-muted ml-1 text-sm font-normal">kcal</span>
                  </span>
                </div>

                <dl className="border-line mt-3 grid grid-cols-3 gap-2 border-t pt-3">
                  {MACRO_ORDER.map((macro: MacroKey) => (
                    <div key={macro} className="flex flex-col gap-1">
                      <dt className="text-ink-muted flex items-center gap-1.5 text-xs">
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full"
                          style={{ backgroundColor: MACRO_COLORS[macro] }}
                        />
                        <span className="truncate">{MACRO_LABELS[macro]}</span>
                      </dt>
                      <dd className="text-ink text-sm font-medium tabular-nums">
                        {serving ? formatGrams(Math.round(serving[macro] * 10) / 10) : '—'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {saveError ? <p className="text-danger text-sm">{saveError}</p> : null}

              <Button size="lg" fullWidth disabled={!validGrams || saving} onClick={handleConfirm}>
                <CheckIcon className="size-5" />
                {saving ? 'Guardando…' : 'Añadir al registro'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
