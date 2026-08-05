import { create } from 'zustand';

export type SearchFilter = 'all' | 'profile' | 'resume' | 'project' | 'portfolio' | 'dsa' | 'interview' | 'ai' | 'settings' | 'commands';

interface SearchState {
  isOpen: boolean;
  query: string;
  selectedFilter: SearchFilter;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (q: string) => void;
  setSelectedFilter: (filter: SearchFilter) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: '',
  selectedFilter: 'all',
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, query: '' }),
  setQuery: (q) => set({ query: q }),
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
  reset: () => set({ isOpen: false, query: '', selectedFilter: 'all' }),
}));
