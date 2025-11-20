import { Plus, Check, X, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CompanySidebarProps {
  companies: { id: string; name: string }[];
  selectedCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
  onAddCompany: () => void;
  onUpdateCompanyName: (id: string, name: string) => void;
  onDeleteCompany: (id: string) => void;
  onReorderCompanies: (companies: { id: string; name: string }[]) => void;
}

interface SortableCompanyItemProps {
  company: { id: string; name: string };
  isSelected: boolean;
  isEditing: boolean;
  editName: string;
  onSelect: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditNameChange: (name: string) => void;
}

const SortableCompanyItem = ({
  company,
  isSelected,
  isEditing,
  editName,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditNameChange,
}: SortableCompanyItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: company.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {isEditing ? (
        <div className="flex items-center gap-1 p-2 border rounded-md bg-background">
          <Input
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={onSaveEdit}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={onCancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <Button
            {...listeners}
            {...attributes}
            variant={isSelected ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start text-base md:text-sm h-12 md:h-10 pr-20',
              isSelected && 'bg-primary text-primary-foreground',
              'cursor-grab active:cursor-grabbing'
            )}
            onClick={onSelect}
          >
            {company.name}
          </Button>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export const CompanySidebar = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onAddCompany,
  onUpdateCompanyName,
  onDeleteCompany,
  onReorderCompanies,
}: CompanySidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = companies.findIndex((c) => c.id === active.id);
      const newIndex = companies.findIndex((c) => c.id === over.id);
      const reordered = arrayMove(companies, oldIndex, newIndex);
      onReorderCompanies(reordered);
    }
  };

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
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={companies.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {companies.map((company) => (
                <SortableCompanyItem
                  key={company.id}
                  company={company}
                  isSelected={selectedCompanyId === company.id}
                  isEditing={editingId === company.id}
                  editName={editName}
                  onSelect={() => onSelectCompany(company.id)}
                  onStartEdit={() => startEditing(company.id, company.name)}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                  onDelete={() => onDeleteCompany(company.id)}
                  onEditNameChange={setEditName}
                />
              ))}
            </SortableContext>
          </DndContext>
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
