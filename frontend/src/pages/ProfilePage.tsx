import { useState, type FormEvent } from 'react';
import { CheckIcon, FlameIcon } from '@/components/icons';
import { MacroDonut } from '@/components/MacroDonut';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { useAppData } from '@/store/appDataContext';
import type { ActivityLevel, Goal, Sex, User, UserProfileInput } from '@/types';
import {
  ACTIVITY_LABELS,
  formatGrams,
  formatNumber,
  GOAL_LABELS,
  MACRO_LABELS,
  SEX_LABELS,
} from '@/utils/format';
import { MACRO_COLORS, MACRO_ORDER } from '@/utils/macros';
import { ACTIVITY_FACTORS, calcNutritionTargets, KCAL_PER_GRAM } from '@/utils/nutrition';

/** Los campos numéricos se manejan como texto mientras se editan. */
interface FormState {
  weight_kg: string;
  height_cm: string;
  age: string;
  sex: Sex;
  activity_level: ActivityLevel;
  goal: Goal;
  kg_per_week: string;
}

/**
 * Perfil y ajustes. Los objetivos se recalculan en vivo con cada cambio,
 * usando las mismas fórmulas que el backend (Mifflin-St Jeor → TDEE →
 * objetivo calórico → reparto de macros).
 */
export function ProfilePage() {
  const { user, loading, error } = useAppData();

  if (loading) {
    return <p className="text-ink-muted p-5 text-sm">Cargando tu perfil…</p>;
  }

  if (error) {
    return <p className="text-danger p-5 text-sm">{error}</p>;
  }

  return <ProfileForm key={user?.id ?? 'nuevo'} user={user} />;
}

const EMPTY_FORM: FormState = {
  weight_kg: '',
  height_cm: '',
  age: '',
  sex: 'male',
  activity_level: 'moderate',
  goal: 'maintain',
  kg_per_week: '0',
};

function formFrom(user: User | null): FormState {
  if (!user) return EMPTY_FORM;

  return {
    weight_kg: String(user.weight_kg),
    height_cm: String(user.height_cm),
    age: String(user.age),
    sex: user.sex,
    activity_level: user.activity_level,
    goal: user.goal,
    kg_per_week: String(user.kg_per_week),
  };
}

