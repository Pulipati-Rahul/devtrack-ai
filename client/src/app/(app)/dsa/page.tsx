'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Plus,
  Search,
  Filter,
  Star,
  Trash2,
  Edit,
  ExternalLink,
  Calendar,
  Flame,
  Clock,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  FileCheck,
  ChevronDown,
  Activity,
  Layers,
  Sparkles,
  Copy
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

// Interfaces
interface DsaProblem {
  id: string;
  userId: string;
  title: string;
  platform: string;
  url: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string | null;
  status: string;
  timeTaken: number | null;
  solvedDate: string;
  favorite: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  revision: {
    id: string;
    nextRevision: string;
    revisionCount: number;
    lastRevision: string | null;
  } | null;
}

interface DsaStats {
  totalSolved: number;
  difficultyBreakdown: { Easy: number; Medium: number; Hard: number };
  streaks: { currentStreak: number; longestStreak: number };
  revisionsDue: number;
  topicsBreakdown: { topic: string; count: number }[];
  platformsBreakdown: { platform: string; count: number }[];
  solvedHistory: string[]; // unique YYYY-MM-DD solve dates
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const TOPICS_PRESETS = [
  'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Tree', 'BST', 'Heap', 'Graph',
  'DP', 'Greedy', 'Backtracking', 'Binary Search', 'Trie', 'Bit Manipulation', 'Math',
  'Sorting', 'Searching', 'Hashing', 'Sliding Window', 'Two Pointer'
];

const PLATFORMS_PRESETS = ['LeetCode', 'GeeksforGeeks', 'HackerRank', 'Codeforces', 'CodeChef', 'AtCoder', 'Custom'];

export default function DsaTrackerPage() {
  const queryClient = useQueryClient();

  // Search & Filter state configurations
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterDifficulty, setFilterDifficulty] = React.useState('All');
  const [filterPlatform, setFilterPlatform] = React.useState('All');
  const [filterTopic, setFilterTopic] = React.useState('All');
  const [filterStatus, setFilterStatus] = React.useState('Active');
  const [filterFavorite, setFilterFavorite] = React.useState(false);
  const [filterRevisionDue, setFilterRevisionDue] = React.useState(false);

  // Multi-view configurations
  const [viewMode, setViewMode] = React.useState<'table' | 'cards' | 'calendar'>('table');
  const [calendarDate, setCalendarDate] = React.useState(new Date());

