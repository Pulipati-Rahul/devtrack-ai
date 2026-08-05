'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Folder,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  BookOpen,
  StopCircle,
  X
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';
import { ChatWindow } from '@/components/ai/ChatWindow';

// Interfaces
interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
}

interface CareerAnalysisReport {
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  opportunities: string[];
  recommendedTech: string[];
  recommendedCertifications: string[];
  recommendedProjects: string[];
  learningRoadmap: {
    plan30Days: string[];
    plan90Days: string[];
    plan6Months: string[];
    plan1Year: string[];
  };
}

const QUICK_ACTIONS = [
  { label: 'Review Resume', prompt: 'Review my resume details and tell me if I have any formatting or content deficiencies.' },
  { label: 'Improve Resume', prompt: 'What specific keywords and technical action phrases can I add to highlight my software engineering experience?' },
  { label: 'Suggest Projects', prompt: 'Suggest 3 unique portfolio project ideas utilizing React, TypeScript, and Node.js that look premium.' },
  { label: 'Analyze GitHub', prompt: 'How should I structure my GitHub repositories README files to be recruiter-ready?' },
  { label: 'Create Study Plan', prompt: 'Create a structured 4-week study plan to master Trees, Graphs, and Dynamic Programming.' },
  { label: 'Interview Prep', prompt: 'Give me 3 behavioral questions and advice on how to structure answers using the STAR method.' },
  { label: 'Career Roadmap', prompt: 'Based on my skills, outline a clear path to transition from a junior frontend developer to a full-stack engineer.' },
  { label: 'Improve Portfolio', prompt: 'Suggest key visual sections and SEO meta tags I should add to my developer portfolio website.' },
  { label: 'Learning Resources', prompt: 'Provide a list of free documentation sources and platforms to learn advanced system design.' },
];

