import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { toast } from 'sonner';

export const useCalendarEvents = (userId?: string) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: true });

      if (error) throw error;

      setEvents((data || []).map(event => ({
        id: event.id,
        userId: event.user_id,
        companyId: event.company_id || undefined,
        title: event.title,
        description: event.description || undefined,
        startTime: event.start_time,
        endTime: event.end_time || undefined,
        eventDate: event.event_date,
        color: event.color || 'blue',
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      })));
    } catch (error: any) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [userId]);

  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: userId,
          company_id: event.companyId || null,
          title: event.title,
          description: event.description || null,
          start_time: event.startTime,
          end_time: event.endTime || null,
          event_date: event.eventDate,
          color: event.color || 'blue',
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent: CalendarEvent = {
        id: data.id,
        userId: data.user_id,
        companyId: data.company_id || undefined,
        title: data.title,
        description: data.description || undefined,
        startTime: data.start_time,
        endTime: data.end_time || undefined,
        eventDate: data.event_date,
        color: data.color || 'blue',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setEvents(prev => [...prev, newEvent]);
      toast.success('Event added');
      return newEvent;
    } catch (error: any) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.companyId !== undefined) dbUpdates.company_id = updates.companyId;

      const { error } = await supabase
        .from('calendar_events')
        .update(dbUpdates)
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.map(e => 
        e.id === eventId ? { ...e, ...updates } : e
      ));
      toast.success('Event updated');
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event deleted');
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getEventsForDate = (date: string) => {
    return events.filter(e => e.eventDate === date);
  };

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    reloadEvents: loadEvents,
  };
};
