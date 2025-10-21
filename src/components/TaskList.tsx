import { Plus, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/types/company';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (title: string, priority: Task['priority'], dueDate?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskList = ({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskListProps) => {
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask, newPriority, newDueDate || undefined);
      setNewTask('');
      setNewPriority('medium');
      setNewDueDate('');
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-muted-foreground';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          className="flex-1"
        />
        <Select value={newPriority} onValueChange={(v) => setNewPriority(v as Task['priority'])}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="w-40"
        />
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border border-border bg-card group',
              task.completed && 'opacity-60'
            )}
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleTask(task.id)}
            />
            <Flag className={cn('h-4 w-4', getPriorityColor(task.priority))} />
            <div className="flex-1">
              <div className={cn('text-sm', task.completed && 'line-through')}>
                {task.title}
              </div>
              {task.dueDate && (
                <div className="text-xs text-muted-foreground">
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100"
              onClick={() => onDeleteTask(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
