import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Note } from '@/types/company';
import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface NotesGridProps {
  notes: Note[];
  onAddNote: (title: string, content: string, color: string) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

const noteColors = [
  { name: 'Yellow', value: '#fef3c7', text: '#78350f' },
  { name: 'Pink', value: '#fce7f3', text: '#831843' },
  { name: 'Blue', value: '#dbeafe', text: '#1e3a8a' },
  { name: 'Green', value: '#d1fae5', text: '#065f46' },
  { name: 'Purple', value: '#e9d5ff', text: '#581c87' },
];

export const NotesGrid = ({ notes, onAddNote, onUpdateNote, onDeleteNote }: NotesGridProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: noteColors[0].value });
  const [localNotes, setLocalNotes] = useState<Note[]>(notes);
  
  // Update local state when props change (from database)
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);
  
  // Debounce database save after 500ms of no typing
  const debouncedSave = useDebounce(
    useCallback((id: string, updates: Partial<Note>) => {
      onUpdateNote(id, updates);
    }, [onUpdateNote]),
    500
  );

  const handleNoteChange = (id: string, updates: Partial<Note>) => {
    // Update local state immediately for instant UI feedback
    setLocalNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
    // Debounce the database save
    debouncedSave(id, updates);
  };

  const handleAddNote = () => {
    if (newNote.content.trim()) {
      onAddNote(newNote.title, newNote.content, newNote.color);
      setNewNote({ title: '', content: '', color: noteColors[0].value });
      setIsAdding(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {localNotes.map((note) => (
        <Card
          key={note.id}
          className="p-4 group relative border-0 shadow-md"
          style={{
            backgroundColor: note.color,
            color: noteColors.find((c) => c.value === note.color)?.text || '#000',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={() => onDeleteNote(note.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Textarea
            value={note.content}
            onChange={(e) => handleNoteChange(note.id, { content: e.target.value })}
            className="min-h-[120px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            style={{
              color: noteColors.find((c) => c.value === note.color)?.text || '#000',
            }}
            placeholder="Type your note..."
          />
        </Card>
      ))}

      {isAdding ? (
        <Card
          className="p-4 border-0 shadow-md"
          style={{
            backgroundColor: newNote.color,
            color: noteColors.find((c) => c.value === newNote.color)?.text || '#000',
          }}
        >
          <div className="space-y-2">
            <div className="flex gap-1 mb-2">
              {noteColors.map((color) => (
                <button
                  key={color.value}
                  className="w-6 h-6 rounded-full border-2 border-border"
                  style={{ backgroundColor: color.value }}
                  onClick={() => setNewNote({ ...newNote, color: color.value })}
                />
              ))}
            </div>
            <Textarea
              placeholder="Take a note..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="min-h-[120px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              style={{
                color: noteColors.find((c) => c.value === newNote.color)?.text || '#000',
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddNote}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote({ title: '', content: '', color: noteColors[0].value });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 border-2 border-dashed border-border bg-muted/30 flex items-center justify-center min-h-[160px] cursor-pointer hover:bg-muted/50 transition-colors">
          <Button variant="ghost" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </Card>
      )}
    </div>
  );
};
