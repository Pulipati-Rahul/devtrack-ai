'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme, useMounted } from '@/hooks/infrastructure';
import { useSearchStore, SearchFilter } from '@/store/use-search-store';
import { apiClient } from '@/lib/api-client';
import { signOut } from '@/lib/auth-client';
import {
  Search,
  Command,
  FileText,
  User,
  FolderKanban,
  ClipboardList,
  Code2,
  HelpCircle,
  Bot,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  Pin,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Backend response payload contracts
interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'profile' | 'resume' | 'project' | 'portfolio' | 'dsa' | 'interview' | 'ai' | 'settings';
  url: string;
}

interface CommandItem {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'action' | 'utility';
  url?: string;
  actionId?: string;
  isPinned?: boolean;
}

interface RecentSearchItem {
  id: string;
  query: string;
  createdAt: string;
}

const FILTER_OPTIONS: { value: SearchFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'profile', label: 'Profiles' },
  { value: 'resume', label: 'Resumes' },
  { value: 'project', label: 'Projects' },
  { value: 'portfolio', label: 'Portfolios' },
  { value: 'dsa', label: 'DSA' },
  { value: 'interview', label: 'Interviews' },
  { value: 'ai', label: 'AI Coach' },
  { value: 'settings', label: 'Settings' },
  { value: 'commands', label: 'Commands' },
];

