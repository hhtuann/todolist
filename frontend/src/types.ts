export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
}

export type TaskFilter = "all" | "pending" | "completed";
