'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Edit,
  Star,
  Clock,
  Layout,
  Loader2,
  X,
  FileCheck,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

interface ResumeItem {
  id: string;
  userId: string;
  name: string;
  template: string;
  isDefault: boolean;
  lastExported: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function ResumePage() {
  const queryClient = useQueryClient();

  // Dialog / Modal States
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newTemplate, setNewTemplate] = React.useState('Modern');

  const [renameId, setRenameId] = React.useState<string | null>(null);
  const [renameName, setRenameName] = React.useState('');

  const [duplicateId, setDuplicateId] = React.useState<string | null>(null);
  const [duplicateName, setDuplicateName] = React.useState('');

  // Search & Filter state variables
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTemplate, setSelectedTemplate] = React.useState('All');

  // Floating Toasts State
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // --- 1. React Query Queries & Mutations ---
  const { data: resumes, isLoading, isError, refetch } = useQuery<ResumeItem[]>({
    queryKey: ['userResumesList'],
    queryFn: () => apiClient.get<ResumeItem[]>('/resumes'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; template: string }) =>
      apiClient.post<ResumeItem>('/resumes', payload),
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: ['userResumesList'] });
      showToast('Resume initialized successfully');
      setCreateOpen(false);
      setNewName('');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to create resume', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ResumeItem> }) =>
      apiClient.put<ResumeItem>(`/resumes/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userResumesList'] });
      showToast('Resume configuration updated successfully');
      setRenameId(null);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update resume', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`/resumes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userResumesList'] });
      showToast('Resume deleted successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete resume', 'error');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient.post<ResumeItem>(`/resumes/${id}/duplicate`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userResumesList'] });
      showToast('Resume duplicated successfully');
      setDuplicateId(null);
      setDuplicateName('');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to duplicate resume', 'error');
    },
  });

  const filteredResumes = React.useMemo(() => {
    if (!resumes) return [];
    return resumes.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTemplate = selectedTemplate === 'All' || r.template === selectedTemplate;
      return matchSearch && matchTemplate;
    });
  }, [resumes, searchTerm, selectedTemplate]);

  // Render Skeletons while loading
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-secondary rounded-xl" />
          ))}
        </div>
      </Container>
    );
  }

  // Render Error state
  if (isError || !resumes) {
    return (
      <Container className="py-12 flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6 shadow-sm">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Failed to Load Resumes</h3>
          <p className="text-xs text-muted-foreground">
            We encountered a network error while fetching your resume dashboard metrics.
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
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

      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-border/40 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Resume Builder</h1>
          <p className="text-xs text-muted-foreground">Build, format, and customize multiple versions of ATS-ready resumes.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          <span>Create Resume</span>
        </button>
      </div>

      {/* Resumes Grid */}
      {/* Search & Filter Bar */}
      {resumes.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 bg-secondary/15 p-3 rounded-lg border border-border/30 justify-between items-center no-print">
          <input
            type="text"
            placeholder="Search resumes by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-xs bg-card border border-border/40 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0">Template:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="bg-card border border-border/40 rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="All">All Templates</option>
              <option value="Modern">Modern</option>
              <option value="Professional">Professional</option>
              <option value="Minimal">Minimal</option>
              <option value="Creative">Creative</option>
            </select>
          </div>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/40 rounded-xl space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <FileText size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">No resumes configured yet</h3>
            <p className="text-xs text-muted-foreground px-8 leading-relaxed">
              Create your first professional layout. Import data from your profile in seconds to avoid double entry.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={12} />
            <span>Create First Resume</span>
          </button>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/40 rounded-xl space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mx-auto">
            <FileText size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">No matching resumes found</h3>
            <p className="text-xs text-muted-foreground px-8 leading-relaxed">
              We couldn&apos;t locate any resumes matching your name query or layout template filter criteria.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTemplate('All');
            }}
            className="inline-flex items-center gap-1 px-4 py-2 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 border border-border/40"
          >
            <span>Reset Search Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((r) => (
            <div
              key={r.id}
              className="bg-card border border-border/40 hover:border-primary/20 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4 transition-all relative group"
            >
              {/* Default Badge */}
              {r.isDefault && (
                <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={8} fill="currentColor" /> Default
                </span>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground truncate pr-16">{r.name}</h3>
                
                <div className="space-y-1 text-[10px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <Layout size={11} /> Layout: {r.template} Template
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> Edited: {new Date(r.updatedAt).toLocaleDateString()}
                  </span>
                  {r.lastExported && (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <FileDown size={11} /> PDF Exported: {new Date(r.lastExported).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions panel */}
              <div className="flex items-center justify-between border-t border-border/20 pt-3 gap-2">
                <Link
                  href={`/resume/${r.id}`}
                  className="px-3.5 py-1.5 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
                >
                  <Edit size={11} /> Edit Layout
                </Link>

                <div className="flex items-center gap-1.5">
                  {!r.isDefault && (
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, payload: { isDefault: true } })}
                      className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-amber-500 rounded-lg transition-colors"
                      title="Set Default"
                    >
                      <Star size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDuplicateId(r.id);
                      setDuplicateName(`${r.name} Copy`);
                    }}
                    className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => {
                      setRenameId(r.id);
                      setRenameName(r.name);
                    }}
                    className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                    title="Rename"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete resume "${r.name}"?`)) {
                        deleteMutation.mutate(r.id);
                      }
                    }}
                    className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
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

      {/* --- CREATE RESUME MODAL --- */}
      {createOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">Create New Resume</h3>
              <button onClick={() => setCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newName.trim()) return;
                createMutation.mutate({ name: newName.trim(), template: newTemplate });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Resume Name</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Software Engineer Resume"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Select Starter Template</label>
                <select
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="Modern">Modern (Clean & Professional)</option>
                  <option value="Professional">Professional (Academic/Corporate)</option>
                  <option value="Minimal">Minimal (Clean Typography)</option>
                  <option value="Creative">Creative (Accent Color Heavy)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Initialize Resume</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DUPLICATE RESUME MODAL --- */}
      {duplicateId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">Duplicate Resume</h3>
              <button onClick={() => setDuplicateId(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!duplicateName.trim()) return;
                duplicateMutation.mutate({ id: duplicateId, name: duplicateName.trim() });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">New Resume Name</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {duplicateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Duplicate Layout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RENAME RESUME MODAL --- */}
      {renameId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">Rename Resume</h3>
              <button onClick={() => setRenameId(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!renameName.trim()) return;
                updateMutation.mutate({ id: renameId, payload: { name: renameName.trim() } });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Resume Name</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameId(null)}
                  className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Rename Layout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
}
