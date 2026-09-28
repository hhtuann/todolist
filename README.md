# Todo List API

Small Todo REST API built with FastAPI, SQLAlchemy, SQLite, and Docker.

## Run with Docker

```bash
docker compose up --build
```

Open:

- Todo UI: http://localhost:3000
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/health

SQLite data is stored in the `todo_data` Docker volume.

The React frontend is built as a static Vite app and served from its own container.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/tasks` | List tasks; optionally filter with `?completed=true/false` |
| GET | `/tasks/{id}` | Get a task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/{id}` | Update task fields |
| PATCH | `/tasks/{id}/complete` | Mark a task complete |
| DELETE | `/tasks/{id}` | Delete a task |

Example create request:

```json
{
  "title": "Learn Docker",
  "description": "Containerize the Todo API"
}
```

## Run locally

Backend:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
pytest
uvicorn app.main:app --reload
```

Frontend (in another terminal):

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` for the Vite development UI.
