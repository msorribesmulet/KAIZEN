# Kaizen — Frontend

Interfaz de la app de seguimiento nutricional Kaizen. **Funciona con datos mock**:
no hay ninguna llamada al backend todavía. Los puntos exactos donde conectarla
están marcados con `// TODO: conectar con API`.

## Arrancar

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

Otros comandos:

```bash
pnpm build        # typecheck + build de producción en dist/
pnpm preview      # sirve dist/ (necesario para probar el service worker)
pnpm lint         # solo typecheck
pnpm format       # prettier sobre src/
```

## Stack

| Pieza      | Elección                                                     |
| ---------- | ------------------------------------------------------------ |
| Bundler    | Vite 8                                                         |
| UI         | React 19 + TypeScript en modo estricto                         |
| Estilos    | Tailwind CSS v4 puro (tokens en `@theme`, sin librería de componentes) |
| Rutas      | React Router 7                                                 |
| PWA        | `vite-plugin-pwa` (instalable, `registerType: autoUpdate`)     |
| Paquetes   | pnpm                                                           |

El modo estricto está apretado a propósito: `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `verbatimModuleSyntax` y `noUnusedLocals`. Si al
conectar la API algo se queja, suele ser una señal real, no ruido.

## Estructura

```
src/
├── components/          Componentes reutilizables
│   ├── ui/              Primitivas: Button, Input, Select, Card, Modal, ProgressBar
│   ├── MacroDonut.tsx   Anillo de macros (SVG puro, sin librería de charts)
│   ├── DateSelector.tsx Selector de día
│   ├── MealItem.tsx     Fila de comida registrada
│   ├── MacroTargetRow.tsx
│   ├── FoodFormModal.tsx
│   ├── Logo.tsx
│   └── icons.tsx
├── layouts/
│   └── AppLayout.tsx    Barra inferior en móvil, lateral en escritorio
├── pages/               Las cinco pantallas
├── store/               Estado de la app (hoy sobre mock, mañana sobre la API)
├── data/mockData.ts     Alimentos, registros y usuario de ejemplo
├── types/index.ts       Modelos: Food, Log, DailySummary, User…
└── utils/
    ├── nutrition.ts     BMR, TDEE, objetivo calórico y reparto de macros
    ├── format.ts        Formato es-ES de números, gramos, kcal y fechas
    ├── macros.ts        Paleta y orden de los macros
    ├── text.ts          Normalización para búsqueda sin tildes
    └── cn.ts            Unión de clases
```

## Pantallas

| Ruta         | Pantalla                                                             |
| ------------ | -------------------------------------------------------------------- |
| `/login`     | Inicio de sesión y registro (solo UI, entra sin validar)              |
| `/dashboard` | Resumen del día: calorías, anillo de macros, objetivos y comidas      |
| `/registrar` | Buscador de alimentos, gramos y cálculo en vivo                       |
| `/alimentos` | CRUD del catálogo de alimentos                                        |
| `/perfil`    | Datos del usuario y cálculo de objetivos                              |

## Dónde conectar la API

**Casi todo se conecta en un solo archivo: `src/store/AppDataProvider.tsx`.**
Ahí vive el estado y cada mutación lleva encima el endpoint que le corresponde.
El contrato del store está en `src/store/appDataContext.ts` y no tiene que
cambiar: al pasar a la API los métodos se vuelven `async` y actualizan el estado
con lo que devuelva el servidor en lugar de con el objeto construido en local.

| Archivo                                                        | Qué conectar                                            |
| -------------------------------------------------------------- | ------------------------------------------------------- |
| `store/AppDataProvider.tsx`                                     | `GET /logs`, `GET /summary/{date}`, `POST`/`DELETE /logs`, CRUD de `/foods`, `PUT /profile` |
| `pages/LoginPage.tsx`                                           | `POST /auth/login`, `POST /auth/register`               |
| `layouts/AppLayout.tsx`                                         | `POST /auth/logout` (dos botones: móvil y escritorio)   |
| `App.tsx`                                                       | Envolver las rutas privadas en un `<RequireAuth>`       |
| `data/mockData.ts`                                              | Borrar cuando el store ya no lo importe                 |

La URL del backend ya está en `.env` como `VITE_API_URL`
(`import.meta.env.VITE_API_URL`).

Un detalle a decidir al conectar: `getSummary` hoy suma los registros en el
cliente, pero el backend ya expone `GET /summary/{date}`. En cuanto uses el
endpoint, `summarize()` en `utils/nutrition.ts` deja de hacer falta.

## Lógica de cálculo

Implementada en `src/utils/nutrition.ts`, replicando las fórmulas del backend:

1. **BMR** (Mifflin-St Jeor)
   - Hombre: `(10 × peso) + (6.25 × altura) − (5 × edad) + 5`
   - Mujer: `(10 × peso) + (6.25 × altura) − (5 × edad) − 161`
2. **TDEE** = `BMR × factor de actividad` (1.2 / 1.375 / 1.55 / 1.725 / 1.9)
3. **Objetivo calórico** — con `ajuste_diario = (kg_semana × 7700) / 7`:
   perder `TDEE − ajuste`, ganar `TDEE + ajuste`, mantener `TDEE`
4. **Macros** — proteína `2 g/kg`, grasa `0.8 g/kg`, y los carbohidratos
   absorben las calorías restantes

Si conectas el backend y quieres que los objetivos vengan calculados de ahí,
sustituye la llamada a `calcNutritionTargets()` en `DashboardPage` y
`ProfilePage`. Merece la pena mantener la versión del cliente para el Perfil: es
lo que permite que el resultado se recalcule mientras escribes, sin ida y vuelta
al servidor.

## Nota sobre los colores de los macros

Los tres macros **no** son tres tonos de azul, y es a propósito. Un anillo con
azul, cian y violeta no se puede leer: azul↔violeta quedan a ΔE 9,8 en visión
normal (el suelo para distinguir dos colores adyacentes es 15) y a ΔE 1,9 bajo
protanopia. La paleta usada — azul `#3987e5`, aguamarina `#199e70`, ámbar
`#d95926` — pasa las comprobaciones de separación cromática y contraste sobre la
superficie oscura. El resto de la interfaz sí es azul.

Si cambias estos colores (`src/utils/macros.ts` y los tokens `--color-macro-*`
de `src/index.css`), valida la combinación nueva antes de darla por buena.

## PWA

El manifiesto y el service worker se generan en el build. Para probarlo hace
falta `pnpm build && pnpm preview` — en `pnpm dev` el service worker no se
registra. Iconos en `public/`: `pwa-192.png`, `pwa-512.png` y
`pwa-512-maskable.png` (a sangre, con la marca dentro de la zona segura del 80 %).