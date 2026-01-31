export interface CalendarEvent {
  id: string;
  userId: string;
  companyId?: string;
  title: string;
  description?: string;
  startTime: string; // HH:mm format
  endTime?: string; // HH:mm format
  eventDate: string; // yyyy-MM-dd format
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const EVENT_COLORS = [
  { value: 'blue', bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-500/20' },
  { value: 'red', bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-500/20' },
  { value: 'green', bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-500/20' },
  { value: 'yellow', bg: 'bg-yellow-500', text: 'text-yellow-500', light: 'bg-yellow-500/20' },
  { value: 'purple', bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-500/20' },
  { value: 'pink', bg: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-500/20' },
  { value: 'orange', bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-500/20' },
  { value: 'gray', bg: 'bg-gray-500', text: 'text-gray-500', light: 'bg-gray-500/20' },
];