function ProfileForm({ user }: { user: User | null }) {
  const { updateProfile } = useAppData();

  const [form, setForm] = useState<FormState>(() => formFrom(user));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setSaveError(null);
  }

  // Perfil numérico usado para el cálculo. Los campos vacíos valen 0, así el
  // resultado se actualiza sin romperse mientras se escribe.
  const profile: UserProfileInput = {
    weight_kg: Number(form.weight_kg) || 0,
    height_cm: Number(form.height_cm) || 0,
    age: Number(form.age) || 0,
    sex: form.sex,
    activity_level: form.activity_level,
    goal: form.goal,
    kg_per_week: Number(form.kg_per_week) || 0,
  };

  const targets = calcNutritionTargets(profile);
  const isMaintaining = form.goal === 'maintain';
  const dailyAdjustment = Math.abs(targets.target_cal - targets.tdee);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaveError(null);

    try {
      await updateProfile(profile);
      setSaved(true);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'No se pudo guardar');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-ink text-2xl font-semibold tracking-tight">Perfil</h1>
        <p className="text-ink-muted mt-0.5 text-sm">
          Tus datos definen el objetivo calórico y el reparto de macros. Se recalculan al vuelo.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        {/* ---------- Formulario ---------- */}
        <Card title="Tus datos" className="lg:order-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Peso"
                type="number"
                inputMode="decimal"
                min={1}
                step="any"
                suffix="kg"
                value={form.weight_kg}
                onChange={(e) => set('weight_kg', e.target.value)}
              />
              <Input
                label="Altura"
                type="number"
                inputMode="numeric"
                min={1}
                step="any"
                suffix="cm"
                value={form.height_cm}
                onChange={(e) => set('height_cm', e.target.value)}
              />
              <Input
                label="Edad"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                suffix="años"
                value={form.age}
                onChange={(e) => set('age', e.target.value)}
              />
              <Select
                label="Sexo"
                value={form.sex}
                onChange={(e) => set('sex', e.target.value as Sex)}
              >
                {Object.entries(SEX_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <Select
              label="Nivel de actividad"
              value={form.activity_level}
              onChange={(e) => set('activity_level', e.target.value as ActivityLevel)}
              hint={`Factor aplicado: ×${ACTIVITY_FACTORS[form.activity_level]}`}
            >
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            <Select
              label="Objetivo"
              value={form.goal}
              onChange={(e) => set('goal', e.target.value as Goal)}
            >
              {Object.entries(GOAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            {!isMaintaining && (
              <Input
                label="Ritmo semanal"
                type="number"
                inputMode="decimal"
                min={0}
                max={2}
                step={0.1}
                suffix="kg/sem"
                value={form.kg_per_week}
                onChange={(e) => set('kg_per_week', e.target.value)}
                hint={`Ajuste de ${formatNumber(dailyAdjustment)} kcal al día (1 kg de grasa ≈ 7.700 kcal).`}
              />
            )}

            {saveError ? <p className="text-danger text-sm">{saveError}</p> : null}

            <Button type="submit" size="lg" fullWidth className="mt-1">
              {saved ? <CheckIcon className="size-5" /> : null}
              {saved ? 'Guardado' : 'Guardar cambios'}
            </Button>
          </form>
        </Card>

        {/* ---------- Resultado del cálculo ---------- */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-8 lg:order-2">
          <Card className="p-5">
            <p className="text-ink-muted flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
              <FlameIcon className="size-4" />
              Tu objetivo diario
            </p>
            <p className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-ink text-4xl font-semibold tabular-nums">
                {formatNumber(targets.target_cal)}
              </span>
              <span className="text-ink-muted text-sm">kcal / día</span>
            </p>

            {/* Cómo se llega a esa cifra */}
            <dl className="border-line mt-5 grid grid-cols-3 gap-3 border-t pt-4">
              <div>
                <dt className="text-ink-muted text-xs">BMR</dt>
                <dd className="text-ink mt-0.5 text-base font-medium tabular-nums">
                  {formatNumber(targets.bmr)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted text-xs">TDEE</dt>
                <dd className="text-ink mt-0.5 text-base font-medium tabular-nums">
                  {formatNumber(targets.tdee)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted text-xs">Ajuste</dt>
                <dd
                  className={`mt-0.5 text-base font-medium tabular-nums ${
                    isMaintaining
                      ? 'text-ink'
                      : form.goal === 'lose'
                        ? 'text-danger'
                        : 'text-success'
                  }`}
                >
                  {isMaintaining
                    ? '—'
                    : `${form.goal === 'lose' ? '−' : '+'}${formatNumber(dailyAdjustment)}`}
                </dd>
              </div>
            </dl>

            <p className="text-ink-muted mt-4 text-xs leading-relaxed">
              Mifflin-St Jeor para el metabolismo basal, multiplicado por el factor de actividad (×
              {ACTIVITY_FACTORS[form.activity_level]}) y ajustado según tu objetivo.
            </p>
          </Card>

          <Card title="Macros recomendados" className="p-5 pt-5">
            <div className="pt-2">
              <MacroDonut
                protein={targets.protein_g}
                carbs={targets.carbs_g}
                fat={targets.fat_g}
                totalCal={targets.target_cal}
                size={168}
                // El desglose de abajo ya nombra los tres macros con su color:
                // repetir la leyenda del anillo sería decir lo mismo dos veces.
                showLegend={false}
              />
            </div>

            <ul className="border-line mt-5 flex flex-col gap-2 border-t pt-4">
              {MACRO_ORDER.map((macro) => {
                const grams = {
                  protein: targets.protein_g,
                  carbs: targets.carbs_g,
                  fat: targets.fat_g,
                }[macro];

                const rule = {
                  protein: '2 g por kg de peso',
                  carbs: 'las calorías restantes',
                  fat: '0,8 g por kg de peso',
                }[macro];

                return (
                  <li key={macro} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: MACRO_COLORS[macro] }}
                      />
                      <span className="text-ink-soft truncate">{MACRO_LABELS[macro]}</span>
                      <span className="text-ink-muted hidden shrink-0 text-xs sm:inline">
                        · {rule}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      <span className="text-ink font-medium">{formatGrams(grams)}</span>
                      <span className="text-ink-muted ml-1.5 text-xs">
                        {formatNumber(grams * KCAL_PER_GRAM[macro])} kcal
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
