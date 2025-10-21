import { Check, X, Plus, Trash2 } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Company, Habit } from '@/types/company';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface WeeklyHabitTrackerProps {
  companies: Company[];
  onToggleHabit: (companyId: string, habitId: string, date: string) => void;
  onAddHabit?: (name: string) => void;
  onDeleteHabit?: (habitId: string) => void;
}

export const WeeklyHabitTracker = ({ companies, onToggleHabit, onAddHabit, onDeleteHabit }: WeeklyHabitTrackerProps) => {
  const [newHabit, setNewHabit] = useState('');
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleAddHabit = () => {
    if (newHabit.trim() && onAddHabit) {
      onAddHabit(newHabit);
      setNewHabit('');
    }
  };

  const isHabitCompleted = (habit: Habit, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDates.includes(dateStr);
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="font-semibold text-sm text-muted-foreground">
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
              {company.habits.map((habit) => (
                <div key={habit.id} className="grid grid-cols-8 gap-2 items-center py-1 group">
                  <div className="text-sm text-muted-foreground truncate flex items-center justify-between">
                    <span>{habit.name}</span>
                    {onDeleteHabit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => onDeleteHabit(habit.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
                            'h-8 w-8 p-0 rounded-md',
                            isCompleted && 'bg-success/10 hover:bg-success/20',
                            !isCompleted && 'hover:bg-muted',
                            isToday && 'ring-2 ring-primary'
                          )}
                          onClick={() => onToggleHabit(company.id, habit.id, dateStr)}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ))}
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
