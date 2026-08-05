'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Save,
  Printer,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Layout,
  Settings,
  Eye,
  Edit3,
  ExternalLink,
  Bot,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Trophy,
  Globe,
  PlusCircle,
  HelpCircle,
  X,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

// Define layout models
interface Section {
  id: string;
  sectionType: string;
  sortOrder: number;
  visible: boolean;
  content: any;
}

interface ResumeDetails {
  resume: {
    id: string;
    userId: string;
    name: string;
    template: string;
    summary: string | null;
    isDefault: boolean;
    lastExported: string | null;
    font: string;
    accentColor: string;
    spacing: number;
    fontSize: number;
  };
  sections: Section[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function ResumeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const resumeId = params.id as string;

  // View States
  const [viewMode, setViewMode] = React.useState<'split' | 'edit' | 'preview'>('split');
  const [activeSectionType, setActiveSectionType] = React.useState<string>('personal');
  const [saveStatus, setSaveStatus] = React.useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Undo/Redo & Zoom States
  const [pastHistory, setPastHistory] = React.useState<Record<string, Section>[]>([]);
  const [futureHistory, setFutureHistory] = React.useState<Record<string, Section>[]>([]);
  const [zoomScale, setZoomScale] = React.useState<number>(100);



  // Import Dialog States
  const [importOpen, setImportOpen] = React.useState(false);
  const [importSections, setImportSections] = React.useState<string[]>([
    'personal',
    'summary',
    'education',
    'experience',
    'skills',
    'certifications',
    'achievements',
  ]);

  // Floating Toasts
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // --- 1. Querying Resume Telemetry ---
  const { data, isLoading, isError, refetch } = useQuery<ResumeDetails>({
    queryKey: ['resumeEditorDetails', resumeId],
    queryFn: () => apiClient.get<ResumeDetails>(`/resumes/${resumeId}`),
    refetchOnWindowFocus: false,
  });

  // --- 2. Local State Syncing ---
  const [themeState, setThemeState] = React.useState({
    name: '',
    template: 'Modern',
    font: 'Inter',
    accentColor: '#3b82f6',
    spacing: 2,
    fontSize: 12,
  });

  const [sectionStates, setSectionStates] = React.useState<Record<string, Section>>({});

  React.useEffect(() => {
    if (data?.resume) {
      setThemeState({
        name: data.resume.name,
        template: data.resume.template || 'Modern',
        font: data.resume.font || 'Inter',
        accentColor: data.resume.accentColor || '#3b82f6',
        spacing: data.resume.spacing || 2,
        fontSize: data.resume.fontSize || 12,
      });

      const secMap: Record<string, Section> = {};
      data.sections.forEach((sec) => {
        secMap[sec.sectionType] = sec;
      });
      setSectionStates(secMap);
    }
  }, [data]);

  // --- 3. Mutation Hooks ---
  const updateResumeMutation = useMutation({
    mutationFn: (payload: any) => apiClient.put<any>(`/resumes/${resumeId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumeEditorDetails', resumeId] });
      setSaveStatus('saved');
    },
    onError: (err: any) => {
      showToast(err.message || 'Auto-save failed', 'error');
      setSaveStatus('unsaved');
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: string; payload: any }) =>
      apiClient.put<any>(`/resumes/${resumeId}/sections/${sectionId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumeEditorDetails', resumeId] });
      setSaveStatus('saved');
    },
    onError: (err: any) => {
      showToast(err.message || 'Section auto-save failed', 'error');
      setSaveStatus('unsaved');
    },
  });

  const importProfileMutation = useMutation({
    mutationFn: (payload: { sections: string[] }) =>
      apiClient.post<ResumeDetails>(`/resumes/${resumeId}/import-profile`, payload),
    onSuccess: (updatedDetails) => {
      queryClient.setQueryData(['resumeEditorDetails', resumeId], updatedDetails);
      showToast('Profile credentials imported successfully');
      setImportOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || 'Profile import failed', 'error');
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => apiClient.post<any>(`/resumes/${resumeId}/export`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumeEditorDetails', resumeId] });
      showToast('Resume marked as exported');
    },
  });

  const handleUndo = React.useCallback(() => {
    if (pastHistory.length === 0) return;
    const previous = pastHistory[pastHistory.length - 1];
    const restPast = pastHistory.slice(0, pastHistory.length - 1);

    setFutureHistory((prev) => [sectionStates, ...prev]);
    setPastHistory(restPast);
    setSectionStates(previous);

    // Save previous state to backend database
    setSaveStatus('saving');
    Object.values(previous).forEach((sec) => {
      updateSectionMutation.mutate({
        sectionId: sec.id,
        payload: {
          visible: sec.visible,
          sortOrder: sec.sortOrder,
          content: sec.content,
        },
      });
    });
    showToast('Undo action triggered');
  }, [pastHistory, sectionStates, updateSectionMutation]);

  const handleRedo = React.useCallback(() => {
    if (futureHistory.length === 0) return;
    const next = futureHistory[0];
    const restFuture = futureHistory.slice(1);

    setPastHistory((prev) => [...prev, sectionStates]);
    setFutureHistory(restFuture);
    setSectionStates(next);

    // Save next state to backend database
    setSaveStatus('saving');
    Object.values(next).forEach((sec) => {
      updateSectionMutation.mutate({
        sectionId: sec.id,
        payload: {
          visible: sec.visible,
          sortOrder: sec.sortOrder,
          content: sec.content,
        },
      });
    });
    showToast('Redo action triggered');
  }, [futureHistory, sectionStates, updateSectionMutation]);

  // Keyboard shortcut listeners for Ctrl+Z and Ctrl+Y
  React.useEffect(() => {
    const handleUndoRedoKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
        // Allow native undo/redo inside input elements
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleUndoRedoKeys);
    return () => window.removeEventListener('keydown', handleUndoRedoKeys);
  }, [handleUndo, handleRedo]);

  // --- 4. Debounced Save System ---
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSaveResume = (updatedTheme: typeof themeState) => {
    if (saveStatus === 'saved') {
      setPastHistory((prev) => [...prev, sectionStates]);
      setFutureHistory([]);
    }
    setSaveStatus('saving');
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      updateResumeMutation.mutate(updatedTheme);
    }, 1500);
  };

  const triggerAutoSaveSection = (secType: string, updatedSec: Section) => {
    if (saveStatus === 'saved') {
      setPastHistory((prev) => [...prev, sectionStates]);
      setFutureHistory([]);
    }
    setSaveStatus('saving');
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      updateSectionMutation.mutate({
        sectionId: updatedSec.id,
        payload: {
          visible: updatedSec.visible,
          sortOrder: updatedSec.sortOrder,
          content: updatedSec.content,
        },
      });
    }, 1500);
  };

  // --- 5. Custom Reorder (Arrow keys - fully accessible) ---
  const handleMoveSection = (secType: string, direction: 'up' | 'down') => {
    if (!data) return;
    const currentList = [...data.sections].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = currentList.findIndex((s) => s.sectionType === secType);
    if (index === -1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= currentList.length) return;

    const temp = currentList[index].sortOrder;
    currentList[index].sortOrder = currentList[swapIndex].sortOrder;
    currentList[swapIndex].sortOrder = temp;

    setSaveStatus('saving');
    // Save both sections
    Promise.all([
      updateSectionMutation.mutateAsync({
        sectionId: currentList[index].id,
        payload: { sortOrder: currentList[index].sortOrder },
      }),
      updateSectionMutation.mutateAsync({
        sectionId: currentList[swapIndex].id,
        payload: { sortOrder: currentList[swapIndex].sortOrder },
      }),
    ]).then(() => {
      showToast('Section order re-arranged successfully');
    });
  };

  // Helpers to mutate section contents
  const updatePersonalContent = (fields: any) => {
    const sec = sectionStates['personal'];
    if (!sec) return;
    const updated = {
      ...sec,
      content: { ...sec.content, ...fields },
    };
    setSectionStates({ ...sectionStates, personal: updated });
    triggerAutoSaveSection('personal', updated);
  };

  const updateSummaryContent = (text: string) => {
    const sec = sectionStates['summary'];
    if (!sec) return;
    const updated = {
      ...sec,
      content: { ...sec.content, text },
    };
    setSectionStates({ ...sectionStates, summary: updated });
    triggerAutoSaveSection('summary', updated);
  };

  const handleUpdateListItem = (secType: string, index: number, fields: any) => {
    const sec = sectionStates[secType];
    if (!sec || !Array.isArray(sec.content)) return;
    const items = [...sec.content];
    items[index] = { ...items[index], ...fields };
    const updated = { ...sec, content: items };
    setSectionStates({ ...sectionStates, [secType]: updated });
    triggerAutoSaveSection(secType, updated);
  };

  const handleAddListItem = (secType: string, newEmptyItem: any) => {
    const sec = sectionStates[secType];
    if (!sec) return;
    const items = Array.isArray(sec.content) ? [...sec.content] : [];
    items.push({ id: Math.random().toString(36).substring(2, 9), ...newEmptyItem });
    const updated = { ...sec, content: items };
    setSectionStates({ ...sectionStates, [secType]: updated });
    triggerAutoSaveSection(secType, updated);
  };

  const handleDeleteListItem = (secType: string, index: number) => {
    const sec = sectionStates[secType];
    if (!sec || !Array.isArray(sec.content)) return;
    const items = [...sec.content];
    items.splice(index, 1);
    const updated = { ...sec, content: items };
    setSectionStates({ ...sectionStates, [secType]: updated });
    triggerAutoSaveSection(secType, updated);
  };

  const toggleSectionVisibility = (secType: string) => {
    const sec = sectionStates[secType];
    if (!sec) return;
    const updated = { ...sec, visible: !sec.visible };
    setSectionStates({ ...sectionStates, [secType]: updated });
    triggerAutoSaveSection(secType, updated);
  };

  // Native Print Dialogue caller
  const handlePrintExport = () => {
    exportMutation.mutate();
    window.print();
  };

  if (isLoading) {
    return (
      <Container className="py-8 animate-pulse space-y-6">
        <div className="h-8 bg-secondary rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[600px] bg-secondary rounded-xl" />
          <div className="h-[600px] bg-secondary rounded-xl" />
        </div>
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="py-12 flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Failed to Load Editor</h3>
          <p className="text-xs text-muted-foreground">We couldn&apos;t retrieve the specifications of this resume.</p>
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

  const pSec = sectionStates['personal']?.content || {};
  const sSec = sectionStates['summary']?.content || {};
  const eduItems = sectionStates['education']?.content || [];
  const expItems = sectionStates['experience']?.content || [];
  const skillItems = sectionStates['skills']?.content || [];
  const projItems = sectionStates['projects']?.content || [];
  const certItems = sectionStates['certifications']?.content || [];
  const achItems = sectionStates['achievements']?.content || [];
  const langItems = sectionStates['languages']?.content || [];
  const interestItems = sectionStates['interests']?.content || [];
  const customSec = sectionStates['custom']?.content || { title: 'Custom Section', items: [] };

  return (
    <Container className="py-6 space-y-6 print-container">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm no-print">
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

      {/* Editor Top Bar - Hidden on print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/40 pb-4 gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/resume')}
            className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>{themeState.name}</span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  saveStatus === 'saved'
                    ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                    : saveStatus === 'saving'
                    ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20 animate-pulse'
                    : 'text-rose-500 bg-rose-500/10 border border-rose-500/20'
                }`}
              >
                {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved Changes'}
              </span>
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Template starter: {themeState.template}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Responsive Layout Selector Toggle */}
          <div className="bg-secondary/30 p-0.5 rounded-lg border border-border/50 flex shrink-0">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${
                viewMode === 'edit' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`hidden md:block px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${
                viewMode === 'split' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${
                viewMode === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-2 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 transition-colors shrink-0"
          >
            <RefreshCw size={12} />
            <span>Sync Profile</span>
          </button>

          <button
            onClick={handlePrintExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            <Printer size={13} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Editor Split Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: Section Editor (Hidden in Print and Preview Modes) */}
        <div
          className={`space-y-6 no-print ${
            viewMode === 'preview' ? 'hidden' : viewMode === 'edit' ? 'block' : 'block lg:block'
          }`}
        >
          {/* Theme customizer settings toolbar */}
          <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary border-b border-border/20 pb-2">
              <Settings size={14} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Theme & Layout Options</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-muted-foreground uppercase">Template</label>
                <select
                  value={themeState.template}
                  onChange={(e) => {
                    const u = { ...themeState, template: e.target.value };
                    setThemeState(u);
                    triggerAutoSaveResume(u);
                  }}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="Modern">Modern</option>
                  <option value="Professional">Professional</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-muted-foreground uppercase">Font</label>
                <select
                  value={themeState.font}
                  onChange={(e) => {
                    const u = { ...themeState, font: e.target.value };
                    setThemeState(u);
                    triggerAutoSaveResume(u);
                  }}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="Inter">Sans-Serif (Inter)</option>
                  <option value="Merriweather">Serif (Merriweather)</option>
                  <option value="Fira Code">Monospace (Fira)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-muted-foreground uppercase">Spacing</label>
                <select
                  value={themeState.spacing}
                  onChange={(e) => {
                    const u = { ...themeState, spacing: parseInt(e.target.value) };
                    setThemeState(u);
                    triggerAutoSaveResume(u);
                  }}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="1">Tight</option>
                  <option value="2">Normal</option>
                  <option value="3">Relaxed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-muted-foreground uppercase">Font Size</label>
                <select
                  value={themeState.fontSize}
                  onChange={(e) => {
                    const u = { ...themeState, fontSize: parseInt(e.target.value) };
                    setThemeState(u);
                    triggerAutoSaveResume(u);
                  }}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="10">10px</option>
                  <option value="11">11px</option>
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="block text-[9px] font-bold text-muted-foreground uppercase">Accent Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeState.accentColor}
                  onChange={(e) => {
                    const u = { ...themeState, accentColor: e.target.value };
                    setThemeState(u);
                    triggerAutoSaveResume(u);
                  }}
                  className="h-7 w-12 bg-secondary border border-border/50 rounded cursor-pointer"
                />
                <span className="text-xs text-muted-foreground uppercase font-mono">{themeState.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Collapsible Sections Accordion List */}
          <div className="space-y-3">
            {data.sections
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((sec) => {
                const sType = sec.sectionType;
                const isSelected = activeSectionType === sType;

                return (
                  <div key={sec.id} className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3.5 bg-secondary/10 border-b border-border/10">
                      <button
                        onClick={() => setActiveSectionType(isSelected ? '' : sType)}
                        className="flex items-center gap-2.5 text-left text-xs font-bold text-foreground uppercase tracking-wider"
                      >
                        {sType === 'personal' && <User size={13} />}
                        {sType === 'summary' && <FileText size={13} />}
                        {sType === 'education' && <GraduationCap size={13} />}
                        {sType === 'experience' && <Briefcase size={13} />}
                        {sType === 'skills' && <Code2 size={13} />}
                        {sType === 'projects' && <Globe size={13} />}
                        {sType === 'certifications' && <Award size={13} />}
                        {sType === 'achievements' && <Trophy size={13} />}
                        <span>{sType === 'custom' ? customSec.title || 'Custom Section' : sType}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Move Buttons (fully accessible) */}
                        <button
                          onClick={() => handleMoveSection(sType, 'up')}
                          className="p-1 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded"
                          title="Move Section Up"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          onClick={() => handleMoveSection(sType, 'down')}
                          className="p-1 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded"
                          title="Move Section Down"
                        >
                          <ChevronDown size={12} />
                        </button>

                        {/* Visibility Toggle checkbox */}
                        <button
                          onClick={() => toggleSectionVisibility(sType)}
                          className={`px-2 py-1 text-[9px] font-bold uppercase rounded ${
                            sec.visible
                              ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                              : 'text-muted-foreground bg-secondary/50 border border-border/20'
                          }`}
                        >
                          {sec.visible ? 'Visible' : 'Hidden'}
                        </button>
                      </div>
                    </div>

                    {/* Section body forms */}
                    {isSelected && (
                      <div className="p-4 space-y-4 border-t border-border/10">
                        
                        {/* A. PERSONAL SECTION FORM */}
                        {sType === 'personal' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Full Name</label>
                              <input
                                type="text"
                                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                                value={pSec.fullName || ''}
                                onChange={(e) => updatePersonalContent({ fullName: e.target.value })}
                                placeholder="e.g. John Doe"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Professional Title</label>
                              <input
                                type="text"
                                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                                value={pSec.headline || ''}
                                onChange={(e) => updatePersonalContent({ headline: e.target.value })}
                                placeholder="e.g. Full-Stack Engineer"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Email</label>
                              <input
                                type="email"
                                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                                value={pSec.email || ''}
                                onChange={(e) => updatePersonalContent({ email: e.target.value })}
                                placeholder="e.g. john@example.com"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Phone</label>
                              <input
                                type="text"
                                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                                value={pSec.phone || ''}
                                onChange={(e) => updatePersonalContent({ phone: e.target.value })}
                                placeholder="e.g. +1-234-567-890"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">City</label>
                              <input
                                type="text"
                                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                                value={pSec.city || ''}
                                onChange={(e) => updatePersonalContent({ city: e.target.value })}
                                placeholder="e.g. San Francisco"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Country</label>
                              <input
                                type="text"
                                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                                value={pSec.country || ''}
                                onChange={(e) => updatePersonalContent({ country: e.target.value })}
                                placeholder="e.g. USA"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">GitHub URL</label>
                              <input
                                type="url"
                                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                                value={pSec.githubUrl || ''}
                                onChange={(e) => updatePersonalContent({ githubUrl: e.target.value })}
                                placeholder="https://github.com/username"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">LinkedIn URL</label>
                              <input
                                type="url"
                                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                                value={pSec.linkedinUrl || ''}
                                onChange={(e) => updatePersonalContent({ linkedinUrl: e.target.value })}
                                placeholder="https://linkedin.com/in/username"
                              />
                            </div>
                          </div>
                        )}

                        {/* B. SUMMARY FORM */}
                        {sType === 'summary' && (
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-bold text-muted-foreground">Professional Summary</label>
                            <textarea
                              rows={5}
                              className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none resize-none"
                              value={sSec.text || ''}
                              onChange={(e) => updateSummaryContent(e.target.value)}
                              placeholder="Write a short summary of your core achievements..."
                            />
                          </div>
                        )}

                        {/* C. EDUCATION CHRONOLOGY FORM */}
                        {sType === 'education' && (
                          <div className="space-y-4">
                            {eduItems.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="bg-secondary/15 p-3 rounded-lg border border-border/30 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-primary">Academic Item #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListItem('education', idx)}
                                    className="p-1 hover:bg-secondary/50 rounded text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.college || ''}
                                    onChange={(e) => handleUpdateListItem('education', idx, { college: e.target.value })}
                                    placeholder="College/School"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.degree || ''}
                                    onChange={(e) => handleUpdateListItem('education', idx, { degree: e.target.value })}
                                    placeholder="Degree"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.branch || ''}
                                    onChange={(e) => handleUpdateListItem('education', idx, { branch: e.target.value })}
                                    placeholder="Branch/Major"
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.cgpa || ''}
                                    onChange={(e) => handleUpdateListItem('education', idx, { cgpa: e.target.value })}
                                    placeholder="GPA/CGPA"
                                  />
                                  <input
                                    type="number"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.startYear || ''}
                                    onChange={(e) => handleUpdateListItem('education', idx, { startYear: parseInt(e.target.value) })}
                                    placeholder="Start Year"
                                  />
                                  <input
                                    type="number"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.endYear || ''}
                                    onChange={(e) => handleUpdateListItem('education', idx, { endYear: e.target.value ? parseInt(e.target.value) : null })}
                                    placeholder="End Year"
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddListItem('education', { college: '', degree: '', branch: '', cgpa: '', startYear: 2020, endYear: 2024, description: '' })}
                              className="w-full py-2 border border-dashed border-border/40 hover:border-primary/45 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <PlusCircle size={13} /> Add Academic Item
                            </button>
                          </div>
                        )}

                        {/* D. EXPERIENCE FORM */}
                        {sType === 'experience' && (
                          <div className="space-y-4">
                            {expItems.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="bg-secondary/15 p-3 rounded-lg border border-border/30 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-primary">Job Experience #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListItem('experience', idx)}
                                    className="p-1 hover:bg-secondary/50 rounded text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.company || ''}
                                    onChange={(e) => handleUpdateListItem('experience', idx, { company: e.target.value })}
                                    placeholder="Company"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.position || ''}
                                    onChange={(e) => handleUpdateListItem('experience', idx, { position: e.target.value })}
                                    placeholder="Position Title"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.startDate || ''}
                                    onChange={(e) => handleUpdateListItem('experience', idx, { startDate: e.target.value })}
                                    placeholder="Start Date (e.g. 2022-01)"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.endDate || ''}
                                    onChange={(e) => handleUpdateListItem('experience', idx, { endDate: e.target.value })}
                                    placeholder="End Date (e.g. 2023-01)"
                                    disabled={item.currentlyWorking}
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`working_${idx}`}
                                    checked={item.currentlyWorking || false}
                                    onChange={(e) => handleUpdateListItem('experience', idx, { currentlyWorking: e.target.checked })}
                                  />
                                  <label htmlFor={`working_${idx}`} className="text-xs">I am currently working here</label>
                                </div>

                                <textarea
                                  rows={3}
                                  className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none resize-none"
                                  value={item.description || ''}
                                  onChange={(e) => handleUpdateListItem('experience', idx, { description: e.target.value })}
                                  placeholder="List accomplishments..."
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddListItem('experience', { company: '', position: '', employmentType: 'Full-Time', currentlyWorking: false, startDate: '', endDate: '', description: '' })}
                              className="w-full py-2 border border-dashed border-border/40 hover:border-primary/45 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <PlusCircle size={13} /> Add Work Item
                            </button>
                          </div>
                        )}

                        {/* E. SKILLS FORM */}
                        {sType === 'skills' && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {skillItems.map((sk: any, idx: number) => (
                                <div key={sk.id || idx} className="px-3 py-1 bg-secondary border border-border/30 rounded-lg text-xs flex items-center gap-1">
                                  <span className="font-semibold text-foreground">{sk.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListItem('skills', idx)}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add Skill Row */}
                            <div className="flex gap-2 items-center">
                              <input
                                id="new_skill_input"
                                type="text"
                                className="bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs focus:outline-none flex-grow"
                                placeholder="Add skill (e.g. React)..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    if (val) {
                                      handleAddListItem('skills', { name: val, category: 'Frontend', level: 'Intermediate' });
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('new_skill_input') as HTMLInputElement;
                                  const val = input?.value.trim();
                                  if (val) {
                                    handleAddListItem('skills', { name: val, category: 'Frontend', level: 'Intermediate' });
                                    input.value = '';
                                  }
                                }}
                                className="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}

                        {/* F. PROJECTS FORM */}
                        {sType === 'projects' && (
                          <div className="space-y-4">
                            {projItems.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="bg-secondary/15 p-3 rounded-lg border border-border/30 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-primary">Project Item #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListItem('projects', idx)}
                                    className="p-1 hover:bg-secondary/50 rounded text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.title || ''}
                                    onChange={(e) => handleUpdateListItem('projects', idx, { title: e.target.value })}
                                    placeholder="Project Title"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.role || ''}
                                    onChange={(e) => handleUpdateListItem('projects', idx, { role: e.target.value })}
                                    placeholder="Your Role"
                                  />
                                  <input
                                    type="url"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none col-span-2"
                                    value={item.githubUrl || ''}
                                    onChange={(e) => handleUpdateListItem('projects', idx, { githubUrl: e.target.value })}
                                    placeholder="GitHub URL"
                                  />
                                </div>

                                <textarea
                                  rows={3}
                                  className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none resize-none"
                                  value={item.description || ''}
                                  onChange={(e) => handleUpdateListItem('projects', idx, { description: e.target.value })}
                                  placeholder="Project details..."
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddListItem('projects', { title: '', role: '', githubUrl: '', liveUrl: '', description: '' })}
                              className="w-full py-2 border border-dashed border-border/40 hover:border-primary/45 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <PlusCircle size={13} /> Add Project Item
                            </button>
                          </div>
                        )}

                        {/* G. CERTIFICATIONS FORM */}
                        {sType === 'certifications' && (
                          <div className="space-y-4">
                            {certItems.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="bg-secondary/15 p-3 rounded-lg border border-border/30 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-primary">Certificate Item #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListItem('certifications', idx)}
                                    className="p-1 hover:bg-secondary/50 rounded text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.title || ''}
                                    onChange={(e) => handleUpdateListItem('certifications', idx, { title: e.target.value })}
                                    placeholder="Title"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.issuer || ''}
                                    onChange={(e) => handleUpdateListItem('certifications', idx, { issuer: e.target.value })}
                                    placeholder="Issuer"
                                    required
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddListItem('certifications', { title: '', issuer: '', issueDate: '', credentialId: '', credentialUrl: '' })}
                              className="w-full py-2 border border-dashed border-border/40 hover:border-primary/45 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <PlusCircle size={13} /> Add Certificate
                            </button>
                          </div>
                        )}

                        {/* H. ACHIEVEMENTS FORM */}
                        {sType === 'achievements' && (
                          <div className="space-y-4">
                            {achItems.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="bg-secondary/15 p-3 rounded-lg border border-border/30 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-primary">Achievement #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListItem('achievements', idx)}
                                    className="p-1 hover:bg-secondary/50 rounded text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.title || ''}
                                    onChange={(e) => handleUpdateListItem('achievements', idx, { title: e.target.value })}
                                    placeholder="Achievement Title"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.date || ''}
                                    onChange={(e) => handleUpdateListItem('achievements', idx, { date: e.target.value })}
                                    placeholder="Date (optional)"
                                  />
                                </div>
                                <textarea
                                  rows={2}
                                  className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none resize-none"
                                  value={item.description || ''}
                                  onChange={(e) => handleUpdateListItem('achievements', idx, { description: e.target.value })}
                                  placeholder="Describe your achievement..."
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddListItem('achievements', { title: '', date: '', description: '' })}
                              className="w-full py-2 border border-dashed border-border/40 hover:border-primary/45 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <PlusCircle size={13} /> Add Achievement
                            </button>
                          </div>
                        )}

                        {/* I. LANGUAGES FORM */}
                        {sType === 'languages' && (
                          <div className="space-y-4">
                            {langItems.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="bg-secondary/15 p-3 rounded-lg border border-border/30 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-primary">Language #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListItem('languages', idx)}
                                    className="p-1 hover:bg-secondary/50 rounded text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.name || ''}
                                    onChange={(e) => handleUpdateListItem('languages', idx, { name: e.target.value })}
                                    placeholder="Language (e.g. English)"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.level || ''}
                                    onChange={(e) => handleUpdateListItem('languages', idx, { level: e.target.value })}
                                    placeholder="Proficiency (e.g. Native, Fluent)"
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddListItem('languages', { name: '', level: '' })}
                              className="w-full py-2 border border-dashed border-border/40 hover:border-primary/45 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <PlusCircle size={13} /> Add Language
                            </button>
                          </div>
                        )}

                        {/* J. INTERESTS FORM */}
                        {sType === 'interests' && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {interestItems.map((item: any, idx: number) => (
                                <div key={item.id || idx} className="px-3 py-1 bg-secondary border border-border/30 rounded-lg text-xs flex items-center gap-1">
                                  <span className="font-semibold text-foreground">{item.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListItem('interests', idx)}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 items-center">
                              <input
                                id="new_interest_input"
                                type="text"
                                className="bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs focus:outline-none flex-grow"
                                placeholder="Add interest (e.g. Chess)..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    if (val) {
                                      handleAddListItem('interests', { name: val });
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('new_interest_input') as HTMLInputElement;
                                  const val = input?.value.trim();
                                  if (val) {
                                    handleAddListItem('interests', { name: val });
                                    input.value = '';
                                  }
                                }}
                                className="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}

                        {/* K. CUSTOM SECTIONS FORM */}
                        {sType === 'custom' && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Section Title</label>
                              <input
                                type="text"
                                className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                                value={customSec.title || ''}
                                onChange={(e) => {
                                  const sec = sectionStates['custom'];
                                  if (!sec) return;
                                  const updated = {
                                    ...sec,
                                    content: { ...sec.content, title: e.target.value }
                                  };
                                  setSectionStates({ ...sectionStates, custom: updated });
                                  triggerAutoSaveSection('custom', updated);
                                }}
                                placeholder="Custom Section Title"
                              />
                            </div>
                            {(customSec.items || []).map((item: any, idx: number) => (
                              <div key={item.id || idx} className="bg-secondary/15 p-3 rounded-lg border border-border/30 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-primary">Custom Item #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const sec = sectionStates['custom'];
                                      if (!sec) return;
                                      const items = [...(sec.content.items || [])];
                                      items.splice(idx, 1);
                                      const updated = { ...sec, content: { ...sec.content, items } };
                                      setSectionStates({ ...sectionStates, custom: updated });
                                      triggerAutoSaveSection('custom', updated);
                                    }}
                                    className="p-1 hover:bg-secondary/50 rounded text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.label || ''}
                                    onChange={(e) => {
                                      const sec = sectionStates['custom'];
                                      if (!sec) return;
                                      const items = [...(sec.content.items || [])];
                                      items[idx] = { ...items[idx], label: e.target.value };
                                      const updated = { ...sec, content: { ...sec.content, items } };
                                      setSectionStates({ ...sectionStates, custom: updated });
                                      triggerAutoSaveSection('custom', updated);
                                    }}
                                    placeholder="Label/Role"
                                    required
                                  />
                                  <input
                                    type="text"
                                    className="bg-card border border-border/50 rounded-lg p-2 text-xs focus:outline-none"
                                    value={item.value || ''}
                                    onChange={(e) => {
                                      const sec = sectionStates['custom'];
                                      if (!sec) return;
                                      const items = [...(sec.content.items || [])];
                                      items[idx] = { ...items[idx], value: e.target.value };
                                      const updated = { ...sec, content: { ...sec.content, items } };
                                      setSectionStates({ ...sectionStates, custom: updated });
                                      triggerAutoSaveSection('custom', updated);
                                    }}
                                    placeholder="Value/Detail"
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const sec = sectionStates['custom'];
                                if (!sec) return;
                                const items = Array.isArray(sec.content.items) ? [...sec.content.items] : [];
                                items.push({ id: Math.random().toString(36).substring(2, 9), label: '', value: '' });
                                const updated = { ...sec, content: { ...sec.content, items } };
                                setSectionStates({ ...sectionStates, custom: updated });
                                triggerAutoSaveSection('custom', updated);
                              }}
                              className="w-full py-2 border border-dashed border-border/40 hover:border-primary/45 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <PlusCircle size={13} /> Add Custom Item
                            </button>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* RIGHT COLUMN: Print-Ready Live Preview Container with Zoom Controls */}
        <div
          className={`space-y-4 ${
            viewMode === 'edit' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Zoom controls & Undo/Redo buttons toolbar */}
          <div className="flex justify-between items-center bg-card border border-border/40 rounded-xl p-3 shadow-sm no-print">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleUndo}
                disabled={pastHistory.length === 0}
                className="px-2.5 py-1 bg-secondary text-foreground text-[10px] font-bold uppercase rounded-lg hover:bg-secondary/80 disabled:opacity-50"
              >
                Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={futureHistory.length === 0}
                className="px-2.5 py-1 bg-secondary text-foreground text-[10px] font-bold uppercase rounded-lg hover:bg-secondary/80 disabled:opacity-50"
              >
                Redo
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomScale(Math.max(50, zoomScale - 10))}
                className="h-7 w-7 bg-secondary flex items-center justify-center rounded-lg text-foreground hover:bg-secondary/80 font-bold"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-xs font-mono font-bold">{zoomScale}%</span>
              <button
                onClick={() => setZoomScale(Math.min(150, zoomScale + 10))}
                className="h-7 w-7 bg-secondary flex items-center justify-center rounded-lg text-foreground hover:bg-secondary/80 font-bold"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoomScale(100)}
                className="px-2 py-1 bg-secondary text-xs rounded-lg text-foreground hover:bg-secondary/80"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-secondary shadow-lg bg-white relative">
            <div
              className="bg-white p-8 text-black aspect-[1/1.414] font-sans printable-sheet"
              style={{
                fontFamily: themeState.font === 'Merriweather' ? 'Georgia, serif' : themeState.font === 'Fira Code' ? 'monospace' : 'Arial, sans-serif',
                fontSize: `${themeState.fontSize}px`,
                lineHeight: themeState.spacing === 1 ? '1.15' : themeState.spacing === 2 ? '1.4' : '1.6',
                transform: `scale(${zoomScale / 100})`,
                transformOrigin: 'top center',
              }}
            >
          {/* Layout templates */}
          {themeState.template === 'Modern' && (
            <div className="grid grid-cols-3 gap-6 h-full items-start">
              {/* Left col */}
              <div className="col-span-1 border-r border-gray-200 pr-4 space-y-4 h-full">
                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold tracking-tight uppercase" style={{ color: themeState.accentColor }}>
                    {pSec.fullName || 'YOUR NAME'}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-semibold">{pSec.headline || 'Your Headline'}</p>
                </div>

                <div className="space-y-1 text-[9px] text-gray-600">
                  <span className="block truncate">{pSec.email || 'email@example.com'}</span>
                  <span className="block">{pSec.phone || '+1-234-567-890'}</span>
                  {pSec.city && <span className="block">{pSec.city}, {pSec.country}</span>}
                </div>

                {skillItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <span className="block text-[10px] font-bold uppercase tracking-wider">SKILLS</span>
                    <div className="flex flex-wrap gap-1">
                      {skillItems.map((sk: any, idx: number) => (
                        <span key={idx} className="bg-gray-100 text-gray-800 text-[9px] px-2 py-0.5 rounded font-medium">
                          {sk.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {langItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <span className="block text-[10px] font-bold uppercase tracking-wider">LANGUAGES</span>
                    <div className="space-y-1">
                      {langItems.map((lang: any, idx: number) => (
                        <div key={idx} className="text-[9px] text-gray-700 flex justify-between">
                          <span className="font-semibold">{lang.name}</span>
                          <span className="text-gray-500">{lang.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {interestItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <span className="block text-[10px] font-bold uppercase tracking-wider">INTERESTS</span>
                    <div className="flex flex-wrap gap-1">
                      {interestItems.map((interest: any, idx: number) => (
                        <span key={idx} className="bg-gray-50 text-gray-700 text-[9px] px-2 py-0.5 rounded border border-gray-100">
                          {interest.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {certItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <span className="block text-[10px] font-bold uppercase tracking-wider">CERTIFICATIONS</span>
                    <div className="space-y-1.5">
                      {certItems.map((cert: any, idx: number) => (
                        <div key={idx} className="text-[9px] text-gray-700">
                          <div className="font-semibold leading-tight">{cert.title}</div>
                          <div className="text-gray-500 text-[8px]">{cert.issuer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right col */}
              <div className="col-span-2 space-y-5">
                {sSec.text && (
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: themeState.accentColor }}>SUMMARY</h3>
                    <p className="text-[10px] text-gray-700 leading-normal">{sSec.text}</p>
                  </div>
                )}

                {expItems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: themeState.accentColor }}>EXPERIENCE</h3>
                    {expItems.map((exp: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold">{exp.position} at {exp.company}</span>
                          <span className="text-gray-500 text-[9px]">{exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                        </div>
                        {exp.description && <p className="text-[9px] text-gray-600 leading-normal whitespace-pre-line">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {eduItems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: themeState.accentColor }}>EDUCATION</h3>
                    {eduItems.map((edu: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold">{edu.degree} in {edu.branch || 'Specialization'}</span>
                          <span className="text-gray-500 text-[9px]">{edu.startYear} - {edu.endYear}</span>
                        </div>
                        <p className="text-[9px] text-gray-600">{edu.college} {edu.cgpa ? `• GPA: ${edu.cgpa}` : ''}</p>
                      </div>
                    ))}
                  </div>
                )}

                {projItems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: themeState.accentColor }}>PROJECTS</h3>
                    {projItems.map((proj: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold">{proj.title} {proj.role ? `(${proj.role})` : ''}</span>
                          {proj.githubUrl && <span className="text-gray-500 text-[9px]">{proj.githubUrl}</span>}
                        </div>
                        {proj.description && <p className="text-[9px] text-gray-600 leading-normal whitespace-pre-line">{proj.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {achItems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: themeState.accentColor }}>ACHIEVEMENTS</h3>
                    {achItems.map((ach: any, idx: number) => (
                      <div key={idx} className="space-y-1 text-[9px]">
                        <div className="flex justify-between items-center font-bold text-gray-800">
                          <span>{ach.title}</span>
                          {ach.date && <span className="text-gray-500 text-[8px] font-normal">{ach.date}</span>}
                        </div>
                        {ach.description && <p className="text-gray-600 leading-normal">{ach.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {customSec.items && customSec.items.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: themeState.accentColor }}>{customSec.title || 'ADDITIONAL'}</h3>
                    <div className="grid grid-cols-2 gap-3 text-[9px]">
                      {customSec.items.map((item: any, idx: number) => (
                        <div key={idx} className="space-y-0.5">
                          <span className="font-bold text-gray-800 block">{item.label}</span>
                          <span className="text-gray-600 block">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {themeState.template !== 'Modern' && (
            <div className="space-y-5 items-start">
              {/* Center layout template */}
              <div className="text-center space-y-1.5 border-b border-gray-200 pb-3">
                <h2 className="text-base font-extrabold tracking-tight uppercase" style={{ color: themeState.accentColor }}>
                  {pSec.fullName || 'YOUR NAME'}
                </h2>
                <p className="text-[11px] text-gray-500 font-semibold">{pSec.headline || 'Your Headline'}</p>
                <div className="flex justify-center gap-3 text-[9px] text-gray-600 flex-wrap">
                  <span>{pSec.email || 'email@example.com'}</span>
                  <span>•</span>
                  <span>{pSec.phone || '+1-234-567-890'}</span>
                  {pSec.city && (
                    <>
                      <span>•</span>
                      <span>{pSec.city}, {pSec.country}</span>
                    </>
                  )}
                </div>
              </div>

              {sSec.text && (
                <div className="space-y-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    SUMMARY
                  </h3>
                  <p className="text-[10px] text-gray-700 leading-normal">{sSec.text}</p>
                </div>
              )}

              {expItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    EXPERIENCE
                  </h3>
                  {expItems.map((exp: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold">{exp.position} at {exp.company}</span>
                        <span className="text-gray-500 text-[9px]">{exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                      </div>
                      {exp.description && <p className="text-[9px] text-gray-600 leading-normal whitespace-pre-line">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {eduItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    EDUCATION
                  </h3>
                  {eduItems.map((edu: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold">{edu.degree} {edu.branch ? `in ${edu.branch}` : ''}</span>
                        <span className="text-gray-500 text-[9px]">{edu.startYear} - {edu.endYear}</span>
                      </div>
                      <p className="text-[9px] text-gray-600">{edu.college} {edu.cgpa ? `• GPA: ${edu.cgpa}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}

              {skillItems.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    SKILLS
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skillItems.map((sk: any, idx: number) => (
                      <span key={idx} className="text-[9px] font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {projItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    PROJECTS
                  </h3>
                  {projItems.map((proj: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold">{proj.title} {proj.role ? `(${proj.role})` : ''}</span>
                        {proj.githubUrl && <span className="text-gray-500 text-[9px]">{proj.githubUrl}</span>}
                      </div>
                      {proj.description && <p className="text-[9px] text-gray-600 leading-normal whitespace-pre-line">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {certItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    CERTIFICATIONS
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-[9px]">
                    {certItems.map((cert: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="font-bold text-gray-850 block">{cert.title}</span>
                        <span className="text-gray-500 block">{cert.issuer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {achItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    ACHIEVEMENTS
                  </h3>
                  {achItems.map((ach: any, idx: number) => (
                    <div key={idx} className="space-y-1 text-[9px]">
                      <div className="flex justify-between items-center font-bold text-gray-800">
                        <span>{ach.title}</span>
                        {ach.date && <span className="text-gray-500 text-[8px] font-normal">{ach.date}</span>}
                      </div>
                      {ach.description && <p className="text-gray-600 leading-normal">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {langItems.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    LANGUAGES
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {langItems.map((lang: any, idx: number) => (
                      <span key={idx} className="text-[9px] font-medium text-gray-800">
                        {lang.name} ({lang.level})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {interestItems.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    INTERESTS
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {interestItems.map((interest: any, idx: number) => (
                      <span key={idx} className="text-[9px] font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-100">
                        {interest.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {customSec.items && customSec.items.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-0.5" style={{ color: themeState.accentColor }}>
                    {customSec.title || 'ADDITIONAL'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-[9px]">
                    {customSec.items.map((item: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="font-bold text-gray-800 block">{item.label}</span>
                        <span className="text-gray-600 block">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>

      {/* --- IMPORT PROFILE DIALOG MODAL --- */}
      {importOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">Import Profile Credentials</h3>
              <button onClick={() => setImportOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Select which sections to auto-fill from your professional profile. Existing details in selected sections will be overwritten.
            </p>

            <div className="space-y-2">
              {['personal', 'summary', 'education', 'experience', 'skills', 'certifications', 'achievements'].map((sec) => (
                <div key={sec} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`import_${sec}`}
                    checked={importSections.includes(sec)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setImportSections([...importSections, sec]);
                      } else {
                        setImportSections(importSections.filter((s) => s !== sec));
                      }
                    }}
                  />
                  <label htmlFor={`import_${sec}`} className="text-xs font-semibold text-foreground uppercase">
                    {sec}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => importProfileMutation.mutate({ sections: importSections })}
                disabled={importProfileMutation.isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
              >
                {importProfileMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                <span>Overwrite Selected</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
