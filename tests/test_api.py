from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


TEST_DB = Path("test_todos.db")
engine = create_engine(f"sqlite:///{TEST_DB}", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def setup_module():
    Base.metadata.create_all(bind=engine)


def teardown_module():
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    TEST_DB.unlink(missing_ok=True)


def test_task_crud_flow():
    with TestClient(app) as client:
        created = client.post(
            "/tasks",
            json={"title": "Learn Docker", "description": "Containerize the API"},
        )
        assert created.status_code == 201
        task = created.json()
        task_id = task["id"]
        assert task["completed"] is False

        listed = client.get("/tasks?completed=false")
        assert listed.status_code == 200
        assert len(listed.json()) == 1

        updated = client.put(f"/tasks/{task_id}", json={"title": "Learn Docker Compose"})
        assert updated.status_code == 200
        assert updated.json()["title"] == "Learn Docker Compose"

        completed = client.patch(f"/tasks/{task_id}/complete")
        assert completed.status_code == 200
        assert completed.json()["completed"] is True

        deleted = client.delete(f"/tasks/{task_id}")
        assert deleted.status_code == 204
        assert client.get(f"/tasks/{task_id}").status_code == 404
