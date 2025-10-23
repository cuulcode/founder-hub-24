import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskList } from '@/components/TaskList';
import { NotesGrid } from '@/components/NotesGrid';
import { WeeklyHabitTracker } from '@/components/WeeklyHabitTracker';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  const [isEditWebsiteOpen, setIsEditWebsiteOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState(company?.website || '');

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

  const handleAddHabit = (habitName?: string) => {
    const nameToUse = habitName || newHabitName;
    if (nameToUse.trim()) {
      const newHabit = {
        id: Date.now().toString(),
        name: nameToUse,
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

  const handleUpdateWebsite = () => {
    onUpdateCompany(company.id, { website: websiteUrl });
    setIsEditWebsiteOpen(false);
    toast.success('Website updated');
  };

  const formatWebsiteUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold">{company.name}</h1>
            </div>
            {company.website && (
              <div className="flex items-center gap-2 ml-12 md:ml-16">
                <a
                  href={formatWebsiteUrl(company.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {company.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setWebsiteUrl(company.website || '');
                    setIsEditWebsiteOpen(true);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            {!company.website && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setWebsiteUrl('');
                  setIsEditWebsiteOpen(true);
                }}
                className="ml-12 md:ml-16 text-xs text-muted-foreground"
              >
                + Add website
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="kanban" className="text-xs md:text-sm">Kanban</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs md:text-sm">Tasks</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs md:text-sm">Notes</TabsTrigger>
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

        <Card>
          <CardHeader>
            <CardTitle>Weekly Habit Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyHabitTracker 
              companies={[company]} 
              onToggleHabit={(companyId, habitId, date) => {
                const habit = company.habits.find(h => h.id === habitId);
                if (habit) {
                  const isCompleted = habit.completedDates.includes(date);
                  onUpdateCompany(company.id, {
                    habits: company.habits.map(h => 
                      h.id === habitId 
                        ? {
                            ...h,
                            completedDates: isCompleted
                              ? h.completedDates.filter(d => d !== date)
                              : [...h.completedDates, date]
                          }
                        : h
                    )
                  });
                }
              }}
              onAddHabit={(name) => handleAddHabit(name)}
              onDeleteHabit={handleDeleteHabit}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditWebsiteOpen} onOpenChange={setIsEditWebsiteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Website URL</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., dronitor.vercel.app"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateWebsite()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditWebsiteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWebsite}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
