import { Company } from '@/types/company';

const STORAGE_KEY = 'companies-data';

export const loadCompanies = (): Company[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Migrate existing companies to include website field
      return parsed.map((company: Company) => ({
        ...company,
        website: company.website || '',
      }));
    }
    return getInitialCompanies();
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
    website: 'dronitor.vercel.app',
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
    website: 'axchange.vercel.app',
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
    website: 'polygoncloud.vercel.app',
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
    website: 'polygonbatteries.vercel.app',
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
    website: '',
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
    website: 'antennar.vercel.app',
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
    website: 'patentor.vercel.app',
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
    website: 'dronecart.vercel.app',
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
    website: '',
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
    website: '',
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
    website: '',
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
