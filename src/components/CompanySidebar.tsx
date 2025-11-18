import { Plus, Check, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CompanySidebarProps {
  companies: { id: string; name: string }[];
  selectedCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
  onAddCompany: () => void;
  onUpdateCompanyName: (id: string, name: string) => void;
}

export const CompanySidebar = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onAddCompany,
  onUpdateCompanyName,
}: CompanySidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdateCompanyName(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="w-full md:w-64 border-r border-border bg-sidebar flex flex-col h-full md:h-screen">
      <div className="p-4 border-b border-sidebar-border hidden md:block">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Project Hub
        </h1>
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          <Button
            variant={selectedCompanyId === null ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start text-base md:text-sm h-12 md:h-10',
              selectedCompanyId === null && 'bg-primary text-primary-foreground'
            )}
            onClick={() => onSelectCompany(null)}
          >
            All Companies
          </Button>
          
          {companies.map((company) => (
            <div key={company.id} className="relative group">
              {editingId === company.id ? (
                <div className="flex items-center gap-1 p-2 border rounded-md bg-background">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant={selectedCompanyId === company.id ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start text-base md:text-sm h-12 md:h-10 pr-12',
                      selectedCompanyId === company.id && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => onSelectCompany(company.id)}
                  >
                    {company.name}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(company.id, company.name);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={onAddCompany}
          className="w-full h-12 md:h-10 text-base md:text-sm"
          variant="outline"
        >
          <Plus className="mr-2 h-5 w-5 md:h-4 md:w-4" />
          Add Company
        </Button>
      </div>
    </div>
  );
};
