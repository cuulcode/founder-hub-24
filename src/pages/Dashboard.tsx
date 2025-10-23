import { WeeklyHabitTracker } from '@/components/WeeklyHabitTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Company } from '@/types/company';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays, differenceInDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface DashboardProps {
  companies: Company[];
  onToggleHabit: (companyId: string, habitId: string, date: string) => void;
}

export const Dashboard = ({ companies, onToggleHabit }: DashboardProps) => {
  const [chartView, setChartView] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Calculate statistics
  const totalTasks = companies.reduce((acc, company) => acc + company.tasks.length, 0);
  const completedTasks = companies.reduce(
    (acc, company) => acc + company.tasks.filter((t) => t.completed).length,
    0
  );
  const totalKanbanItems = companies.reduce((acc, company) => acc + company.kanbanItems.length, 0);

  // Calculate habit completion data
  const getDateRange = () => {
    const today = new Date();
    switch (timeRange) {
      case 'week':
        return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
      case 'month':
        return Array.from({ length: 30 }, (_, i) => subDays(today, 29 - i));
      case 'quarter':
        return Array.from({ length: 90 }, (_, i) => subDays(today, 89 - i));
    }
  };

  const dateRange = getDateRange();

  const habitCompletionData = useMemo(() => {
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const completedCount = companies.reduce((acc, company) => {
        return acc + company.habits.filter(habit => 
          habit.completedDates.includes(dateStr)
        ).length;
      }, 0);
      
      const totalHabits = companies.reduce((acc, company) => acc + company.habits.length, 0);
      
      return {
        date: format(date, timeRange === 'week' ? 'EEE' : 'MMM d'),
        completed: completedCount,
        total: totalHabits,
        percentage: totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0
      };
    });
  }, [companies, dateRange, timeRange]);

  // Calculate streaks
  const calculateStreaks = () => {
    const today = new Date();
    const streaks: { company: string; habit: string; currentStreak: number; bestStreak: number }[] = [];

    companies.forEach(company => {
      company.habits.forEach(habit => {
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        // Calculate current streak (going backwards from today)
        for (let i = 0; i < 365; i++) {
          const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
          if (habit.completedDates.includes(checkDate)) {
            if (i === 0 || currentStreak > 0) {
              currentStreak++;
            }
          } else if (i > 0) {
            break;
          }
        }

        // Calculate best streak
        const sortedDates = [...habit.completedDates].sort();
        for (let i = 0; i < sortedDates.length; i++) {
          if (i === 0 || differenceInDays(new Date(sortedDates[i]), new Date(sortedDates[i - 1])) === 1) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
        }

        streaks.push({
          company: company.name,
          habit: habit.name,
          currentStreak,
          bestStreak
        });
      });
    });

    return streaks.sort((a, b) => b.currentStreak - a.currentStreak);
  };

  const streaks = calculateStreaks();
  const topStreaks = streaks.slice(0, 5);

  // Calendar view for current month
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getCalendarDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const totalHabits = companies.reduce((acc, company) => acc + company.habits.length, 0);
    const completedCount = companies.reduce((acc, company) => {
      return acc + company.habits.filter(habit => 
        habit.completedDates.includes(dateStr)
      ).length;
    }, 0);

    if (totalHabits === 0) return 0;
    return (completedCount / totalHabits) * 100;
  };

  // Goals that need attention
  const needsAttention = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    const missed: { company: string; habit: string; lastCompleted: string }[] = [];

    companies.forEach(company => {
      company.habits.forEach(habit => {
        const completedToday = habit.completedDates.includes(today);
        const completedYesterday = habit.completedDates.includes(yesterday);
        
        if (!completedToday && !completedYesterday) {
          const lastDate = habit.completedDates.length > 0 
            ? habit.completedDates[habit.completedDates.length - 1]
            : 'Never';
          
          missed.push({
            company: company.name,
            habit: habit.name,
            lastCompleted: lastDate
          });
        }
      });
    });

    return missed;
  }, [companies]);

  return (
    <div className="h-full overflow-auto">
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Analytics and insights across all your companies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{companies.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasks Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {completedTasks}/{totalTasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalKanbanItems}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <CardTitle className="text-base md:text-lg">Habit Completion Trends</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                  <SelectTrigger className="w-28 md:w-32 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={chartView} onValueChange={(v: any) => setChartView(v)}>
                  <SelectTrigger className="w-28 md:w-32 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {chartView === 'line' ? (
                <LineChart data={habitCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="completed" stroke="hsl(var(--primary))" name="Completed" />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--muted-foreground))" name="Total" />
                </LineChart>
              ) : (
                <BarChart data={habitCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="percentage" fill="hsl(var(--primary))" name="Completion %" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Streaks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topStreaks.length > 0 ? (
                  topStreaks.map((streak, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{streak.habit}</div>
                        <div className="text-xs text-muted-foreground">{streak.company}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{streak.currentStreak}</div>
                        <div className="text-xs text-muted-foreground">Best: {streak.bestStreak}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No streaks yet. Start tracking habits!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Needs Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {needsAttention.length > 0 ? (
                  needsAttention.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.habit}</div>
                        <div className="text-xs text-muted-foreground">{item.company}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last: {item.lastCompleted === 'Never' ? 'Never' : format(new Date(item.lastCompleted), 'MMM d')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    All caught up! 🎉
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Calendar - {format(currentMonth, 'MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const completion = getCalendarDayStatus(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors",
                      isToday && "ring-2 ring-primary",
                      completion === 0 && "bg-muted/20 border-border text-muted-foreground",
                      completion > 0 && completion < 50 && "bg-warning/20 border-warning/30 text-warning",
                      completion >= 50 && completion < 100 && "bg-primary/20 border-primary/30 text-primary",
                      completion === 100 && "bg-success/20 border-success/30 text-success"
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 justify-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted/20 border-2 border-border"></div>
                <span className="text-muted-foreground">0%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-warning/20 border-2 border-warning/30"></div>
                <span className="text-muted-foreground">1-49%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary/30"></div>
                <span className="text-muted-foreground">50-99%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/20 border-2 border-success/30"></div>
                <span className="text-muted-foreground">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
