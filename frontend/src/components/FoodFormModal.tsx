import { useEffect, useState, type FormEvent } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import type { Food, FoodInput } from '@/types';

interface FoodFormModalProps {
  open: boolean;
  /** Alimento a editar, o `null` para crear uno nuevo. */
  food: Food | null;
  onClose: () => void;
  onSubmit: (input: FoodInput) => void;
}

/** Los campos numéricos se manejan como texto para no pelear con el input. */
type FormState = Record<keyof FoodInput, string>;

const EMPTY: FormState = {
  name: '',
  cal_100g: '',
  protein_100g: '',
  carbs_100g: '',
  fat_100g: '',
};

function toFormState(food: Food): FormState {
  return {
    name: food.name,
    cal_100g: String(food.cal_100g),
    protein_100g: String(food.protein_100g),
    carbs_100g: String(food.carbs_100g),
    fat_100g: String(food.fat_100g),
  };
}

/** Formulario de alta y edición de alimentos, en un diálogo modal. */
export function FoodFormModal({ open, food, onClose, onSubmit }: FoodFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FoodInput, string>>>({});

  // Al abrir, carga el alimento a editar o limpia el formulario.
  useEffect(() => {
    if (!open) return;
    setForm(food ? toFormState(food) : EMPTY);
    setErrors({});
  }, [open, food]);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const name = form.name.trim();
    const numbers = {
      cal_100g: Number(form.cal_100g),
      protein_100g: Number(form.protein_100g),
      carbs_100g: Number(form.carbs_100g),
      fat_100g: Number(form.fat_100g),
    };

    const nextErrors: Partial<Record<keyof FoodInput, string>> = {};
    if (!name) nextErrors.name = 'El nombre es obligatorio.';
    for (const [field, value] of Object.entries(numbers) as [keyof typeof numbers, number][]) {
      if (form[field].trim() === '' || !Number.isFinite(value) || value < 0) {
        nextErrors[field] = 'Introduce un número igual o mayor que 0.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({ name, ...numbers });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={food ? 'Editar alimento' : 'Nuevo alimento'}
      footer={
        <>
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="food-form" fullWidth>
            {food ? 'Guardar cambios' : 'Crear alimento'}
          </Button>
        </>
      }
    >
      <form id="food-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre"
          placeholder="Ej. Pechuga de pollo"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          {...(errors.name !== undefined && { error: errors.name })}
        />

        <p className="text-ink-muted -mb-1 text-xs font-medium tracking-wide uppercase">
          Valores por 100 g
        </p>

        <Input
          label="Calorías"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          suffix="kcal"
          placeholder="165"
          value={form.cal_100g}
          onChange={(e) => set('cal_100g', e.target.value)}
          {...(errors.cal_100g !== undefined && { error: errors.cal_100g })}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Proteínas"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            suffix="g"
            placeholder="31"
            value={form.protein_100g}
            onChange={(e) => set('protein_100g', e.target.value)}
            {...(errors.protein_100g !== undefined && { error: errors.protein_100g })}
          />
          <Input
            label="Carbohidratos"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            suffix="g"
            placeholder="0"
            value={form.carbs_100g}
            onChange={(e) => set('carbs_100g', e.target.value)}
            {...(errors.carbs_100g !== undefined && { error: errors.carbs_100g })}
          />
          <Input
            label="Grasas"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            suffix="g"
            placeholder="3.6"
            value={form.fat_100g}
            onChange={(e) => set('fat_100g', e.target.value)}
            {...(errors.fat_100g !== undefined && { error: errors.fat_100g })}
          />
        </div>
      </form>
    </Modal>
  );
}
