import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { KanbanItem } from '@/types/company';
import { useState } from 'react';

interface KanbanBoardProps {
  items: KanbanItem[];
  onAddItem: (status: KanbanItem['status'], title: string, description: string) => void;
  onUpdateItem: (id: string, updates: Partial<KanbanItem>) => void;
  onDeleteItem: (id: string) => void;
}

export const KanbanBoard = ({ items, onAddItem, onUpdateItem, onDeleteItem }: KanbanBoardProps) => {
  const [newItems, setNewItems] = useState<Record<string, { title: string; description: string }>>({
    icebox: { title: '', description: '' },
    'in-progress': { title: '', description: '' },
    done: { title: '', description: '' },
  });

  const columns: { status: KanbanItem['status']; title: string; color: string }[] = [
    { status: 'icebox', title: 'Icebox', color: 'border-muted' },
    { status: 'in-progress', title: 'In Progress', color: 'border-warning' },
    { status: 'done', title: 'Done', color: 'border-success' },
  ];

  const handleAddItem = (status: KanbanItem['status']) => {
    const item = newItems[status];
    if (item.title.trim()) {
      onAddItem(status, item.title, item.description);
      setNewItems({
        ...newItems,
        [status]: { title: '', description: '' },
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <Card key={column.status} className={`border-t-4 ${column.color}`}>
          <CardHeader>
            <CardTitle className="text-lg">{column.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items
              .filter((item) => item.status === column.status)
              .map((item) => (
                <div
                  key={item.id}
                  className={`bg-card border-2 rounded-lg p-3 space-y-2 group ${column.color}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 md:opacity-0 md:group-hover:opacity-100"
                      onClick={() => onDeleteItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex gap-1">
                    {column.status !== 'icebox' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-6"
                        onClick={() =>
                          onUpdateItem(item.id, {
                            status: column.status === 'in-progress' ? 'icebox' : 'in-progress',
                          })
                        }
                      >
                        ← Move
                      </Button>
                    )}
                    {column.status !== 'done' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-6"
                        onClick={() =>
                          onUpdateItem(item.id, {
                            status: column.status === 'icebox' ? 'in-progress' : 'done',
                          })
                        }
                      >
                        Move →
                      </Button>
                    )}
                  </div>
                </div>
              ))}

            <div className="space-y-2 pt-2 border-t border-border">
              <Input
                placeholder="Title..."
                value={newItems[column.status].title}
                onChange={(e) =>
                  setNewItems({
                    ...newItems,
                    [column.status]: { ...newItems[column.status], title: e.target.value },
                  })
                }
                className="text-sm"
              />
              <Textarea
                placeholder="Description (optional)..."
                value={newItems[column.status].description}
                onChange={(e) =>
                  setNewItems({
                    ...newItems,
                    [column.status]: { ...newItems[column.status], description: e.target.value },
                  })
                }
                className="text-sm min-h-[60px]"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleAddItem(column.status)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
