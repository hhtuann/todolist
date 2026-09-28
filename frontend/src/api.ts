import type { Task, TaskInput } from "./types";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = "Có lỗi xảy ra khi kết nối tới API.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Keep the fallback message when the response is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const todoApi = {
  list: (filter: "all" | "pending" | "completed") => {
    const query = filter === "all" ? "" : `?completed=${filter === "completed"}`;
    return request<Task[]>(`/tasks${query}`);
  },
  create: (input: TaskInput) =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: number, input: Partial<TaskInput>) =>
    request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  complete: (id: number) =>
    request<Task>(`/tasks/${id}/complete`, {
      method: "PATCH",
    }),
  remove: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
