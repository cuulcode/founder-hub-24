import { Company } from '@/types/company';

const STORAGE_KEY = 'companies-data';

export const loadCompanies = (): Company[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getInitialCompanies();
  } catch (error) {
    console.error('Error loading companies:', error);
    return getInitialCompanies();
  }
};

export const saveCompanies = (companies: Company[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  } catch (error) {
    console.error('Error saving companies:', error);
  }
};

const getInitialCompanies = (): Company[] => [
  {
    id: '1',
    name: 'Dronitor',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '2',
    name: 'Axchange.ai',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '3',
    name: 'Polygon Cloud',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '4',
    name: 'Polygon Batteries',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '5',
    name: 'Polygon Electricians',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '6',
    name: 'Antennar.ai',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '7',
    name: 'Patentor.ai',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '8',
    name: 'Dronecart/Datarone',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '9',
    name: 'Dreamdate',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '10',
    name: 'Newolx',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
  {
    id: '11',
    name: 'Halokey AI Keyboard',
    habits: [
      { id: '1', name: 'Post on socials', completedDates: [] },
      { id: '2', name: 'Send cold emails', completedDates: [] },
      { id: '3', name: 'Website development', completedDates: [] },
    ],
    tasks: [],
    kanbanItems: [],
    notes: [],
  },
];
