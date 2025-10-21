import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CompanySidebarProps {
  companies: { id: string; name: string }[];
  selectedCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
  onAddCompany: () => void;
}

export const CompanySidebar = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onAddCompany,
}: CompanySidebarProps) => {
  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-screen">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Project Hub
        </h1>
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          <Button
            variant={selectedCompanyId === null ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start',
              selectedCompanyId === null && 'bg-primary text-primary-foreground'
            )}
            onClick={() => onSelectCompany(null)}
          >
            All Companies
          </Button>
          
          {companies.map((company) => (
            <Button
              key={company.id}
              variant={selectedCompanyId === company.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                selectedCompanyId === company.id && 'bg-primary text-primary-foreground'
              )}
              onClick={() => onSelectCompany(company.id)}
            >
              {company.name}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={onAddCompany}
          className="w-full"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>
    </div>
  );
};
