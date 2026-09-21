# Kaizen

App de seguimiento nutricional para control de calorías y macros. Calcula el gasto energético diario a partir de tu perfil y registra lo que comes con cálculo automático de macros según la cantidad consumida.

---

## Por qué existe

Llevaba tiempo contando calorías con apps de móvil y siempre chocaba con lo mismo: **escanear el código de barras de un producto del supermercado era de pago**. Justo la función que hace que registrar una comida tarde tres segundos en vez de dos minutos buscando "yogur griego natural" entre cincuenta resultados de dudosa procedencia.

Kaizen nace de ahí, con dos objetivos:

1. **Que el escaneo sea gratis.** Es lo que de verdad te hace seguir usando la app pasada la primera semana.
2. **Aprender construyéndolo.** Es mi proyecto para aprender a montar una aplicación completa de principio a fin: base de datos, API, interfaz y despliegue.

El nombre viene de *kaizen* (改善), "mejora continua": pequeños cambios sostenidos en el tiempo. Vale igual para la nutrición que para aprender a programar.

---

## Características

- Cálculo de TDEE (gasto energético total diario) con la fórmula de Mifflin-St Jeor
- Objetivo calórico ajustable según el ritmo de pérdida o ganancia de peso deseado
- Registro de alimentos con valores nutricionales por 100g
- Cálculo automático de macros según los gramos consumidos
- Cuentas de usuario: cada uno con sus alimentos, sus registros y su perfil
- Historial de alimentos reutilizable — los datos se guardan y se autocompletan
- Resumen diario de calorías y macros consumidos frente al objetivo

---

## Stack tecnológico

**Backend**
- Python — lenguaje principal de la lógica y la API
- FastAPI — framework web, moderno y rápido, con documentación automática de la API
- SQLModel — ORM para trabajar con la base de datos desde Python
- SQLite — base de datos ligera basada en un único archivo, sin servidor
- bcrypt — cifrado de contraseñas
- pytest — 114 tests sobre los cálculos, los endpoints y el aislamiento entre usuarios
- pylint y black — estilo y formato del código

**Frontend**
- React + TypeScript — interfaz de usuario con tipado estático estricto
- Vite — servidor de desarrollo y empaquetado
- Tailwind CSS — estilos, con enfoque mobile-first
- React Router — navegación entre pantallas
- vite-plugin-pwa — instalable en el móvil
- pnpm — gestor de paquetes

El frontend habla con el backend por HTTP; no comparten código. Las fórmulas
nutricionales están implementadas en los dos lados a propósito: el servidor es
la fuente de verdad, y la copia del cliente permite que la pantalla de Perfil
recalcule los objetivos mientras escribes, sin esperar al servidor.

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

Hacen falta los dos arrancados a la vez: el frontend pide todos sus datos a la API.

### Tests

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest tests/ -q
```

Usan una base de datos en memoria, así que no tocan tu `kaizen.db`.

### Hook de pre-commit (recomendado)

El repositorio incluye un hook que aborta el commit si intentas subir un `.env`,
una base de datos o una clave privada. Git no lo activa solo al clonar:

```bash
git config core.hooksPath .githooks
```

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

### 3. Objetivo calórico

El objetivo calórico se ajusta según el ritmo de peso deseado por semana. Partiendo de la base de que **1 kg de grasa corporal equivale aproximadamente a 7700 kcal**, el ajuste diario se calcula así:

```
Ajuste diario = (kg por semana × 7700) / 7
```

Y según el objetivo:

- **Perder peso:** `Objetivo = TDEE − ajuste diario`
- **Ganar peso:** `Objetivo = TDEE + ajuste diario`
- **Mantener:** `Objetivo = TDEE`

Por ejemplo, perder 0.5 kg/semana supone un déficit de unas 550 kcal/día. Se recomienda un ritmo de entre 0.5 y 1 kg por semana para minimizar la pérdida de masa muscular.

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
│   ├── app/
│   │   ├── main.py          # Punto de entrada de FastAPI, CORS y CSRF
│   │   ├── config.py        # Configuración leída del .env
│   │   ├── database.py      # Conexión a SQLite
│   │   ├── dependencies.py  # current_user: valida la cookie de sesión
│   │   ├── models/          # Tablas de la base de datos
│   │   ├── schemas/         # Modelos de entrada/salida de la API
│   │   ├── routers/         # Endpoints agrupados por recurso
│   │   └── services/        # Lógica de negocio (cálculos, cifrado, catálogo)
│   └── tests/               # pytest: cálculos, endpoints y aislamiento
│
└── frontend/
    └── src/
        ├── api/             # Una función por endpoint, sobre un fetch común
        ├── store/           # Estado compartido y carga de datos
        ├── pages/           # Las cinco pantallas
        ├── components/      # Componentes reutilizables
        ├── utils/           # Cálculos, formato y colores
        └── types/           # Tipos TypeScript compartidos
```

La separación entre `models`, `schemas`, `routers` y `services` mantiene el backend organizado: los modelos definen las tablas, los schemas definen qué entra y sale de la API, los routers gestionan las peticiones y los services contienen la lógica de cálculo.

En el frontend, `store/AuthProvider` sabe quién ha entrado y envuelve a todo lo demás; `store/AppDataProvider` guarda lo global (catálogo de alimentos y perfil) y **cuelga de las rutas protegidas**, para que no pida datos antes de que haya sesión. `store/useDayData` sirve lo que depende del día seleccionado (registros y resumen), que se recarga al cambiar de fecha.

Como la cookie de sesión es `httpOnly`, el navegador no puede leerla: al arrancar, la app pregunta a `GET /auth/me` si hay sesión. Un `401` ahí no es un fallo, es la respuesta.

---

## Roadmap

**V1 — Núcleo nutricional** ✅
- [x] Cálculo de BMR, TDEE y objetivo calórico
- [x] Cálculo y distribución de macros
- [x] Registro manual de alimentos
- [x] Resumen diario
- [x] Interfaz conectada a la API

**V4 — Cuentas de usuario** ✅
- [x] Registro e inicio de sesión con contraseña cifrada
- [x] Sesión en cookie `httpOnly`, con protección CSRF
- [x] Cada usuario ve solo su perfil, sus registros y sus alimentos

**Próximas versiones**
- [ ] V2 — Scraping de Mercadona para base de datos de productos
- [ ] V3 — Escáner de código de barras desde el móvil *(el motivo por el que existe el proyecto)*
- [ ] V5 — Despliegue con demo pública

La PWA ya está configurada: la app es instalable en el móvil desde el navegador.

### Limitaciones conocidas

- **Sin recuperación de contraseña.** Si la olvidas, no hay forma de recuperar la cuenta. Tampoco se verifica el correo al registrarse.
- **El catálogo de alimentos admite alimentos globales** (`user_id` nulo), pensados para los productos del scraping de V2. Todavía no hay ninguno ni forma de crearlos desde la API: hoy cada usuario solo ve los suyos.
- **Los alimentos borrados no se eliminan.** Se ocultan del catálogo pero la fila se conserva, para que los días en que los comiste sigan cuadrando. No hay pantalla para restaurarlos ni para vaciar la papelera.
- **SQLite.** Perfecto para uso local; para desplegarlo con varios usuarios haría falta PostgreSQL.

---

## Autor

Marc Sorribes Mulet
[github.com/msorribesmulet](https://github.com/msorribesmulet)