export default function AiCoachPage() {
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingTitleId, setEditingTitleId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'chat' | 'analysis' | 'roadmap'>('dashboard');
  const [chatMessages, setChatMessages] = React.useState<Message[]>([]);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [lastQuery, setLastQuery] = React.useState('');

  // Goal Form State
  const [goalModalOpen, setGoalModalOpen] = React.useState(false);
  const [goalForm, setGoalForm] = React.useState({
    title: '',
    description: '',
    targetDate: '',
  });

  // Toasts
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // --- Queries ---
  const { data: conversations = [], isLoading: loadingHistory } = useQuery<Conversation[]>({
    queryKey: ['careerConversations'],
    queryFn: () => apiClient.get<Conversation[]>('/career/history'),
  });

  const { data: analysisReport, refetch: triggerAnalyze, isFetching: analyzingProfile, isError: errorAnalysis } = useQuery<CareerAnalysisReport>({
    queryKey: ['careerAnalysis'],
    queryFn: () => apiClient.post<CareerAnalysisReport>('/career/analyze', {}),
    enabled: false,
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery<any[]>({
    queryKey: ['careerGoals'],
    queryFn: () => apiClient.get<any[]>('/career/goals'),
  });

  const { data: roadmap, isLoading: loadingRoadmap } = useQuery<any>({
    queryKey: ['careerRoadmap'],
    queryFn: () => apiClient.get<any>('/career/roadmap'),
  });

  const { data: recommendations = [], isLoading: loadingRecommendations } = useQuery<any[]>({
    queryKey: ['careerRecommendations'],
    queryFn: () => apiClient.get<any[]>('/career/recommendations'),
  });

  // --- Mutations ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/career/history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerConversations'] });
      if (selectedConvId) {
        setSelectedConvId(null);
        setChatMessages([]);
      }
      showToast('Conversation history deleted successfully');
    },
  });

  const chatMutation = useMutation({
    mutationFn: (payload: { conversationId: string | null; message: string }) =>
      apiClient.post<{ conversationId: string; content: string }>('/career/chat', payload),
    onMutate: () => {
      setIsAiLoading(true);
    },
    onSuccess: (res, variables) => {
      setIsAiLoading(false);
      if (!selectedConvId) {
        setSelectedConvId(res.conversationId);
        queryClient.invalidateQueries({ queryKey: ['careerConversations'] });
      }
      setChatMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), role: 'user', content: variables.message },
        { id: Math.random().toString(), role: 'assistant', content: res.content },
      ]);
    },
    onError: (err) => {
      setIsAiLoading(false);
      showToast('Chat mutation failed', 'error');
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiClient.post<any>('/ai/chat', { message: `Rename conversation ${id} to: ${title}` }),
    onSuccess: () => {
      setEditingTitleId(null);
      queryClient.invalidateQueries({ queryKey: ['careerConversations'] });
      showToast('Conversation renamed');
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/career/goals', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerGoals'] });
      setGoalModalOpen(false);
      setGoalForm({ title: '', description: '', targetDate: '' });
      showToast('Career goal added successfully');
    },
    onError: () => {
      showToast('Failed to create goal', 'error');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient.put(`/career/goals/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerGoals'] });
      showToast('Goal progress updated');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/career/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerGoals'] });
      showToast('Goal removed');
    },
  });

  const generateRoadmapMutation = useMutation({
    mutationFn: () => apiClient.post('/career/roadmap/generate', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerRoadmap'] });
      showToast('Roadmap timeline compiled by AI');
    },
  });

  const generateRecsMutation = useMutation({
    mutationFn: () => apiClient.post('/career/recommendations/generate', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerRecommendations'] });
      showToast('Career recommendations refreshed');
    },
  });

  const toggleRecMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      apiClient.put(`/career/recommendations/${id}/toggle`, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerRecommendations'] });
    },
  });

  const handleRename = (id: string) => {
    if (!renameValue.trim()) return;
    renameMutation.mutate({ id, title: renameValue.trim() });
  };

  const handleSendMessage = (text: string) => {
    setLastQuery(text);
    chatMutation.mutate({
      conversationId: selectedConvId,
      message: text,
    });
  };

  const handleRegenerate = () => {
    if (!lastQuery) return;
    handleSendMessage(lastQuery);
  };

  const handleStop = () => {
    setIsAiLoading(false);
  };

  const handleNewChat = () => {
    setSelectedConvId(null);
    setChatMessages([]);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container className="py-6 space-y-6">
      
      {/* Page header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">AI Career Coach</h1>
          <p className="text-xs text-muted-foreground">Interact with Antigravity to audit resumes, plan DSA topics, and design architectures.</p>
        </div>

        <div className="bg-secondary/45 border border-border/30 rounded-lg p-0.5 flex text-xs flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-bold rounded-md transition-colors ${
              activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 font-bold rounded-md transition-colors ${
              activeTab === 'chat' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Chat Console
          </button>
          <button
            onClick={() => {
              setActiveTab('analysis');
              if (!analysisReport) triggerAnalyze();
            }}
            className={`px-4 py-2 font-bold rounded-md transition-colors ${
              activeTab === 'analysis' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            SWOT Analysis
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 font-bold rounded-md transition-colors ${
              activeTab === 'roadmap' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AI Roadmap
          </button>
        </div>
      </div>

      {/* 1. CAREER DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* TOASTS HUD */}
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
                  <CheckCircle size={14} />
                  <span>{t.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* CAREER SCOREBOARD METRICS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card border border-border/40 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-primary">Career Score</span>
              <span className="text-xl font-bold text-foreground mt-2">85%</span>
            </div>
            <div className="bg-card border border-border/40 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-gray-500">ATS Score</span>
              <span className="text-xl font-bold text-emerald-500 mt-2">82%</span>
            </div>
            <div className="bg-card border border-border/40 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-gray-500">Portfolio Score</span>
              <span className="text-xl font-bold text-foreground mt-2">78%</span>
            </div>
            <div className="bg-card border border-border/40 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-gray-500">DSA Progress</span>
              <span className="text-xl font-bold text-primary mt-2">Active</span>
            </div>
            <div className="bg-card border border-border/40 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-gray-500">Interview Readiness</span>
              <span className="text-xl font-bold text-amber-500 mt-2">Ready</span>
            </div>
          </div>

          {/* GOALS TRACKER & RECOMMENDATIONS COLUMN PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Panel: Goal management (7 cols) */}
            <div className="lg:col-span-7 bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <div>
                  <h3 className="font-display font-semibold text-xs text-foreground">Goal Management</h3>
                  <p className="text-[9px] text-muted-foreground">Track pending roadmap career checkpoints.</p>
                </div>
                <button
                  onClick={() => setGoalModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1.5 rounded-lg hover:bg-primary/20 font-bold"
                >
                  <Plus size={12} />
                  <span>Create Goal</span>
                </button>
              </div>

              {loadingGoals ? (
                <div className="py-8 flex justify-center">
                  <RefreshCw className="animate-spin text-muted-foreground" size={16} />
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-[10px] text-muted-foreground">No active goals found. Let AI suggest some targets!</p>
                  <button
                    onClick={() => {
                      createGoalMutation.mutate({
                        title: 'Master Trees and DFS Algorithms',
                        description: 'Solve 15 Tree problems on DSA tracker within 14 days.',
                        aiGenerated: true,
                      });
                    }}
                    className="text-[9px] font-bold text-primary hover:underline"
                  >
                    Load AI Suggestions
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {goals.map((g) => (
                    <div key={g.id} className="p-3 bg-secondary/15 border border-border/30 rounded-lg flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={g.status === 'Completed'}
                          onChange={() =>
                            updateGoalMutation.mutate({
                              id: g.id,
                              payload: { status: g.status === 'Completed' ? 'Pending' : 'Completed' },
                            })
                          }
                          className="mt-0.5 rounded border-border/40 text-primary bg-transparent focus:ring-0"
                        />
                        <div>
                          <span className={`font-bold block text-foreground ${g.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                            {g.title}
                          </span>
                          {g.description && <span className="text-[9px] text-gray-500 block">{g.description}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteGoalMutation.mutate(g.id)}
                        className="text-gray-500 hover:text-destructive p-1 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel: Smart recommendations widget (5 cols) */}
            <div className="lg:col-span-5 bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <div>
                  <h3 className="font-display font-semibold text-xs text-foreground">Smart Recommendations</h3>
                  <p className="text-[9px] text-muted-foreground">AI suggested learning content.</p>
                </div>
                <button
                  onClick={() => generateRecsMutation.mutate()}
                  disabled={generateRecsMutation.isPending}
                  className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                  title="Generate Recommendations"
                >
                  <RefreshCw size={12} className={generateRecsMutation.isPending ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingRecommendations ? (
                <div className="py-8 flex justify-center">
                  <RefreshCw className="animate-spin text-muted-foreground" size={16} />
                </div>
              ) : recommendations.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-8">Click refresh to generate AI recommendations.</p>
              ) : (
                <div className="space-y-2">
                  {recommendations.map((r) => (
                    <div key={r.id} className="p-3 bg-secondary/15 border border-border/30 rounded-lg flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={r.completed}
                          onChange={() => toggleRecMutation.mutate({ id: r.id, completed: !r.completed })}
                          className="mt-0.5 rounded border-border/40 text-primary bg-transparent focus:ring-0"
                        />
                        <div>
                          <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider block w-max mb-1">
                            {r.type}
                          </span>
                          <span className={`font-bold text-foreground block ${r.completed ? 'line-through text-gray-500' : ''}`}>
                            {r.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CHAT CONSOLE VIEW */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: Conversational History Logs (4 cols) */}
          <div className="lg:col-span-4 bg-card border border-border/45 rounded-xl p-4 flex flex-col h-[500px] space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Conversations</span>
              <button
                onClick={handleNewChat}
                className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1.5 rounded-lg hover:bg-primary/20 font-bold"
              >
                <Plus size={12} />
                <span>New Chat</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search history..."
                className="w-full bg-secondary/30 border border-border/50 pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:border-primary/40 text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Scroll lists */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingHistory ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="animate-spin text-muted-foreground" size={16} />
                </div>
              ) : filteredConversations.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-12">No threads matched search query.</p>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs group cursor-pointer transition-colors ${
                      selectedConvId === conv.id ? 'bg-secondary/70 text-foreground' : 'hover:bg-secondary/40 text-muted-foreground'
                    }`}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      // Pull existing logs if selected (Simulated messages or empty placeholder)
                      setChatMessages([
                        { id: '1', role: 'assistant', content: `Continuing thread: "${conv.title}". How can I help you improve today?` }
                      ]);
                    }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <MessageSquare size={13} className="shrink-0" />
                      {editingTitleId === conv.id ? (
                        <input
                          type="text"
                          className="bg-card border border-border px-1 py-0.5 rounded text-xs focus:outline-none"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRename(conv.id)}
                          autoFocus
                        />
                      ) : (
                        <span className="truncate">{conv.title}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTitleId(conv.id);
                          setRenameValue(conv.title);
                        }}
                        className="hover:text-foreground p-0.5"
                        title="Rename thread"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(conv.id);
                        }}
                        className="hover:text-destructive p-0.5 text-gray-500"
                        title="Delete conversation"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANELS: Chat Window Console & Actions (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            {/* Quick Prompts Chip grid */}
            {chatMessages.length === 0 && (
              <div className="bg-card border border-border/40 rounded-xl p-4 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Suggested Coaching Quick Actions</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(action.prompt)}
                      className="text-[10px] p-2 bg-secondary/30 hover:bg-secondary/60 text-foreground border border-border/40 rounded-lg text-left transition-colors font-medium leading-normal"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Frame */}
            <div className="relative">
              <ChatWindow
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={isAiLoading}
                placeholder="Ask Career Coach... (e.g. audit my resume)"
                assistantName="AI Career Coach"
              />

              {/* Extra generation helper triggers */}
              {chatMessages.length > 0 && (
                <div className="absolute top-2.5 right-12 flex gap-1.5 print:hidden">
                  <button
                    onClick={handleRegenerate}
                    disabled={isAiLoading}
                    className="p-1.5 hover:bg-secondary/40 border border-border/30 text-gray-400 hover:text-foreground rounded-md text-[10px] font-bold inline-flex items-center gap-1 transition-colors bg-card"
                    title="Regenerate last response"
                  >
                    <RefreshCw size={11} className={isAiLoading ? 'animate-spin' : ''} />
                    <span>Regen</span>
                  </button>
                  {isAiLoading && (
                    <button
                      onClick={handleStop}
                      className="p-1.5 hover:bg-secondary/40 border border-border/30 text-rose-500 rounded-md text-[10px] font-bold inline-flex items-center gap-1 transition-colors bg-card"
                      title="Stop response generation"
                    >
                      <StopCircle size={11} />
                      <span>Stop</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 3. SWOT ANALYSIS AUDIT VIEW */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/10 pb-3">
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground">Interactive Career Profile Audit</h3>
                <p className="text-[10px] text-muted-foreground">Scans experiences, DSA solve distributions, and portfolio SEO tags to build career SWOT guides.</p>
              </div>
              <button
                onClick={() => triggerAnalyze()}
                disabled={analyzingProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {analyzingProfile ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                <span>{analyzingProfile ? 'Analyzing...' : 'Audit Career'}</span>
              </button>
            </div>

            {analyzingProfile ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <RefreshCw size={24} className="animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Antigravity is compiling data across developer modules...</span>
              </div>
            ) : errorAnalysis ? (
              <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-3">
                <AlertTriangle size={24} className="text-destructive mx-auto" />
                <p className="text-xs text-foreground font-bold">Failed to load career analysis. Please ensure profile parameters are completed.</p>
              </div>
            ) : !analysisReport ? (
              <div className="py-20 text-center space-y-2">
                <BookOpen size={24} className="text-muted-foreground mx-auto" />
                <span className="text-xs text-foreground font-semibold block">No Report Generated</span>
                <p className="text-[10px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Click the &quot;Audit Career&quot; button to trigger Google Gemini and analyze your strengths, target certifications, and missing skills.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                
                {/* SWOT metrics breakdown grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Strengths */}
                  <div className="border border-border/30 bg-emerald-500/5 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Strengths</span>
                    <ul className="space-y-1.5">
                      {analysisReport.strengths.map((item, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                          <CheckCircle size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="border border-border/30 bg-amber-500/5 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Weaknesses</span>
                    <ul className="space-y-1.5">
                      {analysisReport.weaknesses.map((item, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                          <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Skills */}
                  <div className="border border-border/30 bg-rose-500/5 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Missing Skills</span>
                    <ul className="space-y-1.5">
                      {analysisReport.missingSkills.map((item, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                          <ChevronRight size={12} className="text-rose-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="border border-border/30 bg-blue-500/5 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Opportunities</span>
                    <ul className="space-y-1.5">
                      {analysisReport.opportunities.map((item, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                          <TrendingUp size={12} className="text-blue-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Recommendations checklist sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/10 pt-4">
                  
                  {/* Tech stack */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Recommended Technologies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisReport.recommendedTech.map((tech, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-1 bg-secondary border border-border/30 rounded text-foreground font-semibold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Recommended Certs</span>
                    <ul className="space-y-1">
                      {analysisReport.recommendedCertifications.map((cert, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Award size={12} className="text-primary shrink-0" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Projects */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Suggested Projects</span>
                    <ul className="space-y-1">
                      {analysisReport.recommendedProjects.map((proj, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Folder size={12} className="text-primary shrink-0" />
                          <span>{proj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* TIMELINE LEARNING ROADMAP */}
                <div className="border-t border-border/10 pt-4 space-y-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Structured Learning Roadmap</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* 30 Days */}
                    <div className="bg-secondary/20 border border-border/30 p-3 rounded-lg space-y-1.5">
                      <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                        <Clock size={12} className="text-primary" />
                        <span>30 Days Plan</span>
                      </div>
                      <ul className="space-y-1 text-[10px] text-muted-foreground pl-1">
                        {analysisReport.learningRoadmap.plan30Days.map((step, i) => (
                          <li key={i} className="list-disc list-inside">{step}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 90 Days */}
                    <div className="bg-secondary/20 border border-border/30 p-3 rounded-lg space-y-1.5">
                      <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                        <Clock size={12} className="text-primary" />
                        <span>90 Days Plan</span>
                      </div>
                      <ul className="space-y-1 text-[10px] text-muted-foreground pl-1">
                        {analysisReport.learningRoadmap.plan90Days.map((step, i) => (
                          <li key={i} className="list-disc list-inside">{step}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 6 Months */}
                    <div className="bg-secondary/20 border border-border/30 p-3 rounded-lg space-y-1.5">
                      <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                        <Clock size={12} className="text-primary" />
                        <span>6 Months Plan</span>
                      </div>
                      <ul className="space-y-1 text-[10px] text-muted-foreground pl-1">
                        {analysisReport.learningRoadmap.plan6Months.map((step, i) => (
                          <li key={i} className="list-disc list-inside">{step}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 1 Year */}
                    <div className="bg-secondary/20 border border-border/30 p-3 rounded-lg space-y-1.5">
                      <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                        <Clock size={12} className="text-primary" />
                        <span>1 Year Plan</span>
                      </div>
                      <ul className="space-y-1 text-[10px] text-muted-foreground pl-1">
                        {analysisReport.learningRoadmap.plan1Year.map((step, i) => (
                          <li key={i} className="list-disc list-inside">{step}</li>
                        ))}
                      </ul>
                    </div>

                  </div>

                </div>

              </div>
            )}
          </div>
        </div>
      )}
      {/* --- CREATE GOAL MODAL --- */}
      {goalModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">Create Career Goal</h3>
              <button onClick={() => setGoalModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!goalForm.title.trim()) return;
                createGoalMutation.mutate({
                  title: goalForm.title.trim(),
                  description: goalForm.description.trim() || null,
                  targetDate: goalForm.targetDate || null,
                  aiGenerated: false,
                });
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Goal Title</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="e.g. Complete AWS Certification"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none resize-none"
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  placeholder="e.g. Schedule and complete examination by month-end."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Target Date</label>
                <input
                  type="date"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGoalMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {createGoalMutation.isPending && <RefreshCw size={12} className="animate-spin" />}
                  <span>Save Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Container>
  );
}
