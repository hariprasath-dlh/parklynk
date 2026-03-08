import { LocationOption } from '@/types';

export const locations: LocationOption[] = [
  {
    state: 'Maharashtra',
    districts: [
      { name: 'Mumbai', cities: ['Mumbai', 'Navi Mumbai', 'Thane'] },
      { name: 'Pune', cities: ['Pune', 'Pimpri-Chinchwad'] },
    ],
  },
  {
    state: 'Karnataka',
    districts: [
      { name: 'Bangalore Urban', cities: ['Bangalore', 'Whitefield'] },
      { name: 'Mysore', cities: ['Mysore'] },
    ],
  },
  {
    state: 'Tamil Nadu',
    districts: [
      { name: 'Chennai', cities: ['Chennai', 'Tambaram'] },
      { name: 'Coimbatore', cities: ['Coimbatore'] },
    ],
  },
  {
    state: 'Delhi',
    districts: [
      { name: 'New Delhi', cities: ['New Delhi', 'Dwarka'] },
      { name: 'South Delhi', cities: ['Saket', 'Hauz Khas'] },
    ],
  },
];
