import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CompanySidebar } from '@/components/CompanySidebar';
import { Dashboard } from './Dashboard';
import { CompanyDetail } from './CompanyDetail';
import { UserMenu } from '@/components/UserMenu';
import { Company } from '@/types/company';
import { loadCompanies, saveCompanies } from '@/lib/storage';
import { Menu } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { id } = useParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const loadedCompanies = loadCompanies();
    setCompanies(loadedCompanies);
  }, []);

  useEffect(() => {
    setSelectedCompanyId(id || null);
  }, [id]);

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
    setIsDrawerOpen(false);
    if (id) {
      navigate(`/company/${id}`);
    } else {
      navigate('/');
    }
  };

  const sidebarContent = (
    <CompanySidebar
      companies={companies}
      selectedCompanyId={selectedCompanyId}
      onSelectCompany={handleSelectCompany}
      onAddCompany={() => setIsAddDialogOpen(true)}
    />
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {isMobile ? (
        <>
          <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[85vh]">
                  {sidebarContent}
                </DrawerContent>
              </Drawer>
              <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                Project Hub
              </h1>
            </div>
            <UserMenu />
          </div>
          <main className="flex-1 overflow-hidden pt-16">
            {selectedCompanyId ? (
              <CompanyDetail
                companies={companies}
                onUpdateCompany={handleUpdateCompany}
              />
            ) : (
              <Dashboard companies={companies} onToggleHabit={handleToggleHabit} />
            )}
          </main>
        </>
      ) : (
        <>
          {sidebarContent}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-end p-4 border-b border-border">
              <UserMenu />
            </div>
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
          </div>
        </>
      )}

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
