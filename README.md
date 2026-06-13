# Kaizen

App de seguimiento nutricional para control de calorías y macros. Calcula el gasto energético diario a partir de tu perfil y registra lo que comes con cálculo automático de macros según la cantidad consumida.

---

## Características

- Cálculo de TDEE (gasto energético total diario) con la fórmula de Mifflin-St Jeor
- Distribución de macros según objetivo de déficit calórico
- Registro de alimentos con valores nutricionales por 100g
- Cálculo automático de macros según los gramos consumidos
- Historial de alimentos reutilizable — los datos se guardan y se autocompletan
- Resumen diario de calorías y macros consumidos frente al objetivo

---

## Stack tecnológico

**Backend**
- Python — lenguaje principal de la lógica y la API
- FastAPI — framework web, moderno y rápido, con documentación automática de la API
- SQLModel — ORM para trabajar con la base de datos desde Python
- SQLite — base de datos ligera basada en un único archivo, sin servidor

**Frontend**
- React + TypeScript — interfaz de usuario con tipado estático
- Tailwind CSS — estilos, con enfoque mobile-first
- pnpm — gestor de paquetes

---

## Requisitos previos

- Python 3.10 o superior
- Node.js 18 o superior
- pnpm — si no lo tienes, instálalo siguiendo la guía oficial en https://pnpm.io/installation (en Mac con Homebrew: `brew install pnpm`)

---

## Instalación

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend disponible en `http://localhost:8000`
Documentación interactiva de la API en `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

Frontend disponible en `http://localhost:5173`

---

## Variables de entorno

El proyecto usa archivos `.env` para la configuración. Cada carpeta incluye un `.env.example` como plantilla:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Los `.env` reales no se suben al repositorio (están en `.gitignore`).

---

## Cómo funciona el cálculo

### 1. Tasa metabólica basal (BMR)

El punto de partida es el **BMR** (Basal Metabolic Rate): las calorías que tu cuerpo necesita en reposo absoluto para mantener las funciones vitales. Se calcula con la fórmula de **Mifflin-St Jeor**:

- **Hombre:** `BMR = (10 × peso kg) + (6.25 × altura cm) − (5 × edad) + 5`
- **Mujer:** `BMR = (10 × peso kg) + (6.25 × altura cm) − (5 × edad) − 161`

### 2. Gasto energético total (TDEE)

El BMR solo cubre el metabolismo en reposo. Para obtener el **TDEE** (Total Daily Energy Expenditure) se multiplica por un factor de actividad:

| Nivel de actividad | Factor |
|--------------------|--------|
| Sedentario (poco o ningún ejercicio) | × 1.2 |
| Ligeramente activo (1–3 días/semana) | × 1.375 |
| Moderadamente activo (3–5 días/semana) | × 1.55 |
| Muy activo (6–7 días/semana) | × 1.725 |
| Extremadamente activo (físico + deporte) | × 1.9 |

### 3. Objetivo calórico con déficit

Para perder grasa, se aplica un **déficit del 20%** sobre el TDEE:

```
Objetivo calórico = TDEE × 0.80
```

Un déficit del 20% es conservador: suficiente para perder peso de forma constante sin sacrificar músculo ni rendimiento.

### 4. Distribución de macros

Con el objetivo calórico definido, los macros se reparten por prioridad:

1. **Proteína** — 2g por kg de peso corporal. Prioridad máxima para preservar masa muscular en déficit.
   - 1g de proteína = 4 kcal

2. **Grasa** — 0.8g por kg de peso corporal. Mínimo necesario para la salud hormonal.
   - 1g de grasa = 9 kcal

3. **Carbohidratos** — las calorías restantes después de asignar proteína y grasa.
   - 1g de carbohidrato = 4 kcal
   - `Carbohidratos (g) = (Objetivo calórico − kcal proteína − kcal grasa) / 4`

---

## Estructura del proyecto

```
kaizen/
├── backend/
│   └── app/
│       ├── main.py          # Punto de entrada de FastAPI
│       ├── database.py      # Conexión a SQLite
│       ├── models/          # Tablas de la base de datos
│       ├── schemas/         # Modelos de entrada/salida de la API
│       ├── routers/         # Endpoints agrupados por recurso
│       └── services/        # Lógica de negocio (cálculos)
│
└── frontend/
    └── src/
        ├── api/             # Llamadas al backend
        ├── pages/           # Pantallas (Perfil, Registro, Resumen)
        ├── components/      # Componentes reutilizables
        └── types/           # Tipos TypeScript compartidos
```

La separación entre `models`, `schemas`, `routers` y `services` mantiene el backend organizado: los modelos definen las tablas, los schemas definen qué entra y sale de la API, los routers gestionan las peticiones y los services contienen la lógica de cálculo.

---

## Roadmap

- [x] V1 — Cálculo de TDEE/macros y registro manual de alimentos
- [ ] V2 — Scraping de Mercadona para base de datos de productos
- [ ] V3 — Escáner de código de barras desde el móvil
- [ ] V4 — Login y soporte multiusuario
- [ ] V5 — PWA instalable en móvil

---

## Autor

Marc Sorribes Mulet
[github.com/msorribesmulet](https://github.com/msorribesmulet)
