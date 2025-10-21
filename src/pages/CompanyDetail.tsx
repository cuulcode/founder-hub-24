import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskList } from '@/components/TaskList';
import { NotesGrid } from '@/components/NotesGrid';
import { Input } from '@/components/ui/input';
import { Company, KanbanItem, Task } from '@/types/company';
import { useState } from 'react';
import { toast } from 'sonner';

interface CompanyDetailProps {
  companies: Company[];
  onUpdateCompany: (id: string, updates: Partial<Company>) => void;
}

export const CompanyDetail = ({ companies, onUpdateCompany }: CompanyDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = companies.find((c) => c.id === id);

  const [newHabitName, setNewHabitName] = useState('');

  if (!company) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Company not found</h2>
          <Button onClick={() => navigate('/')}>Go back</Button>
        </div>
      </div>
    );
  }

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      const newHabit = {
        id: Date.now().toString(),
        name: newHabitName,
        completedDates: [],
      };
      onUpdateCompany(company.id, {
        habits: [...company.habits, newHabit],
      });
      setNewHabitName('');
      toast.success('Habit added');
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    onUpdateCompany(company.id, {
      habits: company.habits.filter((h) => h.id !== habitId),
    });
    toast.success('Habit removed');
  };

  const handleAddKanbanItem = (status: KanbanItem['status'], title: string, description: string) => {
    const newItem: KanbanItem = {
      id: Date.now().toString(),
      title,
      description,
      status,
    };
    onUpdateCompany(company.id, {
      kanbanItems: [...company.kanbanItems, newItem],
    });
    toast.success('Item added');
  };

  const handleUpdateKanbanItem = (id: string, updates: Partial<KanbanItem>) => {
    onUpdateCompany(company.id, {
      kanbanItems: company.kanbanItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const handleDeleteKanbanItem = (id: string) => {
    onUpdateCompany(company.id, {
      kanbanItems: company.kanbanItems.filter((item) => item.id !== id),
    });
    toast.success('Item deleted');
  };

  const handleAddTask = (title: string, priority: Task['priority'], dueDate?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
      dueDate,
    };
    onUpdateCompany(company.id, {
      tasks: [...company.tasks, newTask],
    });
    toast.success('Task added');
  };

  const handleToggleTask = (id: string) => {
    onUpdateCompany(company.id, {
      tasks: company.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    });
  };

  const handleDeleteTask = (id: string) => {
    onUpdateCompany(company.id, {
      tasks: company.tasks.filter((task) => task.id !== id),
    });
    toast.success('Task deleted');
  };

  const handleAddNote = (title: string, content: string, color: string) => {
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      color,
      createdAt: new Date().toISOString(),
    };
    onUpdateCompany(company.id, {
      notes: [...company.notes, newNote],
    });
    toast.success('Note added');
  };

  const handleUpdateNote = (id: string, updates: any) => {
    onUpdateCompany(company.id, {
      notes: company.notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      ),
    });
  };

  const handleDeleteNote = (id: string) => {
    onUpdateCompany(company.id, {
      notes: company.notes.filter((note) => note.id !== id),
    });
    toast.success('Note deleted');
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">{company.name}</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Daily Habits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {company.habits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span>{habit.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteHabit(habit.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Add new habit..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
              />
              <Button onClick={handleAddHabit}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard
              items={company.kanbanItems}
              onAddItem={handleAddKanbanItem}
              onUpdateItem={handleUpdateKanbanItem}
              onDeleteItem={handleDeleteKanbanItem}
            />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Task List</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={company.tasks}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <NotesGrid
              notes={company.notes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
