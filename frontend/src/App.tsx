import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { todoApi } from "./api";
import type { Task, TaskFilter } from "./types";

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa xong" },
  { value: "completed", label: "Hoàn thành" },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await todoApi.list(filter));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách công việc.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await todoApi.create({
        title: title.trim(),
        description: description.trim() || null,
      });
      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo công việc.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
  }

  async function saveEdit(taskId: number) {
    if (!editTitle.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await todoApi.update(taskId, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      });
      setEditingId(null);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật công việc.");
    } finally {
      setSaving(false);
    }
  }

  async function completeTask(taskId: number) {
    setError(null);
    try {
      await todoApi.complete(taskId);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đánh dấu hoàn thành.");
    }
  }

  async function deleteTask(taskId: number) {
    setError(null);
    try {
      await todoApi.remove(taskId);
      if (editingId === taskId) setEditingId(null);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa công việc.");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <span className="eyebrow">MY DAILY BOARD</span>
          <h1>Việc nhỏ hôm nay,<br />nhẹ đầu ngày mai.</h1>
          <p>Ghi lại việc cần làm, tập trung vào phần quan trọng và đánh dấu khi hoàn thành.</p>
        </div>
        <div className="hero-stat" aria-label="Thống kê công việc">
          <strong>{tasks.length}</strong>
          <span>công việc đang hiển thị</span>
          <small>{completedCount} đã hoàn thành</small>
        </div>
      </section>

      <section className="workspace">
        <form className="composer" onSubmit={handleCreate}>
          <div className="section-heading">
            <div>
              <span className="section-kicker">THÊM MỚI</span>
              <h2>Hôm nay bạn cần làm gì?</h2>
            </div>
          </div>
          <label>
            <span>Tiêu đề</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Học Docker Compose"
              maxLength={200}
              required
            />
          </label>
          <label>
            <span>Mô tả</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Thêm ghi chú ngắn nếu cần..."
              rows={4}
            />
          </label>
          <button className="primary-button" type="submit" disabled={saving || !title.trim()}>
            {saving ? "Đang lưu..." : "+ Thêm công việc"}
          </button>
        </form>

        <section className="task-panel">
          <div className="panel-topbar">
            <div>
              <span className="section-kicker">DANH SÁCH</span>
              <h2>Công việc của bạn</h2>
            </div>
            <div className="filters" role="group" aria-label="Lọc công việc">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  className={filter === item.value ? "filter-button active" : "filter-button"}
                  type="button"
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => void loadTasks()}>Thử lại</button>
            </div>
          )}

          <div className="task-list" aria-live="polite">
            {loading ? (
              <div className="state-card">Đang tải công việc...</div>
            ) : tasks.length === 0 ? (
              <div className="state-card empty-state">
                <div className="empty-icon">✓</div>
                <strong>Danh sách đang trống</strong>
                <span>Thêm một công việc mới để bắt đầu.</span>
              </div>
            ) : (
              tasks.map((task) => (
                <article className={task.completed ? "task-card completed" : "task-card"} key={task.id}>
                  <button
                    className="check-button"
                    type="button"
                    disabled={task.completed}
                    onClick={() => void completeTask(task.id)}
                    aria-label={task.completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  <div className="task-content">
                    {editingId === task.id ? (
                      <div className="edit-form">
                        <input
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          maxLength={200}
                          aria-label="Sửa tiêu đề"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(event) => setEditDescription(event.target.value)}
                          rows={3}
                          aria-label="Sửa mô tả"
                        />
                        <div className="edit-actions">
                          <button type="button" className="text-button" onClick={() => setEditingId(null)}>Hủy</button>
                          <button type="button" className="save-button" disabled={saving || !editTitle.trim()} onClick={() => void saveEdit(task.id)}>Lưu</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="task-title-row">
                          <h3>{task.title}</h3>
                          <span className={task.completed ? "status done" : "status pending"}>
                            {task.completed ? "Hoàn thành" : "Đang làm"}
                          </span>
                        </div>
                        {task.description && <p>{task.description}</p>}
                        <span className="task-date">Tạo lúc {formatDate(task.created_at)}</span>
                      </>
                    )}
                  </div>

                  {editingId !== task.id && (
                    <div className="task-actions">
                      <button type="button" onClick={() => startEdit(task)}>Sửa</button>
                      <button type="button" className="danger" onClick={() => void deleteTask(task.id)}>Xóa</button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
