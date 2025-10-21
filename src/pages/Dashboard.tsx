import { WeeklyHabitTracker } from '@/components/WeeklyHabitTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Company } from '@/types/company';

interface DashboardProps {
  companies: Company[];
  onToggleHabit: (companyId: string, habitId: string, date: string) => void;
}

export const Dashboard = ({ companies, onToggleHabit }: DashboardProps) => {
  const totalTasks = companies.reduce((acc, company) => acc + company.tasks.length, 0);
  const completedTasks = companies.reduce(
    (acc, company) => acc + company.tasks.filter((t) => t.completed).length,
    0
  );
  const totalKanbanItems = companies.reduce((acc, company) => acc + company.kanbanItems.length, 0);

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all your companies and track daily progress
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
            <CardTitle>Weekly Habit Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyHabitTracker companies={companies} onToggleHabit={onToggleHabit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