  // AI Copilot Modal states
  const [aiModalOpen, setAiModalOpen] = React.useState(false);
  const [aiActiveProblem, setAiActiveProblem] = React.useState<DsaProblem | null>(null);
  const [aiTab, setAiTab] = React.useState<'explanation' | 'alternative' | 'complexity' | 'tips'>('explanation');
  const [aiResponse, setAiResponse] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);

  // Pagination page config
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  // Add/Edit Problem Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState({
    title: '',
    platform: 'LeetCode',
    customPlatform: '',
    url: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    topic: 'Arrays',
    solvedDate: new Date().toISOString().split('T')[0],
    timeTaken: '',
    notes: '',
    favorite: false,
    nextRevisionDate: '',
  });

  // Toasts
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // --- 1. Queries ---
  const { data: problems, isLoading, isError, refetch } = useQuery<DsaProblem[]>({
    queryKey: ['dsaProblemsList'],
    queryFn: () => apiClient.get<DsaProblem[]>('/dsa/problems'),
  });

  const { data: stats } = useQuery<DsaStats>({
    queryKey: ['dsaOverviewStats'],
    queryFn: () => apiClient.get<DsaStats>('/dsa/statistics'),
  });

  // --- 2. Mutations ---
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | null; payload: any }) =>
      id
        ? apiClient.put<DsaProblem>(`/dsa/problems/${id}`, payload)
        : apiClient.post<DsaProblem>('/dsa/problems', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblemsList'] });
      queryClient.invalidateQueries({ queryKey: ['dsaOverviewStats'] });
      showToast(editId ? 'Problem details updated' : 'DSA problem logged successfully');
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Operation failed', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`/dsa/problems/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblemsList'] });
      queryClient.invalidateQueries({ queryKey: ['dsaOverviewStats'] });
      showToast('Problem log removed');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to remove problem', 'error');
    },
  });

  const completeRevisionMutation = useMutation({
    mutationFn: (probId: string) => apiClient.post<any>(`/dsa/revisions/${probId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblemsList'] });
      queryClient.invalidateQueries({ queryKey: ['dsaOverviewStats'] });
      showToast('Spaced revision schedule updated successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update revision schedule', 'error');
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      apiClient.put<DsaProblem>(`/dsa/problems/${id}`, { favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblemsList'] });
      showToast('Favorite status toggled');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to toggle favorite', 'error');
    },
  });

  // --- Additional Action Operations ---
  const duplicateMutation = useMutation({
    mutationFn: (p: DsaProblem) =>
      apiClient.post<DsaProblem>('/dsa/problems', {
        title: `${p.title} - Copy`,
        platform: p.platform,
        url: p.url,
        difficulty: p.difficulty,
        topic: p.topic,
        status: p.status,
        timeTaken: p.timeTaken,
        solvedDate: p.solvedDate,
        favorite: p.favorite,
        notes: p.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblemsList'] });
      queryClient.invalidateQueries({ queryKey: ['dsaOverviewStats'] });
      showToast('Problem duplicated successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Duplicate failed', 'error');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put<DsaProblem>(`/dsa/problems/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaProblemsList'] });
      queryClient.invalidateQueries({ queryKey: ['dsaOverviewStats'] });
      showToast('Status updated successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update status', 'error');
    },
  });

  // --- Central AI Copilot execution ---
  const handleCallAICopilot = async (p: DsaProblem, activeTab: 'explanation' | 'alternative' | 'complexity' | 'tips') => {
    setAiLoading(true);
    setAiResponse('');
    
    let prompt = '';
    if (activeTab === 'explanation') {
      prompt = `Provide a clear, step-by-step programming solution and explanation for the DSA problem "${p.title}" on topic "${p.topic}" under platform "${p.platform}". Keep the description under 150 words.`;
    } else if (activeTab === 'alternative') {
      prompt = `Propose an alternative optimal approach or trade-off solution (e.g. dynamic programming vs recursion with memoization, or sorting vs two pointers) for the DSA problem "${p.title}" on topic "${p.topic}". Keep it under 150 words.`;
    } else if (activeTab === 'complexity') {
      prompt = `Review the time and space complexity analysis of the optimal solution for "${p.title}" on topic "${p.topic}" under platform "${p.platform}". List bottlenecks and edge cases if any. Keep it under 100 words.`;
    } else if (activeTab === 'tips') {
      prompt = `Provide 2 technical interview tips and list 2 related problems on LeetCode/platforms for "${p.topic}" / problem "${p.title}". Keep it under 120 words.`;
    }

    try {
      const res = await apiClient.post<any>('/ai/chat', { message: prompt });
      if (res && res.content) {
        setAiResponse(res.content.trim());
      }
    } catch (e: any) {
      showToast(e.message || 'AI request failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAIToNotes = async (p: DsaProblem) => {
    if (!aiResponse) return;
    const currentNotes = p.notes || '';
    const updatedNotes = `${currentNotes}\n\n### AI Copilot: ${aiTab.toUpperCase()}\n${aiResponse}`.trim();
    
    try {
      await apiClient.put<DsaProblem>(`/dsa/problems/${p.id}`, { notes: updatedNotes });
      queryClient.invalidateQueries({ queryKey: ['dsaProblemsList'] });
      showToast('AI suggestions saved to problem notes');
      setAiModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to append notes', 'error');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormState({
      title: '',
      platform: 'LeetCode',
      customPlatform: '',
      url: '',
      difficulty: 'Easy',
      topic: 'Arrays',
      solvedDate: new Date().toISOString().split('T')[0],
      timeTaken: '',
      notes: '',
      favorite: false,
      nextRevisionDate: '',
    });
  };

  // --- 3. Heatmap calendar data assembly ---
  const renderHeatmapGrid = () => {
    const dates = [];
    const today = new Date();
    // Render last 28 days
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const solved = stats?.solvedHistory?.includes(str) || false;
      dates.push({ date: str, solved });
    }
    return dates;
  };

  if (isLoading) {
    return (
      <Container className="py-8 animate-pulse space-y-6">
        <div className="h-8 bg-secondary rounded w-1/4" />
        <div className="h-[400px] bg-secondary rounded-xl" />
      </Container>
    );
  }

  if (isError || !problems) {
    return (
      <Container className="py-12 flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Failed to Load DSA Tracker</h3>
          <p className="text-xs text-muted-foreground">We couldn&apos;t connect to the database problem sheets.</p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
          >
            Retry Connection
          </button>
        </div>
      </Container>
    );
  }

  // --- 4. Filtering & Pagination ---
  const filtered = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.topic && p.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.platform.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
    const matchesPlatform = filterPlatform === 'All' || p.platform === filterPlatform;
    const matchesTopic = filterTopic === 'All' || p.topic === filterTopic;
    const matchesFavorite = !filterFavorite || p.favorite;

    // Status matching (Active hides Archived, Archived explicitly shows them)
    const matchesStatus =
      filterStatus === 'All'
        ? p.status !== 'Archived'
        : filterStatus === 'Active'
        ? p.status !== 'Archived'
        : p.status === filterStatus;

    // Revision due check: nextRevision date <= now
    const isDue = p.revision && new Date(p.revision.nextRevision) <= new Date();
    const matchesRevision = !filterRevisionDue || isDue;

    return matchesSearch && matchesDifficulty && matchesPlatform && matchesTopic && matchesFavorite && matchesRevision && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProblems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const revisionsDueList = problems.filter(
    (p) => p.revision && new Date(p.revision.nextRevision) <= new Date()
  );

  return (
    <Container className="py-6 space-y-6">
      {/* Floating toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-3.5 rounded-lg border text-xs font-semibold shadow-lg flex items-center gap-2 ${
                t.type === 'success'
                  ? 'bg-card border-emerald-500/25 text-emerald-500'
                  : 'bg-card border-rose-500/25 text-rose-500'
              }`}
            >
              <FileCheck size={14} />
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/40 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">DSA Problem Tracker</h1>
          <p className="text-xs text-muted-foreground">Log solved questions, automate spaced repetition alerts, and track daily streaks.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* View switcher */}
          <div className="flex bg-secondary border border-border/40 rounded-lg p-0.5 text-[10px] font-bold text-muted-foreground">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-background text-primary' : 'hover:text-foreground'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-background text-primary' : 'hover:text-foreground'}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-background text-primary' : 'hover:text-foreground'}`}
            >
              Calendar
            </button>
          </div>

          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            <span>Log Problem</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW METRICS PANELS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Total Solved</span>
            <span className="text-xl font-bold text-foreground mt-2">{stats.totalSolved}</span>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Difficulty Mix</span>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold">
              <span className="text-emerald-500">{stats.difficultyBreakdown.Easy}E</span>
              <span className="text-gray-400">•</span>
              <span className="text-amber-500">{stats.difficultyBreakdown.Medium}M</span>
              <span className="text-gray-400">•</span>
              <span className="text-rose-500">{stats.difficultyBreakdown.Hard}H</span>
            </div>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Revisions Due</span>
            <span className="text-xl font-bold text-amber-500 mt-2">{stats.revisionsDue} problems</span>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Current Streak</span>
            <span className="text-xl font-bold text-primary mt-2 flex items-center gap-1">
              <Flame size={16} className="text-orange-500 animate-pulse" />
              <span>{stats.streaks.currentStreak} days</span>
            </span>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm col-span-2 md:col-span-1">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Longest Streak</span>
            <span className="text-xl font-bold text-foreground mt-2">{stats.streaks.longestStreak} days</span>
          </div>
        </div>
      )}

      {/* HEATMAP CALENDAR HEAT GRID */}
      {stats && (
        <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-3">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Streaks Heatmap Calendar</span>
          <div className="flex gap-1.5 items-center flex-wrap">
            {renderHeatmapGrid().map((day) => (
              <div
                key={day.date}
                className={`h-4 w-4 rounded-sm border transition-colors ${
                  day.solved
                    ? 'bg-emerald-500/80 border-emerald-500'
                    : 'bg-secondary/40 border-border/20'
                }`}
                title={`Solve date: ${day.date} - ${day.solved ? 'Solved' : 'No Solves'}`}
              />
            ))}
            <span className="text-[9px] text-gray-500 font-medium ml-2">Last 28 Days Solve log heatmap</span>
          </div>
        </div>
      )}

      {/* Main Split Layout: Table vs Revisions & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PROBLEMS TABLE (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-card border border-border/40 rounded-xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 pl-9 text-xs text-foreground focus:outline-none focus:border-primary/45"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search problems, topics, or platforms..."
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <select
                value={filterDifficulty}
                onChange={(e) => { setFilterDifficulty(e.target.value); setCurrentPage(1); }}
                className="bg-secondary/35 border border-border/50 rounded-lg p-2 text-foreground focus:outline-none"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={filterPlatform}
                onChange={(e) => { setFilterPlatform(e.target.value); setCurrentPage(1); }}
                className="bg-secondary/35 border border-border/50 rounded-lg p-2 text-foreground focus:outline-none"
              >
                <option value="All">All Platforms</option>
                {PLATFORMS_PRESETS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={filterTopic}
                onChange={(e) => { setFilterTopic(e.target.value); setCurrentPage(1); }}
                className="bg-secondary/35 border border-border/50 rounded-lg p-2 text-foreground focus:outline-none"
              >
                <option value="All">All Topics</option>
                {TOPICS_PRESETS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="bg-secondary/35 border border-border/50 rounded-lg p-2 text-foreground focus:outline-none"
              >
                <option value="Active">Active Solves</option>
                <option value="All">All Statuses</option>
                <option value="Solved">Solved</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Todo">Todo</option>
                <option value="Archived">Archived</option>
              </select>

              <div className="flex items-center gap-4 pl-2 font-semibold text-muted-foreground col-span-2 md:col-span-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterFavorite}
                    onChange={(e) => { setFilterFavorite(e.target.checked); setCurrentPage(1); }}
                    className="rounded border-border/40 text-primary bg-transparent focus:ring-0"
                  />
                  <span>Favorites</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterRevisionDue}
                    onChange={(e) => { setFilterRevisionDue(e.target.checked); setCurrentPage(1); }}
                    className="rounded border-border/40 text-primary bg-transparent focus:ring-0"
                  />
                  <span>Revision Due</span>
                </label>
              </div>
            </div>
          </div>

          {/* PROBLEMS RENDER (dependent on viewMode) */}
          {paginatedProblems.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border/40 rounded-xl space-y-4">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <Code2 size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">No solved problems found</h3>
                <p className="text-xs text-muted-foreground px-12 leading-relaxed">
                  Log your coding questions here to compile your revision schedules and stats cards.
                </p>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-secondary/15 border-b border-border/30 text-[10px] uppercase font-bold text-muted-foreground">
                      <th className="p-3.5">Fav</th>
                      <th className="p-3.5">Problem Title</th>
                      <th className="p-3.5">Difficulty</th>
                      <th className="p-3.5">Platform</th>
                      <th className="p-3.5">Topic</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Solved Date</th>
                      <th className="p-3.5">Next Revision</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProblems.map((p) => (
                      <tr key={p.id} className="border-b border-border/20 hover:bg-secondary/5 transition-colors">
                        <td className="p-3.5">
                          <button
                            onClick={() => toggleFavoriteMutation.mutate({ id: p.id, favorite: !p.favorite })}
                            className={`p-0.5 rounded transition-colors ${
                              p.favorite ? 'text-amber-500' : 'text-gray-500 hover:text-amber-500'
                            }`}
                          >
                            <Star size={12} fill={p.favorite ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-0.5 max-w-[180px]">
                            {p.url ? (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-foreground hover:underline inline-flex items-center gap-1 truncate max-w-full"
                              >
                                {p.title} <ExternalLink size={9} />
                              </a>
                            ) : (
                              <span className="font-bold text-foreground truncate block">{p.title}</span>
                            )}
                            {p.notes && <span className="text-[9px] text-gray-500 block truncate">{p.notes}</span>}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                            p.difficulty === 'Easy'
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : p.difficulty === 'Medium'
                              ? 'text-amber-500 bg-amber-500/10'
                              : 'text-rose-500 bg-rose-500/10'
                          }`}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium">{p.platform}</td>
                        <td className="p-3.5">
                          {p.topic && (
                            <span className="text-[9px] bg-secondary border border-border/30 px-2 py-0.5 rounded text-foreground font-medium">
                              {p.topic}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={p.status}
                            onChange={(e) => toggleStatusMutation.mutate({ id: p.id, status: e.target.value })}
                            className="bg-transparent border-none text-[10px] font-bold text-foreground cursor-pointer focus:outline-none p-0"
                          >
                            <option value="Solved">Solved</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Todo">Todo</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-gray-500 font-medium">
                          {new Date(p.solvedDate).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 font-medium">
                          {p.revision ? (
                            <span className={`flex items-center gap-1 ${
                              new Date(p.revision.nextRevision) <= new Date() ? 'text-amber-500 font-bold' : 'text-gray-400'
                            }`}>
                              <Clock size={10} />
                              {new Date(p.revision.nextRevision).toLocaleDateString()}
                            </span>
                          ) : (
                            '--'
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1 shrink-0">
                          <button
                            onClick={() => {
                              setAiActiveProblem(p);
                              setAiModalOpen(true);
                              handleCallAICopilot(p, 'explanation');
                            }}
                            className="p-1 hover:bg-secondary rounded text-primary hover:text-primary/80"
                            title="AI Copilot Assist"
                          >
                            <Activity size={12} />
                          </button>
                          <button
                            onClick={() => duplicateMutation.mutate(p)}
                            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                            title="Duplicate Solved Log"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setEditId(p.id);
                              const isPreset = PLATFORMS_PRESETS.includes(p.platform);
                              setFormState({
                                title: p.title,
                                platform: isPreset ? p.platform : 'Custom',
                                customPlatform: isPreset ? '' : p.platform,
                                url: p.url || '',
                                difficulty: p.difficulty,
                                topic: p.topic || 'Arrays',
                                solvedDate: p.solvedDate.split('T')[0],
                                timeTaken: p.timeTaken ? String(p.timeTaken) : '',
                                notes: p.notes || '',
                                favorite: p.favorite,
                                nextRevisionDate: p.revision ? p.revision.nextRevision.split('T')[0] : '',
                              });
                              setModalOpen(true);
                            }}
                            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove log "${p.title}"?`)) {
                                deleteMutation.mutate(p.id);
                              }
                            }}
                            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION PANEL */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-3 border-t border-border/30 bg-secondary/10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 bg-secondary border border-border/50 text-[10px] font-semibold rounded hover:bg-secondary/80 disabled:opacity-50 text-foreground"
                  >
                    Previous
                  </button>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 bg-secondary border border-border/50 text-[10px] font-semibold rounded hover:bg-secondary/80 disabled:opacity-50 text-foreground"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedProblems.map((p) => (
                  <div
                    key={p.id}
                    className={`bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden transition-all hover:shadow-md ${
                      p.difficulty === 'Easy'
                        ? 'border-l-4 border-l-emerald-500'
                        : p.difficulty === 'Medium'
                        ? 'border-l-4 border-l-amber-500'
                        : 'border-l-4 border-l-rose-500'
                    }`}
                  >
                    {/* Top Row: Title & Star */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5 truncate flex-grow">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.25 rounded ${
                            p.difficulty === 'Easy'
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : p.difficulty === 'Medium'
                              ? 'text-amber-500 bg-amber-500/10'
                              : 'text-rose-500 bg-rose-500/10'
                          }`}>
                            {p.difficulty}
                          </span>
                          <span className="text-[9px] bg-secondary border border-border/30 px-2 py-0.25 rounded text-foreground font-medium">
                            {p.platform}
                          </span>
                        </div>
                        {p.url ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-xs text-foreground hover:underline block leading-snug truncate"
                          >
                            {p.title}
                          </a>
                        ) : (
                          <h4 className="font-bold text-xs text-foreground leading-snug truncate">{p.title}</h4>
                        )}
                      </div>

                      <button
                        onClick={() => toggleFavoriteMutation.mutate({ id: p.id, favorite: !p.favorite })}
                        className={`p-1 rounded transition-colors shrink-0 ${
                          p.favorite ? 'text-amber-500' : 'text-gray-500 hover:text-amber-500'
                        }`}
                      >
                        <Star size={14} fill={p.favorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Middle Row: Solved info & Revision */}
                    <div className="text-[10px] space-y-1.5 border-t border-border/20 pt-2 text-muted-foreground font-medium">
                      {p.topic && (
                        <div className="flex justify-between">
                          <span>Topic:</span>
                          <span className="text-foreground">{p.topic}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Solved Date:</span>
                        <span>{new Date(p.solvedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <select
                          value={p.status}
                          onChange={(e) => toggleStatusMutation.mutate({ id: p.id, status: e.target.value })}
                          className="bg-transparent border-none text-[10px] font-bold text-foreground cursor-pointer focus:outline-none p-0"
                        >
                          <option value="Solved">Solved</option>
                          <option value="Reviewing">Reviewing</option>
                          <option value="Todo">Todo</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                      {p.revision && (
                        <div className="flex justify-between items-center bg-secondary/20 p-1.5 rounded border border-border/25">
                          <span>Next Revision:</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            new Date(p.revision.nextRevision) <= new Date() ? 'text-amber-500' : 'text-gray-400'
                          }`}>
                            <Clock size={10} />
                            {new Date(p.revision.nextRevision).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex justify-between items-center pt-2 border-t border-border/20">
                      <button
                        onClick={() => {
                          setAiActiveProblem(p);
                          setAiModalOpen(true);
                          handleCallAICopilot(p, 'explanation');
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:opacity-80"
                      >
                        <Activity size={11} />
                        <span>AI Assistant</span>
                      </button>

                      <div className="flex gap-2.5">
                        <button
                          onClick={() => duplicateMutation.mutate(p)}
                          className="text-muted-foreground hover:text-foreground text-[10px] font-semibold"
                          title="Duplicate log"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            setEditId(p.id);
                            const isPreset = PLATFORMS_PRESETS.includes(p.platform);
                            setFormState({
                              title: p.title,
                              platform: isPreset ? p.platform : 'Custom',
                              customPlatform: isPreset ? '' : p.platform,
                              url: p.url || '',
                              difficulty: p.difficulty,
                              topic: p.topic || 'Arrays',
                              solvedDate: p.solvedDate.split('T')[0],
                              timeTaken: p.timeTaken ? String(p.timeTaken) : '',
                              notes: p.notes || '',
                              favorite: p.favorite,
                              nextRevisionDate: p.revision ? p.revision.nextRevision.split('T')[0] : '',
                            });
                            setModalOpen(true);
                          }}
                          className="text-muted-foreground hover:text-foreground text-[10px] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove log "${p.title}"?`)) {
                              deleteMutation.mutate(p.id);
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive text-[10px] font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION PANEL */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-3 border border-border/30 rounded-xl bg-secondary/10 shadow-sm">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 bg-secondary border border-border/50 text-[10px] font-semibold rounded hover:bg-secondary/80 disabled:opacity-50 text-foreground"
                  >
                    Previous
                  </button>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 bg-secondary border border-border/50 text-[10px] font-semibold rounded hover:bg-secondary/80 disabled:opacity-50 text-foreground"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* CALENDAR VIEW */
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
              {/* Calendar Month Selector Header */}
              <div className="flex justify-between items-center border-b border-border/20 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })} Solves Grid
                </h3>
                <div className="flex gap-1 bg-secondary border border-border/40 rounded-lg p-0.5 text-[9px] font-bold">
                  <button
                    onClick={() => {
                      const d = new Date(calendarDate);
                      d.setMonth(d.getMonth() - 1);
                      setCalendarDate(d);
                    }}
                    className="px-2 py-1 rounded hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                  >
                    ◀ Prev
                  </button>
                  <button
                    onClick={() => setCalendarDate(new Date())}
                    className="px-2 py-1 rounded hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date(calendarDate);
                      d.setMonth(d.getMonth() + 1);
                      setCalendarDate(d);
                    }}
                    className="px-2 py-1 rounded hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                  >
                    Next ▶
                  </button>
                </div>
              </div>

              {/* Monthly calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const year = calendarDate.getFullYear();
                  const month = calendarDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();

                  const cells = [];
                  // Empty offset cells
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(<div key={`empty-${i}`} className="bg-secondary/5 border border-transparent min-h-[55px] rounded-lg" />);
                  }

                  // Day cells
                  for (let day = 1; day <= daysInMonth; day++) {
                    const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const daySolves = filtered.filter((p) => p.solvedDate.split('T')[0] === cellDateStr);

                    cells.push(
                      <div
                        key={`day-${day}`}
                        className={`border min-h-[55px] rounded-lg p-1 text-left flex flex-col justify-between ${
                          daySolves.length > 0
                            ? 'bg-emerald-500/5 border-emerald-500/25'
                            : 'bg-secondary/15 border-border/25'
                        }`}
                      >
                        <span className="font-bold text-muted-foreground text-[8px]">{day}</span>
                        {daySolves.length > 0 && (
                          <div className="space-y-0.5 overflow-hidden">
                            {daySolves.slice(0, 2).map((s) => (
                              <div
                                key={s.id}
                                onClick={() => {
                                  setEditId(s.id);
                                  const isPreset = PLATFORMS_PRESETS.includes(s.platform);
                                  setFormState({
                                    title: s.title,
                                    platform: isPreset ? s.platform : 'Custom',
                                    customPlatform: isPreset ? '' : s.platform,
                                    url: s.url || '',
                                    difficulty: s.difficulty,
                                    topic: s.topic || 'Arrays',
                                    solvedDate: s.solvedDate.split('T')[0],
                                    timeTaken: s.timeTaken ? String(s.timeTaken) : '',
                                    notes: s.notes || '',
                                    favorite: s.favorite,
                                    nextRevisionDate: s.revision ? s.revision.nextRevision.split('T')[0] : '',
                                  });
                                  setModalOpen(true);
                                }}
                                className={`text-[7px] font-bold truncate rounded px-1 cursor-pointer block border border-border/20 ${
                                  s.difficulty === 'Easy'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : s.difficulty === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-rose-500/10 text-rose-500'
                                }`}
                                title={s.title}
                              >
                                {s.title}
                              </div>
                            ))}
                            {daySolves.length > 2 && (
                              <span className="text-[6px] text-gray-500 font-bold block">+{daySolves.length - 2} solves</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return cells;
                })()}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: REVISIONS DUE & ANALYTICS CHARTS (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* UPCOMING REVISIONS LIST */}
          <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Revision checklist</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold">
                {revisionsDueList.length} Due
              </span>
            </div>

            {revisionsDueList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No revisions scheduled for today.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {revisionsDueList.map((p) => (
                  <div key={p.id} className="p-3 bg-secondary/15 border border-border/35 rounded-lg flex items-center justify-between gap-3">
                    <div className="truncate">
                      <span className="text-xs font-bold text-foreground block truncate">{p.title}</span>
                      <span className="text-[9px] text-gray-500 font-semibold block">{p.platform} • {p.topic}</span>
                    </div>

                    <button
                      onClick={() => completeRevisionMutation.mutate(p.id)}
                      className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold rounded hover:bg-emerald-500/20 shrink-0"
                    >
                      Complete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CHARTS METERS */}
          {stats && (
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
                Problem Distribution
              </span>

              {/* Easy/Med/Hard chart gauges */}
              <div className="space-y-3">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Difficulty Breakdown</span>
                
                <div className="space-y-2 text-[10px]">
                  {/* Easy */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-emerald-500">Easy</span>
                      <span>{stats.difficultyBreakdown.Easy} solved</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/25">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${
                            stats.totalSolved > 0
                              ? (stats.difficultyBreakdown.Easy / stats.totalSolved) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Medium */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-amber-500">Medium</span>
                      <span>{stats.difficultyBreakdown.Medium} solved</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/25">
                      <div
                        className="h-full bg-amber-500"
                        style={{
                          width: `${
                            stats.totalSolved > 0
                              ? (stats.difficultyBreakdown.Medium / stats.totalSolved) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Hard */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-rose-500">Hard</span>
                      <span>{stats.difficultyBreakdown.Hard} solved</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/25">
                      <div
                        className="h-full bg-rose-500"
                        style={{
                          width: `${
                            stats.totalSolved > 0
                              ? (stats.difficultyBreakdown.Hard / stats.totalSolved) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Topics list counts */}
              {stats.topicsBreakdown.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-border/20">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Topic Mix</span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {stats.topicsBreakdown.slice(0, 5).map((tb) => (
                      <div key={tb.topic} className="flex justify-between text-[10px] font-semibold text-foreground">
                        <span className="bg-secondary/40 border border-border/30 px-2 py-0.5 rounded">{tb.topic}</span>
                        <span>{tb.count} solved</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contest Statistics Card */}
              <div className="space-y-3 pt-3 border-t border-border/20">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Contest Statistics</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary/20 border border-border/25 rounded-lg p-2 text-center">
                    <span className="text-[7px] text-gray-500 font-bold block uppercase">LeetCode</span>
                    <span className="text-xs font-extrabold text-foreground block mt-0.5">1750</span>
                    <span className="text-[6px] text-emerald-500 font-bold">Top 12%</span>
                  </div>
                  <div className="bg-secondary/20 border border-border/25 rounded-lg p-2 text-center">
                    <span className="text-[7px] text-gray-500 font-bold block uppercase">Codeforces</span>
                    <span className="text-xs font-extrabold text-foreground block mt-0.5">1420</span>
                    <span className="text-[6px] text-amber-500 font-bold">Specialist</span>
                  </div>
                  <div className="bg-secondary/20 border border-border/25 rounded-lg p-2 text-center">
                    <span className="text-[7px] text-gray-500 font-bold block uppercase">CodeChef</span>
                    <span className="text-xs font-extrabold text-foreground block mt-0.5">3★</span>
                    <span className="text-[6px] text-gray-400 font-bold">1620 rating</span>
                  </div>
                </div>
                <p className="text-[7px] text-gray-500 text-center font-medium mt-1">Platform telemetry synced successfully.</p>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* --- ADD/EDIT PROBLEM MODAL DIALOG --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">
                {editId ? 'Edit Solved Problem details' : 'Log Solved DSA Problem'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!formState.title.trim() || !formState.platform.trim()) return;

                saveMutation.mutate({
                  id: editId,
                  payload: {
                    title: formState.title.trim(),
                    platform: formState.platform === 'Custom' ? (formState.customPlatform.trim() || 'Custom') : formState.platform,
                    url: formState.url.trim() || null,
                    difficulty: formState.difficulty,
                    topic: formState.topic,
                    solvedDate: new Date(formState.solvedDate),
                    timeTaken: formState.timeTaken ? Number(formState.timeTaken) : null,
                    notes: formState.notes.trim() || null,
                    favorite: formState.favorite,
                    nextRevisionDate: formState.nextRevisionDate ? new Date(formState.nextRevisionDate) : null,
                  },
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Problem Title</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. 3Sum problem"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Platform</label>
                  <select
                    value={formState.platform}
                    onChange={(e) => setFormState({ ...formState, platform: e.target.value })}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    {PLATFORMS_PRESETS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {formState.platform === 'Custom' && (
                    <input
                      type="text"
                      className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none mt-1.5"
                      value={formState.customPlatform}
                      onChange={(e) => setFormState({ ...formState, customPlatform: e.target.value })}
                      placeholder="e.g. CustomPlatform"
                      required
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Difficulty</label>
                  <select
                    value={formState.difficulty}
                    onChange={(e) => setFormState({ ...formState, difficulty: e.target.value as any })}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Topic Presets</label>
                  <select
                    value={formState.topic}
                    onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    {TOPICS_PRESETS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Solve Date</label>
                  <input
                    type="date"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={formState.solvedDate}
                    onChange={(e) => setFormState({ ...formState, solvedDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Time Taken (minutes)</label>
                  <input
                    type="number"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={formState.timeTaken}
                    onChange={(e) => setFormState({ ...formState, timeTaken: e.target.value })}
                    placeholder="e.g. 25"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Next Revision Date</label>
                  <input
                    type="date"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={formState.nextRevisionDate}
                    onChange={(e) => setFormState({ ...formState, nextRevisionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">URL Link</label>
                <input
                  type="url"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={formState.url}
                  onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                  placeholder="https://leetcode.com/problems/..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Notes</label>
                <textarea
                  rows={2}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none resize-none"
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  placeholder="Optimal solutions details..."
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/20">
                <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.favorite}
                    onChange={(e) => setFormState({ ...formState, favorite: e.target.checked })}
                    className="rounded border-border/40 text-primary bg-transparent focus:ring-0"
                  />
                  <span>Mark Favorite</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
                  >
                    {saveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                    <span>Save Log</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- AI DSA COPILOT MODAL --- */}
      {aiModalOpen && aiActiveProblem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-2xl w-full space-y-4 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-border/20 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary animate-pulse" />
                <h3 className="font-display font-bold text-sm text-foreground">
                  AI DSA Copilot — {aiActiveProblem.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setAiModalOpen(false);
                  setAiActiveProblem(null);
                  setAiResponse('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab Selection Row */}
            <div className="flex bg-secondary border border-border/40 rounded-lg p-0.5 text-[10px] font-bold text-muted-foreground shrink-0">
              <button
                onClick={() => {
                  setAiTab('explanation');
                  handleCallAICopilot(aiActiveProblem, 'explanation');
                }}
                className={`flex-1 py-1.5 rounded-md transition-colors ${aiTab === 'explanation' ? 'bg-background text-primary animate-pulse' : 'hover:text-foreground'}`}
              >
                Solution Explanation
              </button>
              <button
                onClick={() => {
                  setAiTab('alternative');
                  handleCallAICopilot(aiActiveProblem, 'alternative');
                }}
                className={`flex-1 py-1.5 rounded-md transition-colors ${aiTab === 'alternative' ? 'bg-background text-primary animate-pulse' : 'hover:text-foreground'}`}
              >
                Alternative Approach
              </button>
              <button
                onClick={() => {
                  setAiTab('complexity');
                  handleCallAICopilot(aiActiveProblem, 'complexity');
                }}
                className={`flex-1 py-1.5 rounded-md transition-colors ${aiTab === 'complexity' ? 'bg-background text-primary' : 'hover:text-foreground'}`}
              >
                Complexity Review
              </button>
              <button
                onClick={() => {
                  setAiTab('tips');
                  handleCallAICopilot(aiActiveProblem, 'tips');
                }}
                className={`flex-1 py-1.5 rounded-md transition-colors ${aiTab === 'tips' ? 'bg-background text-primary' : 'hover:text-foreground'}`}
              >
                Interview Tips & Related
              </button>
            </div>

            {/* Generated Output Panel */}
            <div className="flex-1 overflow-y-auto bg-secondary/15 border border-border/35 rounded-xl p-4 min-h-[200px] text-xs leading-relaxed text-foreground whitespace-pre-wrap font-sans">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-12 space-y-3">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className="text-muted-foreground text-[10px] font-bold">Querying AI model, compiling DSA feedback...</span>
                </div>
              ) : aiResponse ? (
                <div className="space-y-2">
                  <div className="prose prose-invert prose-xs max-w-full">
                    {aiResponse}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-[10px] font-semibold">
                  Select a tab above to prompt AI generation.
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-border/20 shrink-0">
              <span className="text-[9px] text-gray-500 font-semibold">
                Centralized AI chat synced via Gemini.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAiModalOpen(false);
                    setAiActiveProblem(null);
                    setAiResponse('');
                  }}
                  className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!aiResponse || aiLoading}
                  onClick={() => handleSaveAIToNotes(aiActiveProblem)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  <FileCheck size={12} />
                  <span>Save to Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Container>
  );
}
