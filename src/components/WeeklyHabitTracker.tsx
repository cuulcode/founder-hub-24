import { Check, X, Plus, Trash2, Edit2, Palette } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Company, Habit } from '@/types/company';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface WeeklyHabitTrackerProps {
  companies: Company[];
  onToggleHabit: (companyId: string, habitId: string, date: string) => void;
  onAddHabit?: (name: string) => void;
  onDeleteHabit?: (habitId: string) => void;
  onUpdateHabit?: (habitId: string, name: string, color?: string) => void;
}

const HABIT_COLORS = [
  { bg: 'bg-red-500', text: 'text-red-500', value: 'red' },
  { bg: 'bg-orange-500', text: 'text-orange-500', value: 'orange' },
  { bg: 'bg-yellow-500', text: 'text-yellow-500', value: 'yellow' },
  { bg: 'bg-green-500', text: 'text-green-500', value: 'green' },
  { bg: 'bg-blue-500', text: 'text-blue-500', value: 'blue' },
  { bg: 'bg-purple-500', text: 'text-purple-500', value: 'purple' },
  { bg: 'bg-pink-500', text: 'text-pink-500', value: 'pink' },
  { bg: 'bg-gray-500', text: 'text-gray-500', value: 'gray' },
];

export const WeeklyHabitTracker = ({ companies, onToggleHabit, onAddHabit, onDeleteHabit, onUpdateHabit }: WeeklyHabitTrackerProps) => {
  const [newHabit, setNewHabit] = useState('');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleAddHabit = () => {
    if (newHabit.trim() && onAddHabit) {
      onAddHabit(newHabit);
      setNewHabit('');
    }
  };

  const startEditingHabit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditHabitName(habit.name);
  };

  const saveHabitEdit = (habitId: string, currentColor?: string) => {
    if (editHabitName.trim() && onUpdateHabit) {
      onUpdateHabit(habitId, editHabitName, currentColor);
    }
    setEditingHabitId(null);
    setEditHabitName('');
  };

  const cancelHabitEdit = () => {
    setEditingHabitId(null);
    setEditHabitName('');
  };

  const updateHabitColor = (habitId: string, color: string, currentName: string) => {
    if (onUpdateHabit) {
      onUpdateHabit(habitId, currentName, color);
    }
  };

  const isHabitCompleted = (habit: Habit, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDates.includes(dateStr);
  };

  const getColorClasses = (color?: string) => {
    const colorConfig = HABIT_COLORS.find(c => c.value === color);
    return colorConfig || { text: 'text-muted-foreground', bg: 'bg-muted' };
  };

  return (
    <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
      <div className="inline-block min-w-full">
        <div className="mb-4 text-sm font-medium text-muted-foreground">
          {format(weekStart, 'MMMM yyyy')}
        </div>
        
        <div className="grid grid-cols-8 gap-1 md:gap-2 mb-2">
          <div className="font-semibold text-xs md:text-sm text-muted-foreground">
            {companies.length > 1 ? 'Company' : 'Habit'}
          </div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="text-center">
              <div className="text-xs text-muted-foreground uppercase">
                {format(day, 'EEE')}
              </div>
              <div className="text-sm font-semibold">
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {companies.map((company) => (
            <div key={company.id} className="bg-card rounded-lg border border-border p-3">
              {companies.length > 1 && <div className="font-medium text-sm mb-2">{company.name}</div>}
              {company.habits.map((habit) => {
                const colorClasses = getColorClasses(habit.color);
                return (
                  <div key={habit.id} className="grid grid-cols-8 gap-1 md:gap-2 items-center py-1 group">
                    <div className="text-xs md:text-sm truncate flex items-center justify-between gap-1">
                      {editingHabitId === habit.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <Input
                            value={editHabitName}
                            onChange={(e) => setEditHabitName(e.target.value)}
                            className="h-7 text-xs"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveHabitEdit(habit.id, habit.color);
                              if (e.key === 'Escape') cancelHabitEdit();
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => saveHabitEdit(habit.id, habit.color)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={cancelHabitEdit}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className={cn("flex-1", colorClasses.text)}>{habit.name}</span>
                          <div className="flex items-center gap-0.5">
                            {onUpdateHabit && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                    title="Change color"
                                  >
                                    <Palette className="h-3 w-3" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2 z-50 bg-popover border border-border shadow-lg" align="start">
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 border-2"
                                      onClick={() => updateHabitColor(habit.id, '', habit.name)}
                                      title="Remove color"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                    {HABIT_COLORS.map((color) => (
                                      <Button
                                        key={color.value}
                                        variant="ghost"
                                        size="sm"
                                        className={cn("h-6 w-6 p-0", color.bg)}
                                        onClick={() => updateHabitColor(habit.id, color.value, habit.name)}
                                      />
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                            {onUpdateHabit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                onClick={() => startEditingHabit(habit)}
                                title="Edit habit name"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                            {onDeleteHabit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-70 hover:opacity-100 text-destructive"
                                onClick={() => onDeleteHabit(habit.id)}
                                title="Delete habit"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  {weekDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isCompleted = isHabitCompleted(habit, day);
                    const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                    
                    return (
                      <div key={day.toISOString()} className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'h-7 w-7 md:h-8 md:w-8 p-0 rounded-md',
                            isCompleted && 'bg-success/10 hover:bg-success/20',
                            !isCompleted && 'hover:bg-muted',
                            isToday && 'ring-2 ring-primary'
                          )}
                          onClick={() => onToggleHabit(company.id, habit.id, dateStr)}
                        >
                          {isCompleted ? (
                            <Check className={cn("h-4 w-4", habit.color ? colorClasses.text : "text-success")} />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                    </div>
                  );
                })}
                  </div>
                );
              })}
              {onAddHabit && (
                <div className="grid grid-cols-8 gap-2 items-center py-1 mt-2 pt-2 border-t border-border">
                  <div className="flex gap-1 col-span-1">
                    <Input
                      placeholder="New habit..."
                      value={newHabit}
                      onChange={(e) => setNewHabit(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                      className="text-sm h-8"
                    />
                  </div>
                  <div className="col-span-7 flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={handleAddHabit}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