export function CommandPalette() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  
  const { isOpen, query, selectedFilter, openSearch, closeSearch, setQuery, setSelectedFilter } = useSearchStore();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // --- 1. Keyboard Listeners & Shortcut Registration ---
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle using Ctrl + K, Cmd + K, or Ctrl + /
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === '/')) {
        e.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openSearch, closeSearch]);

  // Trap focus to input field when palette opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // --- 2. Queries & Mutations ---
  
  // GET Search Results
  const { data: searchResults = [], isLoading: isSearchLoading } = useQuery<SearchResultItem[]>({
    queryKey: ['searchQueryResults', query],
    queryFn: () => apiClient.get<SearchResultItem[]>(`/search?q=${encodeURIComponent(query)}`),
    enabled: isOpen && query.trim().length > 0,
    staleTime: 5000,
  });

  // GET Commands Registry
  const { data: commands = [], refetch: refetchCommands } = useQuery<CommandItem[]>({
    queryKey: ['commandPaletteList'],
    queryFn: () => apiClient.get<CommandItem[]>('/search/commands'),
    enabled: isOpen,
  });

  // GET Recent Queries History
  const { data: recentSearches = [], refetch: refetchRecent } = useQuery<RecentSearchItem[]>({
    queryKey: ['recentQueriesList'],
    queryFn: () => apiClient.get<RecentSearchItem[]>('/search/recent'),
    enabled: isOpen,
  });

  // POST Search History Event
  const logSearchMutation = useMutation({
    mutationFn: (searchTerm: string) => apiClient.post('/search', { query: searchTerm }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentQueriesList'] });
    },
  });

  // POST Toggle Command Pin
  const togglePinMutation = useMutation({
    mutationFn: (payload: { commandId: string; isPinned: boolean }) =>
      apiClient.post('/search/commands/pin', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandPaletteList'] });
    },
  });

  // --- 3. Compute Filtered Lists for Rendering ---
  const filteredSearchResults = React.useMemo(() => {
    if (selectedFilter === 'all') return searchResults;
    if (selectedFilter === 'commands') return [];
    return searchResults.filter((r) => r.type === selectedFilter);
  }, [searchResults, selectedFilter]);

  const filteredCommands = React.useMemo(() => {
    if (selectedFilter !== 'all' && selectedFilter !== 'commands') return [];
    
    const term = query.toLowerCase().trim();
    if (!term) return commands;
    
    return commands.filter(
      (c) => c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term)
    );
  }, [commands, query, selectedFilter]);

  const allRenderItems = React.useMemo(() => {
    const items: (
      | { type: 'result'; data: SearchResultItem }
      | { type: 'command'; data: CommandItem }
      | { type: 'recent'; data: RecentSearchItem }
      | { type: 'static-suggestion'; label: string; query: string }
    )[] = [];

    if (query.trim().length > 0) {
      filteredSearchResults.forEach((r) => items.push({ type: 'result', data: r }));
      filteredCommands.forEach((c) => items.push({ type: 'command', data: c }));
    } else {
      // Pinned commands prioritized
      const pinned = commands.filter((c) => c.isPinned);
      pinned.forEach((c) => items.push({ type: 'command', data: c }));

      // Recent searches
      recentSearches.forEach((r) => items.push({ type: 'recent', data: r }));

      // Static recommended actions / suggestions
      if (pinned.length === 0 && recentSearches.length === 0) {
        const suggestions = [
          { label: 'Audit resume for ATS metrics', query: 'ats' },
          { label: 'Review today\'s DSA streaks', query: 'dsa' },
          { label: 'Practice technical mock interviews', query: 'interview' },
        ];
        suggestions.forEach((s) => items.push({ type: 'static-suggestion', label: s.label, query: s.query }));
      }

      // Add remaining commands
      const unpinned = commands.filter((c) => !c.isPinned);
      unpinned.forEach((c) => items.push({ type: 'command', data: c }));
    }

    return items;
  }, [query, filteredSearchResults, filteredCommands, commands, recentSearches]);

  // Adjust selected index bounds
  React.useEffect(() => {
    if (selectedIndex >= allRenderItems.length) {
      setSelectedIndex(Math.max(0, allRenderItems.length - 1));
    }
  }, [allRenderItems, selectedIndex]);

  // --- 4. Action Handlers ---
  const handleSelect = async (index: number) => {
    const item = allRenderItems[index];
    if (!item) return;

    // Save query search history if typing
    if (query.trim().length > 0) {
      logSearchMutation.mutate(query);
    }

    closeSearch();

    if (item.type === 'result') {
      router.push(item.data.url);
    } else if (item.type === 'recent') {
      setQuery(item.data.query);
      setTimeout(() => inputRef.current?.focus(), 50);
      openSearch();
    } else if (item.type === 'static-suggestion') {
      setQuery(item.query);
      setTimeout(() => inputRef.current?.focus(), 50);
      openSearch();
    } else if (item.type === 'command') {
      const cmd = item.data;
      if (cmd.url) {
        router.push(cmd.url);
      } else if (cmd.actionId === 'logout') {
        await signOut();
        router.push('/login');
      } else if (cmd.actionId === 'toggle-theme') {
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }
    }
  };

  const handleTogglePin = (e: React.MouseEvent, cmd: CommandItem) => {
    e.stopPropagation();
    e.preventDefault();
    togglePinMutation.mutate({ commandId: cmd.id, isPinned: !cmd.isPinned });
  };

  // --- 5. Keydown Handling within Palette ---
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allRenderItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allRenderItems.length) % allRenderItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Cycle through filters
      const currentIndex = FILTER_OPTIONS.findIndex((f) => f.value === selectedFilter);
      const nextIndex = (currentIndex + (e.shiftKey ? -1 : 1) + FILTER_OPTIONS.length) % FILTER_OPTIONS.length;
      setSelectedFilter(FILTER_OPTIONS[nextIndex].value);
      setSelectedIndex(0);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop Glassmorphic Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette search"
            className="bg-card/90 border border-border/40 shadow-2xl rounded-2xl max-w-2xl w-full max-h-[75vh] overflow-hidden flex flex-col z-[101]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
              <Search className="text-muted-foreground shrink-0" size={18} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search resources, modules, templates, or execute commands..."
                className="w-full bg-transparent border-0 outline-none placeholder:text-muted-foreground/60 text-sm text-foreground focus:ring-0 focus:outline-none"
              />
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded border border-border/40 text-[10px] font-semibold text-muted-foreground shrink-0 select-none">
                <span>ESC</span>
              </div>
            </div>

            {/* Filter Tabs Bar */}
            <div className="flex gap-1.5 px-4 py-2 bg-muted/20 border-b border-border/40 overflow-x-auto text-[11px] scrollbar-none shrink-0 select-none">
              {FILTER_OPTIONS.map((opt) => {
                const isActive = selectedFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedFilter(opt.value);
                      setSelectedIndex(0);
                      inputRef.current?.focus();
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Results list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isSearchLoading && query.trim().length > 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Scanning career database records...</span>
                </div>
              ) : allRenderItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-bold">No results found</p>
                  <p className="text-[10px] text-muted-foreground/75">Verify filters and query spelling variables.</p>
                </div>
              ) : (
                allRenderItems.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  let icon = <Search size={14} className="text-muted-foreground" />;
                  let title = '';
                  let subtitle = '';
                  let rightAddon: React.ReactNode = null;

                  if (item.type === 'result') {
                    title = item.data.title;
                    subtitle = item.data.subtitle;
                    
                    const typeIcons: Record<string, React.ReactElement> = {
                      profile: <User size={14} className="text-blue-500" />,
                      resume: <FileText size={14} className="text-emerald-500" />,
                      project: <ClipboardList size={14} className="text-amber-500" />,
                      portfolio: <FolderKanban size={14} className="text-indigo-500" />,
                      dsa: <Code2 size={14} className="text-purple-500" />,
                      interview: <HelpCircle size={14} className="text-rose-500" />,
                      ai: <Bot size={14} className="text-cyan-500" />,
                      settings: <Settings size={14} className="text-muted-foreground" />,
                    };
                    icon = typeIcons[item.data.type] || icon;

                    rightAddon = (
                      <span className="text-[9px] font-bold text-muted-foreground uppercase border border-border/40 px-1.5 py-0.5 rounded bg-muted/30">
                        {item.data.type}
                      </span>
                    );
                  } else if (item.type === 'command') {
                    title = item.data.name;
                    subtitle = item.data.description;
                    
                    const cmdIcons: Record<string, React.ReactElement> = {
                      'create-resume': <FileText size={14} className="text-emerald-500" />,
                      'new-project': <ClipboardList size={14} className="text-amber-500" />,
                      'new-portfolio': <FolderKanban size={14} className="text-indigo-500" />,
                      'go-dashboard': <ChevronRight size={14} className="text-muted-foreground" />,
                      'go-profile': <User size={14} className="text-blue-500" />,
                      'go-resume': <FileText size={14} className="text-emerald-500" />,
                      'go-portfolio': <FolderKanban size={14} className="text-indigo-500" />,
                      'go-settings': <Settings size={14} className="text-muted-foreground" />,
                      'open-ai-coach': <Bot size={14} className="text-cyan-500" />,
                      'logout': <LogOut size={14} className="text-rose-500" />,
                      'toggle-theme': theme === 'dark' ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-blue-500" />,
                    };
                    icon = cmdIcons[item.data.id] || <Command size={14} className="text-primary" />;

                    rightAddon = (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleTogglePin(e, item.data)}
                          className={`p-1 rounded hover:bg-muted text-muted-foreground transition-colors ${
                            item.data.isPinned ? 'text-amber-500 hover:text-amber-600' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          title={item.data.isPinned ? 'Unpin command' : 'Pin command'}
                        >
                          <Pin size={11} className={item.data.isPinned ? 'fill-current' : ''} />
                        </button>
                        <span className="text-[9px] font-bold text-primary uppercase border border-primary/20 px-1.5 py-0.5 rounded bg-primary/5">
                          Command
                        </span>
                      </div>
                    );
                  } else if (item.type === 'recent') {
                    title = item.data.query;
                    subtitle = `Search query history (Used ${new Date(item.data.createdAt).toLocaleDateString()})`;
                    icon = <Clock size={14} className="text-muted-foreground" />;
                  } else if (item.type === 'static-suggestion') {
                    title = item.label;
                    subtitle = 'Recommended action suggestion';
                    icon = <Sparkles size={14} className="text-primary" />;
                  }

                  return (
                    <div
                      key={`${item.type}-${idx}`}
                      onClick={() => handleSelect(idx)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group relative ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/20'
                          : 'border border-transparent hover:bg-secondary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-card border border-border/30 flex items-center justify-center shrink-0">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{title}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[400px] mt-0.5">
                            {subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {rightAddon}
                        {isSelected && <ChevronRight size={12} className="text-primary shrink-0" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Bar */}
            <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground bg-muted/15 shrink-0 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="bg-muted px-1.5 py-0.5 rounded border border-border/40">↑↓</span> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <span className="bg-muted px-1.5 py-0.5 rounded border border-border/40">Enter</span> to select
                </span>
                <span className="flex items-center gap-1">
                  <span className="bg-muted px-1.5 py-0.5 rounded border border-border/40">Tab</span> to switch filters
                </span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-primary">
                <Command size={10} />
                <span>Global Command Center</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
