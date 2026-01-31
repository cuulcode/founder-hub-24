import { useState, useEffect } from 'react';
import { CalendarEvent, EVENT_COLORS } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CalendarEventFormProps {
  event?: CalendarEvent;
  eventDate: string;
  defaultTime?: string;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const CalendarEventForm = ({
  event,
  eventDate,
  defaultTime = '09:00',
  onSave,
  onCancel,
  onDelete,
}: CalendarEventFormProps) => {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startTime, setStartTime] = useState(event?.startTime || defaultTime);
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [color, setColor] = useState(event?.color || 'blue');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      userId: event?.userId || '',
      companyId: event?.companyId,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime,
      endTime: endTime || undefined,
      eventDate,
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Event title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="font-medium"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Start Time</label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">End Time (optional)</label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Description (optional)</label>
        <Textarea
          placeholder="Add description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Color</label>
        <div className="flex gap-2">
          {EVENT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={cn(
                "w-6 h-6 rounded-full transition-all",
                c.bg,
                color === c.value ? "ring-2 ring-offset-2 ring-primary" : "opacity-60 hover:opacity-100"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <div>
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!title.trim()}>
            {event ? 'Update' : 'Add'} Event
          </Button>
        </div>
      </div>
    </form>
  );
};
