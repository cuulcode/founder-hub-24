import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dictionary as DictionaryType } from '@/types/company';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DictionaryProps {
  companyId: string;
  companyName: string;
  entries: DictionaryType[];
  onAdd: (word: string, definition: string) => void;
  onUpdate: (id: string, word: string, definition: string) => void;
  onDelete: (id: string) => void;
}

export const Dictionary = ({ companyId, companyName, entries, onAdd, onUpdate, onDelete }: DictionaryProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newWord, setNewWord] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [editWord, setEditWord] = useState('');
  const [editDefinition, setEditDefinition] = useState('');

  const handleAdd = () => {
    if (newWord.trim() && newDefinition.trim()) {
      onAdd(newWord, newDefinition);
      setNewWord('');
      setNewDefinition('');
      setIsAdding(false);
    }
  };

  const startEdit = (entry: DictionaryType) => {
    setEditingId(entry.id);
    setEditWord(entry.word);
    setEditDefinition(entry.definition);
  };

  const handleUpdate = () => {
    if (editingId && editWord.trim() && editDefinition.trim()) {
      onUpdate(editingId, editWord, editDefinition);
      setEditingId(null);
      setEditWord('');
      setEditDefinition('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWord('');
    setEditDefinition('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle className="text-lg">{companyName} Dictionary</CardTitle>
          </div>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Word
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isAdding && (
            <div className="mb-4 p-4 border border-border rounded-lg bg-muted/50">
              <div className="space-y-3">
                <Input
                  placeholder="Word or term..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  autoFocus
                />
                <Textarea
                  placeholder="Definition..."
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setIsAdding(false);
                    setNewWord('');
                    setNewDefinition('');
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAdd}>
                    <Check className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {entries.length === 0 && !isAdding ? (
            <div className="text-center text-muted-foreground py-8">
              No dictionary entries yet. Add your first word!
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="p-4 border border-border rounded-lg group hover:bg-muted/50 transition-colors">
                  {editingId === entry.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editWord}
                        onChange={(e) => setEditWord(e.target.value)}
                        autoFocus
                      />
                      <Textarea
                        value={editDefinition}
                        onChange={(e) => setEditDefinition(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleUpdate}>
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base mb-2">{entry.word}</h4>
                          <p className="text-sm text-muted-foreground">{entry.definition}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => startEdit(entry)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
