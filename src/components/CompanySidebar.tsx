import { Plus, Check, X, Edit2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';

const COMPANY_COLORS = [
  'bg-red-500/15 border-red-500/30',
  'bg-blue-500/15 border-blue-500/30',
  'bg-green-500/15 border-green-500/30',
  'bg-purple-500/15 border-purple-500/30',
  'bg-orange-500/15 border-orange-500/30',
  'bg-pink-500/15 border-pink-500/30',
  'bg-cyan-500/15 border-cyan-500/30',
  'bg-yellow-500/15 border-yellow-500/30',
  'bg-indigo-500/15 border-indigo-500/30',
  'bg-emerald-500/15 border-emerald-500/30',
  'bg-rose-500/15 border-rose-500/30',
  'bg-amber-500/15 border-amber-500/30',
  'bg-teal-500/15 border-teal-500/30',
  'bg-violet-500/15 border-violet-500/30',
  'bg-lime-500/15 border-lime-500/30',
  'bg-fuchsia-500/15 border-fuchsia-500/30',
];

interface CompanySidebarProps {
  companies: { id: string; name: string }[];
  selectedCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
  onAddCompany: () => void;
  onUpdateCompanyName: (id: string, name: string) => void;
  onReorderCompanies?: (reorderedIds: string[]) => void;
}

export const CompanySidebar = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onAddCompany,
  onUpdateCompanyName,
  onReorderCompanies,
}: CompanySidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);

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
          
          {companies.map((company, index) => {
            const colorClass = COMPANY_COLORS[index % COMPANY_COLORS.length];
            return (
            <div
              key={company.id}
              className={cn(
                "relative group rounded-md border border-transparent transition-all duration-150",
                colorClass,
                dragOverId === company.id && "border-t-2 border-primary scale-[1.02]",
                dragItemId.current === company.id && "opacity-50"
              )}
              draggable={editingId !== company.id}
              onDragStart={() => { dragItemId.current = company.id; }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverId(company.id);
              }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverId(null);
                if (dragItemId.current && dragItemId.current !== company.id && onReorderCompanies) {
                  const oldIndex = companies.findIndex(c => c.id === dragItemId.current);
                  const newIndex = companies.findIndex(c => c.id === company.id);
                  const reordered = [...companies];
                  const [moved] = reordered.splice(oldIndex, 1);
                  reordered.splice(newIndex, 0, moved);
                  onReorderCompanies(reordered.map(c => c.id));
                }
                dragItemId.current = null;
              }}
              onDragEnd={() => { dragItemId.current = null; setDragOverId(null); }}
            >
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
                  <div className="flex items-center">
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-60 cursor-grab shrink-0 ml-1" />
                    <Button
                      variant={selectedCompanyId === company.id ? 'default' : 'ghost'}
                      className={cn(
                        'flex-1 justify-start text-base md:text-sm h-12 md:h-10 pr-12',
                        selectedCompanyId === company.id && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => onSelectCompany(company.id)}
                    >
                      {company.name}
                    </Button>
                  </div>
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
          );
          })}
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
