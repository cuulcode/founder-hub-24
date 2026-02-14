import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company, Habit, Task, KanbanItem, Note } from '@/types/company';
import { toast } from 'sonner';

export const useCompanies = (userId: string | undefined) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadCompanies();
  }, [userId]);

  const loadCompanies = async () => {
    if (!userId) return;

    try {
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order')
        .order('created_at');

      if (companiesError) throw companiesError;

      if (!companiesData || companiesData.length === 0) {
        // Initialize with default companies for new users
        await initializeDefaultCompanies();
        await loadCompanies(); // Reload after initialization
        return;
      }

      // Fetch all related data
      const companyIds = companiesData.map(c => c.id);

      const [habitsRes, habitCompletionsRes, tasksRes, kanbanItemsRes, notesRes] = await Promise.all([
        supabase.from('habits').select('*').in('company_id', companyIds),
        supabase.from('habit_completions').select('*'),
        supabase.from('tasks').select('*').in('company_id', companyIds),
        supabase.from('kanban_items').select('*').in('company_id', companyIds),
        supabase.from('notes').select('*').in('company_id', companyIds),
      ]);

      if (habitsRes.error) throw habitsRes.error;
      if (habitCompletionsRes.error) throw habitCompletionsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (kanbanItemsRes.error) throw kanbanItemsRes.error;
      if (notesRes.error) throw notesRes.error;

      // Build completion map
      const completionsMap = new Map<string, string[]>();
      habitCompletionsRes.data?.forEach(completion => {
        const dates = completionsMap.get(completion.habit_id) || [];
        dates.push(completion.completed_date);
        completionsMap.set(completion.habit_id, dates);
      });

      // Build companies with nested data
      const formattedCompanies: Company[] = companiesData.map(company => {
        const companyHabits = habitsRes.data?.filter(h => h.company_id === company.id) || [];
        
        return {
          id: company.id,
          name: company.name,
          website: company.website || '',
          icon: company.icon || undefined,
          habits: companyHabits.map(h => ({
            id: h.id,
            name: h.name,
            color: h.color || undefined,
            completedDates: completionsMap.get(h.id) || [],
          })),
          tasks: (tasksRes.data?.filter(t => t.company_id === company.id) || []).map(t => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            priority: t.priority as 'low' | 'medium' | 'high',
            dueDate: t.due_date || undefined,
            category: t.category || undefined,
          })),
          kanbanItems: (kanbanItemsRes.data?.filter(k => k.company_id === company.id) || []).map(k => ({
            id: k.id,
            title: k.title,
            description: k.description || undefined,
            status: k.status as 'icebox' | 'in-progress' | 'done',
          })),
          notes: (notesRes.data?.filter(n => n.company_id === company.id) || []).map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            color: n.color,
            createdAt: n.created_at,
          })),
        };
      });

      setCompanies(formattedCompanies);
    } catch (error: any) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultCompanies = async () => {
    if (!userId) return;

    const defaultCompanies = [
      { name: 'Dronitor', website: 'dronitor.vercel.app' },
      { name: 'Axchange.ai', website: 'axchange.vercel.app' },
      { name: 'Polygon Cloud', website: 'polygoncloud.vercel.app' },
      { name: 'Polygon Batteries', website: 'polygonbatteries.vercel.app' },
      { name: 'Polygon Electricians', website: '' },
      { name: 'Antennar.ai', website: 'antennar.vercel.app' },
      { name: 'Patentor.ai', website: 'patentor.vercel.app' },
      { name: 'Dronecart/Datarone', website: 'dronecart.vercel.app' },
      { name: 'Dreamdate', website: '' },
      { name: 'Newolx', website: '' },
      { name: 'Halokey AI Keyboard', website: '' },
    ];

    const { data: insertedCompanies, error: companyError } = await supabase
      .from('companies')
      .insert(defaultCompanies.map(c => ({ ...c, user_id: userId })))
      .select();

    if (companyError) throw companyError;

    // Add default habits to each company
    const defaultHabits = [
      'Post on socials',
      'Send cold emails',
      'Website development',
    ];

    const habitsToInsert = insertedCompanies?.flatMap(company =>
      defaultHabits.map(name => ({
        company_id: company.id,
        name,
      }))
    );

    if (habitsToInsert) {
      const { error: habitsError } = await supabase
        .from('habits')
        .insert(habitsToInsert);

      if (habitsError) throw habitsError;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    if (!userId) return;

    try {
      // Update company basic info
      if (updates.name !== undefined || updates.website !== undefined || updates.icon !== undefined) {
        const { error } = await supabase
          .from('companies')
          .update({
            name: updates.name,
            website: updates.website,
            icon: updates.icon,
          })
          .eq('id', id);

        if (error) throw error;
      }

      // Update habits if provided
      if (updates.habits !== undefined) {
        const company = companies.find(c => c.id === id);
        if (company) {
          // Find habits to delete
          const oldHabitIds = company.habits.map(h => h.id);
          const newHabitIds = updates.habits.map(h => h.id);
          const habitsToDelete = oldHabitIds.filter(id => !newHabitIds.includes(id));

          if (habitsToDelete.length > 0) {
            await supabase.from('habits').delete().in('id', habitsToDelete);
          }

          // Update or insert habits
          for (const habit of updates.habits) {
            if (oldHabitIds.includes(habit.id)) {
              // Update existing habit
              await supabase
                .from('habits')
                .update({ name: habit.name })
                .eq('id', habit.id);

              // Sync completions
              const oldCompletions = company.habits.find(h => h.id === habit.id)?.completedDates || [];
              const toDelete = oldCompletions.filter(d => !habit.completedDates.includes(d));
              const toAdd = habit.completedDates.filter(d => !oldCompletions.includes(d));

              if (toDelete.length > 0) {
                await supabase
                  .from('habit_completions')
                  .delete()
                  .eq('habit_id', habit.id)
                  .in('completed_date', toDelete);
              }

              if (toAdd.length > 0) {
                await supabase
                  .from('habit_completions')
                  .insert(toAdd.map(date => ({ habit_id: habit.id, completed_date: date })));
              }
            } else {
              // Insert new habit
              const { data: newHabit } = await supabase
                .from('habits')
                .insert({ company_id: id, name: habit.name })
                .select()
                .single();

              if (newHabit && habit.completedDates.length > 0) {
                await supabase
                  .from('habit_completions')
                  .insert(habit.completedDates.map(date => ({
                    habit_id: newHabit.id,
                    completed_date: date,
                  })));
              }
            }
          }
        }
      }

      // Update tasks
      if (updates.tasks !== undefined) {
        const company = companies.find(c => c.id === id);
        if (company) {
          const oldTaskIds = company.tasks.map(t => t.id);
          const newTaskIds = updates.tasks.map(t => t.id);
          const tasksToDelete = oldTaskIds.filter(id => !newTaskIds.includes(id));

          if (tasksToDelete.length > 0) {
            await supabase.from('tasks').delete().in('id', tasksToDelete);
          }

          for (const task of updates.tasks) {
            if (oldTaskIds.includes(task.id)) {
              await supabase
                .from('tasks')
                .update({
                  title: task.title,
                  completed: task.completed,
                  priority: task.priority,
                  due_date: task.dueDate,
                  category: task.category,
                })
                .eq('id', task.id);
            } else {
              await supabase.from('tasks').insert({
                id: task.id,
                company_id: id,
                title: task.title,
                completed: task.completed,
                priority: task.priority,
                due_date: task.dueDate,
                category: task.category,
              });
            }
          }
        }
      }

      // Update kanban items
      if (updates.kanbanItems !== undefined) {
        const company = companies.find(c => c.id === id);
        if (company) {
          const oldItemIds = company.kanbanItems.map(k => k.id);
          const newItemIds = updates.kanbanItems.map(k => k.id);
          const itemsToDelete = oldItemIds.filter(id => !newItemIds.includes(id));

          if (itemsToDelete.length > 0) {
            await supabase.from('kanban_items').delete().in('id', itemsToDelete);
          }

          for (const item of updates.kanbanItems) {
            if (oldItemIds.includes(item.id)) {
              await supabase
                .from('kanban_items')
                .update({
                  title: item.title,
                  description: item.description,
                  status: item.status,
                })
                .eq('id', item.id);
            } else {
              await supabase.from('kanban_items').insert({
                id: item.id,
                company_id: id,
                title: item.title,
                description: item.description,
                status: item.status,
              });
            }
          }
        }
      }

      // Update notes
      if (updates.notes !== undefined) {
        const company = companies.find(c => c.id === id);
        if (company) {
          const oldNoteIds = company.notes.map(n => n.id);
          const newNoteIds = updates.notes.map(n => n.id);
          const notesToDelete = oldNoteIds.filter(id => !newNoteIds.includes(id));

          if (notesToDelete.length > 0) {
            await supabase.from('notes').delete().in('id', notesToDelete);
          }

          for (const note of updates.notes) {
            if (oldNoteIds.includes(note.id)) {
              await supabase
                .from('notes')
                .update({
                  title: note.title,
                  content: note.content,
                  color: note.color,
                })
                .eq('id', note.id);
            } else {
              await supabase.from('notes').insert({
                id: note.id,
                company_id: id,
                title: note.title,
                content: note.content,
                color: note.color,
              });
            }
          }
        }
      }

      // Update local state optimistically without full reload
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      
      // Only show success toast for non-note updates (notes auto-save silently)
      if (!updates.notes) {
        toast.success('Updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast.error('Failed to update');
    }
  };

  const reorderCompanies = async (reorderedIds: string[]) => {
    try {
      // Update sort_order for each company
      await Promise.all(
        reorderedIds.map((id, index) =>
          supabase.from('companies').update({ sort_order: index }).eq('id', id)
        )
      );
      // Optimistically reorder local state
      setCompanies(prev => {
        const map = new Map(prev.map(c => [c.id, c]));
        return reorderedIds.map(id => map.get(id)!).filter(Boolean);
      });
    } catch (error: any) {
      console.error('Error reordering companies:', error);
      toast.error('Failed to reorder');
    }
  };

  return {
    companies,
    loading,
    updateCompany,
    reloadCompanies: loadCompanies,
    reorderCompanies,
  };
};
