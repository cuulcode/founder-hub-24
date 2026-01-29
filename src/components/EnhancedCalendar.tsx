import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfDay, addDays, addWeeks, subWeeks, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Company, Task, Habit } from '@/types/company';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface EnhancedCalendarProps {
  companies: Company[];
  onToggleHabit?: (companyId: string, habitId: string, date: string) => void;
}

type ViewMode = 'day' | 'week' | 'month' | 'year';

interface DayData {
  date: Date;
  tasks: (Task & { companyName: string })[];
  habits: (Habit & { companyName: string; completed: boolean })[];
  habitCompletion: number;
}

export const EnhancedCalendar = ({ companies, onToggleHabit }: EnhancedCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const getDayData = (date: Date): DayData => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const tasks: (Task & { companyName: string })[] = [];
    const habits: (Habit & { companyName: string; completed: boolean })[] = [];

    companies.forEach(company => {
      // Get tasks due on this date
      company.tasks.forEach(task => {
        if (task.dueDate && format(new Date(task.dueDate), 'yyyy-MM-dd') === dateStr) {
          tasks.push({ ...task, companyName: company.name });
        }
      });

      // Get habits and check if completed on this date
      company.habits.forEach(habit => {
        const completed = habit.completedDates.includes(dateStr);
        habits.push({ ...habit, companyName: company.name, completed });
      });
    });

    const totalHabits = habits.length;
    const completedHabits = habits.filter(h => h.completed).length;
    const habitCompletion = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    return { date, tasks, habits, habitCompletion };
  };

  const handlePrevious = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(d => addDays(d, -1));
        break;
      case 'week':
        setCurrentDate(d => addWeeks(d, -1));
        break;
      case 'month':
        setCurrentDate(d => subMonths(d, 1));
        break;
      case 'year':
        setCurrentDate(d => addMonths(d, -12));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(d => addDays(d, 1));
        break;
      case 'week':
        setCurrentDate(d => addWeeks(d, 1));
        break;
      case 'month':
        setCurrentDate(d => addMonths(d, 1));
        break;
      case 'year':
        setCurrentDate(d => addMonths(d, 12));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
    }
  };

  // Generate hours for the day view (6 AM to 10 PM)
  const dayHours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

  const renderDayView = () => {
    const dayData = getDayData(currentDate);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    return (
      <div className="space-y-4">
        {/* Habits summary at top */}
        <div className="border rounded-lg p-3 bg-muted/30">
          <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
            Today's Habits ({dayData.habits.filter(h => h.completed).length}/{dayData.habits.length})
          </h3>
          {dayData.habits.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dayData.habits.map(habit => {
                const company = companies.find(c => c.name === habit.companyName);
                return (
                  <button
                    key={habit.id}
                    onClick={() => {
                      if (onToggleHabit && company) {
                        onToggleHabit(company.id, habit.id, dateStr);
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer",
                      habit.completed 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-accent border border-border"
                    )}
                  >
                    {habit.completed && "✓ "}{habit.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No habits tracked</div>
          )}
        </div>

        {/* Hourly timeline */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {dayHours.map(hour => {
              const hourStr = hour.toString().padStart(2, '0');
              const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
              const amPm = hour >= 12 ? 'PM' : 'AM';
              const isCurrentHour = new Date().getHours() === hour && isSameDay(currentDate, new Date());
              
              // Find tasks for this hour (if they have due times, otherwise show all at 9 AM)
              const hourTasks = dayData.tasks.filter(() => hour === 9); // Show tasks at 9 AM by default
              
              return (
                <div 
                  key={hour} 
                  className={cn(
                    "flex border-b border-border last:border-b-0 min-h-[48px]",
                    isCurrentHour && "bg-primary/5"
                  )}
                >
                  <div className="w-16 md:w-20 shrink-0 p-2 text-xs text-muted-foreground text-right border-r border-border bg-muted/30">
                    <span className={cn(isCurrentHour && "text-primary font-semibold")}>
                      {displayHour} {amPm}
                    </span>
                  </div>
                  <div className="flex-1 p-1 min-h-[48px] relative">
                    {isCurrentHour && (
                      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-primary z-10">
                        <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                      </div>
                    )}
                    {hour === 9 && dayData.tasks.length > 0 && (
                      <div className="space-y-1">
                        {dayData.tasks.map(task => (
                          <div 
                            key={task.id} 
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium truncate",
                              task.priority === 'high' && "bg-destructive/20 text-destructive",
                              task.priority === 'medium' && "bg-warning/20 text-warning-foreground",
                              task.priority === 'low' && "bg-primary/10 text-primary",
                              task.completed && "line-through opacity-50"
                            )}
                          >
                            {task.title}
                            <span className="text-muted-foreground ml-1">({task.companyName})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayData = getDayData(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toString()} className="border rounded-lg overflow-hidden">
              <div className={cn(
                "p-2 text-center font-semibold border-b",
                isToday ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <div className="text-xs">{format(day, 'EEE')}</div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>
              <div className="p-2 space-y-1 min-h-[120px] cursor-pointer hover:bg-accent/50 transition-colors"
                   onClick={() => setSelectedDay(dayData)}>
                {dayData.tasks.slice(0, 2).map(task => (
                  <div key={task.id} className="text-xs p-1 rounded bg-primary/10 text-primary truncate">
                    {task.title}
                  </div>
                ))}
                {dayData.tasks.length > 2 && (
                  <div className="text-xs text-muted-foreground">+{dayData.tasks.length - 2} more</div>
                )}
                {dayData.habitCompletion > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(dayData.habitCompletion)}% habits
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="space-y-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <div key={day} className="text-center font-bold text-sm py-2 bg-muted rounded-lg">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(day => {
            const dayData = getDayData(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[100px] border-2 rounded-lg p-2 cursor-pointer transition-all hover:shadow-md",
                  !isCurrentMonth && "opacity-40",
                  isToday && "bg-primary/5 border-primary shadow-lg ring-2 ring-primary/20"
                )}
                onClick={() => setSelectedDay(dayData)}
              >
                <div className={cn(
                  "font-semibold mb-1 text-sm",
                  isToday ? "text-primary text-lg" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayData.tasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        "text-xs p-1 rounded truncate",
                        task.priority === 'high' && "bg-destructive/20 text-destructive",
                        task.priority === 'medium' && "bg-warning/20 text-warning",
                        task.priority === 'low' && "bg-primary/10 text-primary"
                      )}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayData.tasks.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayData.tasks.length - 2}</div>
                  )}
                  {dayData.habitCompletion > 0 && (
                    <div className={cn(
                      "text-xs font-medium",
                      dayData.habitCompletion === 100 ? "text-success" : "text-muted-foreground"
                    )}>
                      {Math.round(dayData.habitCompletion)}% ✓
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
          const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
          const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
          
          return (
            <Card 
              key={month.toString()} 
              className="cursor-pointer hover:shadow-md transition-shadow p-2"
              onClick={() => {
                setCurrentDate(month);
                setViewMode('month');
              }}
            >
              <div className="text-center font-semibold text-sm mb-2">{format(month, 'MMMM')}</div>
              <div className="grid grid-cols-7 gap-px text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-muted-foreground font-medium py-1">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day) => {
                  const dayData = getDayData(day);
                  const isCurrentMonth = isSameMonth(day, month);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "aspect-square flex items-center justify-center rounded text-xs",
                        !isCurrentMonth && "text-muted-foreground/40",
                        isToday && "bg-primary text-primary-foreground font-bold",
                        dayData.habitCompletion === 100 && !isToday && "bg-success/20"
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <CardTitle className="ml-2">{getViewTitle()}</CardTitle>
            </div>
            <Select value={viewMode} onValueChange={(v: ViewMode) => setViewMode(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'year' && renderYearView()}
        </CardContent>
      </Card>

      {/* Day details dialog with hourly timeline */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedDay && format(selectedDay.date, 'EEEE, MMMM d, yyyy')}</DialogTitle>
            <DialogDescription>
              {selectedDay && `${selectedDay.tasks.length} tasks, ${selectedDay.habits.filter(h => h.completed).length}/${selectedDay.habits.length} habits completed`}
            </DialogDescription>
          </DialogHeader>
          {selectedDay && (
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              {/* Habits quick toggle */}
              <div className="border rounded-lg p-3 bg-muted/30 shrink-0">
                <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Habits (click to toggle)
                </h3>
                {selectedDay.habits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedDay.habits.map(habit => {
                      const company = companies.find(c => c.name === habit.companyName);
                      const dateStr = format(selectedDay.date, 'yyyy-MM-dd');
                      return (
                        <button
                          key={habit.id}
                          onClick={() => {
                            if (onToggleHabit && company) {
                              onToggleHabit(company.id, habit.id, dateStr);
                              setSelectedDay(prev => prev ? {
                                ...prev,
                                habits: prev.habits.map(h => 
                                  h.id === habit.id ? { ...h, completed: !h.completed } : h
                                )
                              } : null);
                            }
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer",
                            habit.completed 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-background hover:bg-accent border border-border"
                          )}
                        >
                          {habit.completed && "✓ "}{habit.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No habits tracked</div>
                )}
              </div>

              {/* Hourly timeline */}
              <div className="border rounded-lg overflow-hidden flex-1 min-h-0">
                <div className="h-full overflow-y-auto">
                  {dayHours.map(hour => {
                    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    const amPm = hour >= 12 ? 'PM' : 'AM';
                    const isCurrentHour = new Date().getHours() === hour && isSameDay(selectedDay.date, new Date());
                    
                    return (
                      <div 
                        key={hour} 
                        className={cn(
                          "flex border-b border-border last:border-b-0 min-h-[44px]",
                          isCurrentHour && "bg-primary/5"
                        )}
                      >
                        <div className="w-16 shrink-0 p-2 text-xs text-muted-foreground text-right border-r border-border bg-muted/30">
                          <span className={cn(isCurrentHour && "text-primary font-semibold")}>
                            {displayHour} {amPm}
                          </span>
                        </div>
                        <div className="flex-1 p-1 min-h-[44px] relative hover:bg-accent/30 transition-colors">
                          {isCurrentHour && (
                            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-primary z-10">
                              <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                            </div>
                          )}
                          {hour === 9 && selectedDay.tasks.length > 0 && (
                            <div className="space-y-1">
                              {selectedDay.tasks.map(task => (
                                <div 
                                  key={task.id} 
                                  className={cn(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    task.priority === 'high' && "bg-destructive/20 text-destructive",
                                    task.priority === 'medium' && "bg-warning/20 text-warning-foreground",
                                    task.priority === 'low' && "bg-primary/10 text-primary",
                                    task.completed && "line-through opacity-50"
                                  )}
                                >
                                  {task.title}
                                  <span className="text-muted-foreground ml-1">({task.companyName})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
