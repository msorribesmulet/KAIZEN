from sqlmodel import SQLModel, create_engine, Session

# La URL de la base de datos. "sqlite:///kaizen.db" significa:
# usar SQLite, y guardar los datos en un archivo llamado kaizen.db
# (se crea solo la primera vez, en la carpeta desde donde ejecutes la app)
DATABASE_URL = "sqlite:///kaizen.db"

# El "engine" es el objeto que gestiona la conexión a la base de datos.
# echo=True hace que SQLModel imprima en consola el SQL que ejecuta por debajo
# (útil mientras aprendes, para VER qué SQL genera; lo puedes poner en False luego)
engine = create_engine(DATABASE_URL, echo=True)


# Esta función crea todas las tablas en la base de datos.
# SQLModel.metadata.create_all mira todos los modelos que hayas definido
# (las clases con table=True) y crea su tabla si no existe todavía.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


# Esta función "da" una sesión para hablar con la base de datos.
# Una sesión es una conversación: la abres, lees o escribes, y se cierra sola.
# El "yield" en vez de "return" es lo que permite que FastAPI la use y la
# cierre automáticamente después de cada petición (lo verás al hacer los endpoints).
def get_session():
    with Session(engine) as session:
        yield session
