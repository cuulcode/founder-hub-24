export interface Company {
  id: string;
  name: string;
  icon?: string;
  habits: Habit[];
  tasks: Task[];
  kanbanItems: KanbanItem[];
  notes: Note[];
}

export interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // ISO date strings
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
}

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  status: 'icebox' | 'in-progress' | 'done';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
}
