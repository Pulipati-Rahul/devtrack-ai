'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  Plus,
  Copy,
  Archive,
  Trash2,
  Calendar,
  Layers,
  Star,
  ExternalLink,
  Code2,
  FileCheck,
  AlertCircle,
  Loader2,
  FolderDot,
  CheckCircle,
  X
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

interface ProjectListItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  githubUrl: string | null;
  liveUrl: string | null;
  technologies: string | null;
  startDate: string | null;
  targetDate: string | null;
  completedDate: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectStats {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  avgProgress: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();

  // Create Project Modal States
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [newStatus, setNewStatus] = React.useState('Planning');
  const [newPriority, setNewPriority] = React.useState('Medium');
  const [newGithub, setNewGithub] = React.useState('');
  const [newLive, setNewLive] = React.useState('');
  const [newTech, setNewTech] = React.useState('');
  const [newStart, setNewStart] = React.useState('');
  const [newTarget, setNewTarget] = React.useState('');

  // Duplicate Modal State
  const [duplicateId, setDuplicateId] = React.useState<string | null>(null);
  const [duplicateTitle, setDuplicateTitle] = React.useState('');

  // Toast Notifications
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // --- 1. Queries ---
  const { data: projects, isLoading, isError, refetch } = useQuery<ProjectListItem[]>({
    queryKey: ['userProjectsList'],
    queryFn: () => apiClient.get<ProjectListItem[]>('/projects'),
  });

  const { data: stats } = useQuery<ProjectStats>({
    queryKey: ['projectsOverviewStats'],
    queryFn: () => apiClient.get<ProjectStats>('/projects/stats'),
  });

  // --- 2. Mutations ---
  const createMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<ProjectListItem>('/projects', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjectsList'] });
      queryClient.invalidateQueries({ queryKey: ['projectsOverviewStats'] });
      showToast('Project created successfully');
      setCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to create project', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient.put<ProjectListItem>(`/projects/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjectsList'] });
      queryClient.invalidateQueries({ queryKey: ['projectsOverviewStats'] });
      showToast('Project updated successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update project', 'error');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiClient.post<ProjectListItem>(`/projects/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjectsList'] });
      queryClient.invalidateQueries({ queryKey: ['projectsOverviewStats'] });
      showToast('Project archived successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to archive project', 'error');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiClient.post<ProjectListItem>(`/projects/${id}/duplicate`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjectsList'] });
      queryClient.invalidateQueries({ queryKey: ['projectsOverviewStats'] });
      showToast('Project duplicated successfully');
      setDuplicateId(null);
      setDuplicateTitle('');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to duplicate project', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjectsList'] });
      queryClient.invalidateQueries({ queryKey: ['projectsOverviewStats'] });
      showToast('Project deleted successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete project', 'error');
    },
  });

  const resetForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewStatus('Planning');
    setNewPriority('Medium');
    setNewGithub('');
    setNewLive('');
    setNewTech('');
    setNewStart('');
    setNewTarget('');
  };

  if (isLoading) {
    return (
      <Container className="py-6 space-y-8 animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-border/40">
          <div className="space-y-2 w-1/3">
            <div className="h-7 bg-secondary rounded" />
            <div className="h-4 bg-secondary rounded w-2/3" />
          </div>
          <div className="h-9 bg-secondary rounded w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-secondary rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 bg-secondary rounded-xl" />
          ))}
        </div>
      </Container>
    );
  }

  if (isError || !projects) {
    return (
      <Container className="py-12 flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Failed to Load Projects</h3>
          <p className="text-xs text-muted-foreground">We encountered an error loading your project logs.</p>
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

  return (
    <Container className="py-6 space-y-6">
      {/* Toast notifications */}
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

      {/* Header section */}
      <div className="flex justify-between items-center border-b border-border/40 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Project Tracker</h1>
          <p className="text-xs text-muted-foreground">Organize your code workflows, schedule backlog tickets, and build portfolios.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          <span>New Project</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      {stats && stats.totalCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Total Projects</span>
            <span className="text-xl font-bold text-foreground mt-2">{stats.totalCount}</span>
          </div>
          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Active Tasks</span>
            <span className="text-xl font-bold text-primary mt-2">{stats.activeCount}</span>
          </div>
          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Completed</span>
            <span className="text-xl font-bold text-emerald-500 mt-2">{stats.completedCount}</span>
          </div>
          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Archived</span>
            <span className="text-xl font-bold text-gray-500 mt-2">{stats.archivedCount}</span>
          </div>
          <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm col-span-2 md:col-span-1">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Overall Progress</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xl font-bold text-foreground">{stats.avgProgress}%</span>
              <div className="h-1.5 w-12 bg-secondary rounded-full overflow-hidden flex-grow border border-border/30">
                <div className="h-full bg-primary" style={{ width: `${stats.avgProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECTS LIST GRID */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/40 rounded-xl space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <FolderGit2 size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">No projects created yet</h3>
            <p className="text-xs text-muted-foreground px-8 leading-relaxed">
              Track your dev goals. Add tasks, write documentation, log notes, and calculate project completeness percentage.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={12} />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-card border border-border/40 hover:border-primary/20 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4 transition-all relative group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-bold text-foreground truncate pr-12">{p.title}</h3>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                    p.status === 'Completed'
                      ? 'text-emerald-500 bg-emerald-500/10'
                      : p.status === 'Archived'
                      ? 'text-gray-500 bg-secondary'
                      : 'text-primary bg-primary/10'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[36px]">
                  {p.description || 'No description added.'}
                </p>

                {/* Tech tags list */}
                {p.technologies && (
                  <div className="flex flex-wrap gap-1">
                    {p.technologies.split(',').map((tech) => (
                      <span key={tech} className="text-[9px] bg-secondary border border-border/30 px-2 py-0.5 rounded text-foreground font-medium">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress bar info */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                    <span>Task Progress</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/30">
                    <div
                      className={`h-full transition-all duration-300 ${p.status === 'Completed' ? 'bg-emerald-500' : 'bg-primary'}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card actions panel */}
              <div className="flex items-center justify-between border-t border-border/20 pt-3 gap-2">
                <Link
                  href={`/projects/${p.id}`}
                  className="px-3.5 py-1.5 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
                >
                  <FolderDot size={11} />
                  <span>Open Boards</span>
                </Link>

                <div className="flex items-center gap-1">
                  {p.status !== 'Archived' && (
                    <button
                      onClick={() => archiveMutation.mutate(p.id)}
                      className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-gray-400 rounded-lg"
                      title="Archive Project"
                    >
                      <Archive size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDuplicateId(p.id);
                      setDuplicateTitle(`${p.title} Copy`);
                    }}
                    className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded-lg"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete project "${p.title}"?`)) {
                        deleteMutation.mutate(p.id);
                      }
                    }}
                    className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-destructive rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CREATE PROJECT MODAL --- */}
      {createOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">Create New Project</h3>
              <button onClick={() => setCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                createMutation.mutate({
                  title: newTitle.trim(),
                  description: newDesc.trim() || null,
                  status: newStatus,
                  priority: newPriority,
                  githubUrl: newGithub.trim() || null,
                  liveUrl: newLive.trim() || null,
                  technologies: newTech.trim() || null,
                  startDate: newStart ? new Date(newStart) : null,
                  targetDate: newTarget ? new Date(newTarget) : null,
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Project Title</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Portfolio Website"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none resize-none"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Summarize objectives..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Testing">Testing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Technologies (comma separated)</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="React, Node.js, PostgreSQL"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Target Date</label>
                  <input
                    type="date"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">GitHub URL</label>
                  <input
                    type="url"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={newGithub}
                    onChange={(e) => setNewGithub(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Live URL</label>
                  <input
                    type="url"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={newLive}
                    onChange={(e) => setNewLive(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
                >
                  {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Initialize Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DUPLICATE PROJECT MODAL --- */}
      {duplicateId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">Duplicate Project</h3>
              <button onClick={() => setDuplicateId(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!duplicateTitle.trim()) return;
                duplicateMutation.mutate({ id: duplicateId, title: duplicateTitle.trim() });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">New Project Title</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={duplicateTitle}
                  onChange={(e) => setDuplicateTitle(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDuplicateId(null)}
                  className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={duplicateMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
                >
                  {duplicateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Duplicate Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
}
