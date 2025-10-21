import { Check, X } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Company, Habit } from '@/types/company';
import { Button } from '@/components/ui/button';

interface WeeklyHabitTrackerProps {
  companies: Company[];
  onToggleHabit: (companyId: string, habitId: string, date: string) => void;
}

export const WeeklyHabitTracker = ({ companies, onToggleHabit }: WeeklyHabitTrackerProps) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const isHabitCompleted = (habit: Habit, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDates.includes(dateStr);
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="font-semibold text-sm text-muted-foreground">Company</div>
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
              <div className="font-medium text-sm mb-2">{company.name}</div>
              {company.habits.map((habit) => (
                <div key={habit.id} className="grid grid-cols-8 gap-2 items-center py-1">
                  <div className="text-sm text-muted-foreground truncate">
                    {habit.name}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
