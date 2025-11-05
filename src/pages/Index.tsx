import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CompanySidebar } from '@/components/CompanySidebar';
import { Dashboard } from './Dashboard';
import { CompanyDetail } from './CompanyDetail';
import { UserMenu } from '@/components/UserMenu';
import { Company } from '@/types/company';
import { useCompanies } from '@/hooks/useCompanies';
import { Menu } from 'lucide-react';
import { User } from '@supabase/supabase-js';
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
  const [user, setUser] = useState<User | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { companies, loading: companiesLoading, updateCompany, reloadCompanies } = useCompanies(user?.id);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        setIsAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate('/auth');
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setSelectedCompanyId(id || null);
  }, [id]);

  const handleAddCompany = async () => {
    if (!user || !newCompanyName.trim()) return;

    try {
      // Insert company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          name: newCompanyName,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Add default habits
      const defaultHabits = [
        'Post on socials',
        'Send cold emails',
        'Website development',
      ];

      const { error: habitsError } = await supabase
        .from('habits')
        .insert(
          defaultHabits.map(name => ({
            company_id: newCompany.id,
            name,
          }))
        );

      if (habitsError) throw habitsError;

      setNewCompanyName('');
      setIsAddDialogOpen(false);
      toast.success('Company added successfully');
      
      // Reload companies
      window.location.reload();
    } catch (error: any) {
      console.error('Error adding company:', error);
      toast.error('Failed to add company');
    }
  };

  const handleToggleHabit = (companyId: string, habitId: string, date: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    const habit = company.habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(date);
    const updatedHabits = company.habits.map(h =>
      h.id === habitId
        ? {
            ...h,
            completedDates: isCompleted
              ? h.completedDates.filter(d => d !== date)
              : [...h.completedDates, date],
          }
        : h
    );

    updateCompany(companyId, { habits: updatedHabits });
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

  if (isAuthLoading || companiesLoading) {
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
                onUpdateCompany={updateCompany}
                onDataChanged={reloadCompanies}
              />
            ) : (
              <Dashboard companies={companies} onToggleHabit={handleToggleHabit} onDataChanged={reloadCompanies} />
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
                  onUpdateCompany={updateCompany}
                  onDataChanged={reloadCompanies}
                />
              ) : (
                <Dashboard companies={companies} onToggleHabit={handleToggleHabit} onDataChanged={reloadCompanies} />
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
