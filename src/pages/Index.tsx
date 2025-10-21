import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanySidebar } from '@/components/CompanySidebar';
import { Dashboard } from './Dashboard';
import { CompanyDetail } from './CompanyDetail';
import { Company } from '@/types/company';
import { loadCompanies, saveCompanies } from '@/lib/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadedCompanies = loadCompanies();
    setCompanies(loadedCompanies);
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      saveCompanies(companies);
    }
  }, [companies]);

  const handleAddCompany = () => {
    if (newCompanyName.trim()) {
      const newCompany: Company = {
        id: Date.now().toString(),
        name: newCompanyName,
        habits: [
          { id: '1', name: 'Post on socials', completedDates: [] },
          { id: '2', name: 'Send cold emails', completedDates: [] },
          { id: '3', name: 'Website development', completedDates: [] },
        ],
        tasks: [],
        kanbanItems: [],
        notes: [],
      };
      setCompanies([...companies, newCompany]);
      setNewCompanyName('');
      setIsAddDialogOpen(false);
      toast.success('Company added successfully');
    }
  };

  const handleToggleHabit = (companyId: string, habitId: string, date: string) => {
    setCompanies(
      companies.map((company) => {
        if (company.id === companyId) {
          return {
            ...company,
            habits: company.habits.map((habit) => {
              if (habit.id === habitId) {
                const isCompleted = habit.completedDates.includes(date);
                return {
                  ...habit,
                  completedDates: isCompleted
                    ? habit.completedDates.filter((d) => d !== date)
                    : [...habit.completedDates, date],
                };
              }
              return habit;
            }),
          };
        }
        return company;
      })
    );
  };

  const handleUpdateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(
      companies.map((company) =>
        company.id === id ? { ...company, ...updates } : company
      )
    );
  };

  const handleSelectCompany = (id: string | null) => {
    setSelectedCompanyId(id);
    if (id) {
      navigate(`/company/${id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <CompanySidebar
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={handleSelectCompany}
        onAddCompany={() => setIsAddDialogOpen(true)}
      />
      
      <main className="flex-1 overflow-hidden">
        {selectedCompanyId ? (
          <CompanyDetail
            companies={companies}
            onUpdateCompany={handleUpdateCompany}
          />
        ) : (
          <Dashboard companies={companies} onToggleHabit={handleToggleHabit} />
        )}
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Company name..."
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCompany()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCompany}>Add Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
