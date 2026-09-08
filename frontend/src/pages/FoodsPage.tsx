import { useMemo, useState } from 'react';
import { FoodFormModal } from '@/components/FoodFormModal';
import { EditIcon, PlusIcon, SearchIcon, TrashIcon } from '@/components/icons';
import { Button, IconButton } from '@/components/ui/Button';
import { Card, EmptyState } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useAppData } from '@/store/appDataContext';
import type { Food, FoodInput } from '@/types';
import { cn } from '@/utils/cn';
import { formatNumber, MACRO_LABELS } from '@/utils/format';
import { MACRO_COLORS, MACRO_ORDER } from '@/utils/macros';
import { normalizeForSearch } from '@/utils/text';

/** CRUD del catálogo de alimentos. */
export function FoodsPage() {
  const { foods, loading, error, createFood, updateFood, deleteFood } = useAppData();

  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Food | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    if (!q) return foods;
    return foods.filter((food) => normalizeForSearch(food.name).includes(q));
  }, [foods, query]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(food: Food) {
    setEditing(food);
    setFormOpen(true);
  }

  async function run(action: Promise<void>, fallback: string) {
    setActionError(null);
    try {
      await action;
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : fallback);
    }
  }

  async function handleSubmit(input: FoodInput) {
    await run(
      editing ? updateFood(editing.id, input) : createFood(input),
      'No se pudo guardar el alimento',
    );
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    await run(deleteFood(id), 'No se pudo borrar el alimento');
  }

  // `protein` -> `protein_100g`, etc. TypeScript resuelve el tipo de la clave.
  const macroColumns = MACRO_ORDER.map((macro) => ({
    macro,
    label: MACRO_LABELS[macro],
    key: `${macro}_100g` as const,
  }));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-ink text-2xl font-semibold tracking-tight">Alimentos</h1>
          <p className="text-ink-muted mt-0.5 text-sm">
            {loading || error
              ? 'Valores por 100 g.'
              : `${foods.length} ${foods.length === 1 ? 'alimento' : 'alimentos'} en tu catálogo, con sus valores por 100 g.`}
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <PlusIcon className="size-4.5" />
          Nuevo alimento
        </Button>
      </header>

      {actionError ? (
        <Card className="p-4">
          <p className="text-danger text-sm">{actionError}</p>
        </Card>
      ) : null}

      <Card>
        <div className="border-line border-b p-4">
          <div className="relative">
            <SearchIcon className="text-ink-muted pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4.5" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en el catálogo…"
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
          <EmptyState title="Cargando tu catálogo…" description="" />
        ) : error ? (
          <EmptyState title="No se pudo cargar el catálogo" description={error} />
        ) : results.length === 0 ? (
          <EmptyState
            title={query ? 'Ningún alimento coincide' : 'Tu catálogo está vacío'}
            description={
              query
                ? `No hay resultados para «${query}».`
                : 'Crea tu primer alimento para poder registrarlo en tus comidas.'
            }
            action={
              !query && (
                <Button size="sm" onClick={openCreate}>
                  <PlusIcon className="size-4" />
                  Nuevo alimento
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* ---------- Tabla (escritorio) ---------- */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-line border-b text-left">
                    <th scope="col" className="text-ink-muted px-5 py-3 font-medium">
                      Alimento
                    </th>
                    <th scope="col" className="text-ink-muted px-3 py-3 text-right font-medium">
                      kcal
                    </th>
                    {macroColumns.map(({ macro, label }) => (
                      <th
                        key={macro}
                        scope="col"
                        className="text-ink-muted px-3 py-3 text-right font-medium"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-full"
                            style={{ backgroundColor: MACRO_COLORS[macro] }}
                          />
                          {label}
                        </span>
                      </th>
                    ))}
                    <th scope="col" className="px-5 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-line divide-y">
                  {results.map((food) => (
                    <tr key={food.id} className="group hover:bg-surface-2/60 transition-colors">
                      <th scope="row" className="text-ink px-5 py-3 text-left font-medium">
                        {food.name}
                      </th>
                      <td className="text-ink px-3 py-3 text-right tabular-nums">
                        {formatNumber(food.cal_100g)}
                      </td>
                      {macroColumns.map(({ macro, key }) => (
                        <td key={macro} className="text-ink-soft px-3 py-3 text-right tabular-nums">
                          {formatNumber(food[key], 1)}
                        </td>
                      ))}
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                          <IconButton
                            aria-label={`Editar ${food.name}`}
                            onClick={() => openEdit(food)}
                          >
                            <EditIcon className="size-4.5" />
                          </IconButton>
                          <IconButton
                            aria-label={`Eliminar ${food.name}`}
                            onClick={() => setPendingDelete(food)}
                            className="hover:bg-danger/12 hover:text-danger"
                          >
                            <TrashIcon className="size-4.5" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ---------- Lista (móvil) ---------- */}
            <ul className="divide-line divide-y md:hidden">
              {results.map((food) => (
                <li key={food.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-ink truncate text-sm font-medium">{food.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-ink-soft text-xs tabular-nums">
                        {formatNumber(food.cal_100g)} kcal
                      </span>
                      {macroColumns.map(({ macro, key }) => (
                        <span
                          key={macro}
                          className="text-ink-muted flex items-center gap-1 text-xs tabular-nums"
                        >
                          <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: MACRO_COLORS[macro] }}
                          />
                          {formatNumber(food[key], 1)} g
                        </span>
                      ))}
                    </div>
                  </div>
                  <IconButton aria-label={`Editar ${food.name}`} onClick={() => openEdit(food)}>
                    <EditIcon className="size-4.5" />
                  </IconButton>
                  <IconButton
                    aria-label={`Eliminar ${food.name}`}
                    onClick={() => setPendingDelete(food)}
                    className="hover:bg-danger/12 hover:text-danger"
                  >
                    <TrashIcon className="size-4.5" />
                  </IconButton>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <FoodFormModal
        open={formOpen}
        food={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* ---------- Confirmación de borrado ---------- */}
      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Eliminar alimento"
        footer={
          <>
            <Button variant="secondary" fullWidth onClick={() => setPendingDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" fullWidth onClick={confirmDelete}>
              <TrashIcon className="size-4.5" />
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-ink-soft text-sm">
          Vas a eliminar <span className="text-ink font-medium">{pendingDelete?.name}</span> del
          catálogo. También desaparecerá de las comidas que ya lo tuvieran registrado.
        </p>
      </Modal>
    </div>
  );
}
