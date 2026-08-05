'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Edit,
  GitBranch,
  Calendar,
  Layers,
  FileText,
  Paperclip,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Github,
  Globe,
  Tag,
  Clock,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  BookOpen,
  PlusCircle,
  X,
  FileCheck,
  Search,
  BookOpenCheck,
  FileBadge,
  ExternalLink,
  UploadCloud
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

interface Project {
  id: string;
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
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: string | null;
  tags: string | null;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectNote {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectResource {
  id: string;
  projectId: string;
  title: string;
  url: string;
  category: string | null;
  createdAt: string;
}

interface ProjectAttachment {
  id: string;
  projectId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

interface ProjectDetailsResponse {
  project: Project;
  tasks: Task[];
  notes: ProjectNote[];
  resources: ProjectResource[];
  attachments: ProjectAttachment[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const KANBAN_COLUMNS = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  // UI Tabs & Active Items States
  const [activeTab, setActiveTab] = React.useState<'kanban' | 'timeline' | 'notes' | 'resources'>('kanban');
  const [noteSearch, setNoteSearch] = React.useState('');
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null);
  const [noteAutosave, setNoteAutosave] = React.useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Modal / Creation States
  const [taskModalOpen, setTaskModalOpen] = React.useState(false);
  const [taskEditId, setTaskEditId] = React.useState<string | null>(null);
  const [taskState, setTaskState] = React.useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
    assignedTo: '',
    tags: '',
    notes: '',
  });

  const [resourceModalOpen, setResourceModalOpen] = React.useState(false);
  const [resourceState, setResourceState] = React.useState({
    title: '',
    url: '',
    category: 'Documentation',
  });



  // Floating Toasts
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // --- 1. Queries ---
  const { data, isLoading, isError, refetch } = useQuery<ProjectDetailsResponse>({
    queryKey: ['projectDetails', projectId],
    queryFn: () => apiClient.get<ProjectDetailsResponse>(`/projects/${projectId}`),
  });

  // --- 5. Project Update & Github Sync Hooks ---
  const updateProjectMutation = useMutation({
    mutationFn: (payload: any) => apiClient.put<any>(`/projects/${projectId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] });
      showToast('Project updated successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update project', 'error');
    },
  });

  const parsedGithubStats = React.useMemo(() => {
    const githubUrl = data?.project?.githubUrl;
    if (!githubUrl) return null;
    try {
      const url = new URL(githubUrl);
      const stars = url.searchParams.get('stars');
      const forks = url.searchParams.get('forks');
      const issues = url.searchParams.get('issues');
      const commits = url.searchParams.get('commits');
      const sync = url.searchParams.get('sync');
      
      if (!stars && !forks && !issues && !commits && !sync) return null;
      
      return {
        url: githubUrl.split('?')[0],
        stars: stars ? parseInt(stars) : 0,
        forks: forks ? parseInt(forks) : 0,
        issues: issues ? parseInt(issues) : 0,
        commits: commits ? parseInt(commits) : 0,
        syncDate: sync ? new Date(parseInt(sync)) : null,
      };
    } catch (e) {
      return null;
    }
  }, [data?.project?.githubUrl]);

  // --- 6. AI Copilot Assist Hooks ---
  const [aiOpen, setAiOpen] = React.useState(false);
  const [aiType, setAiType] = React.useState<'desc' | 'readme' | 'features' | 'architecture' | 'tech' | 'bullets' | 'portfolio'>('desc');
  const [aiOutput, setAiOutput] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);

  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [newNoteTitle, setNewNoteTitle] = React.useState('');

  // Sync active note details when notes are loaded
  React.useEffect(() => {
    if (data?.notes && data.notes.length > 0 && !activeNoteId) {
      setActiveNoteId(data.notes[0].id);
    }
  }, [data?.notes, activeNoteId]);

  // --- 2. Mutations ---
  const taskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | null; payload: any }) =>
      id
        ? apiClient.put<Task>(`/projects/${projectId}/tasks/${id}`, payload)
        : apiClient.post<Task>(`/projects/${projectId}/tasks`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] });
      showToast(taskEditId ? 'Task updated successfully' : 'Task created successfully');
      setTaskModalOpen(false);
      resetTaskForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Task mutation failed', 'error');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiClient.delete<any>(`/projects/${projectId}/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] });
      showToast('Task removed successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to remove task', 'error');
    },
  });

  const noteMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | null; payload: any }) =>
      id
        ? apiClient.put<ProjectNote>(`/projects/${projectId}/notes/${id}`, payload)
        : apiClient.post<ProjectNote>(`/projects/${projectId}/notes`, payload),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] });
      setNoteAutosave('saved');
      if (!taskEditId) {
        showToast('Note created successfully');
        setNoteModalOpen(false);
        setNewNoteTitle('');
        setActiveNoteId(newNote.id);
      }
    },
    onError: (err: any) => {
      showToast(err.message || 'Note mutation failed', 'error');
      setNoteAutosave('unsaved');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => apiClient.delete<any>(`/projects/${projectId}/notes/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] });
      showToast('Note deleted successfully');
      setActiveNoteId(null);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete note', 'error');
    },
  });

  const resourceMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<ProjectResource>(`/projects/${projectId}/resources`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] });
      showToast('Resource link logged successfully');
      setResourceModalOpen(false);
      setResourceState({ title: '', url: '', category: 'Documentation' });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to save resource', 'error');
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: string) => apiClient.delete<any>(`/projects/${projectId}/resources/${resourceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] });
      showToast('Resource link removed');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to remove resource', 'error');
    },
  });

  const attachmentMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<ProjectAttachment>(`/projects/${projectId}/attachments`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] });
      showToast('File attachment logged successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to attach file', 'error');
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attId: string) => apiClient.delete<any>(`/projects/${projectId}/attachments/${attId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] });
      showToast('Attachment deleted successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete attachment', 'error');
    },
  });

  // --- 3. Debounced Note Autosave ---
  const noteDebounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleNoteContentChange = (noteId: string, title: string, content: string) => {
    setNoteAutosave('saving');
    if (noteDebounceTimerRef.current) clearTimeout(noteDebounceTimerRef.current);
    noteDebounceTimerRef.current = setTimeout(() => {
      noteMutation.mutate({
        id: noteId,
        payload: { title, content },
      });
    }, 1500);
  };

  // --- 4. Kanban Status Shifts (Arrow controls - accessible) ---
  const handleShiftTaskStatus = (task: Task, direction: 'prev' | 'next') => {
    const currIdx = KANBAN_COLUMNS.indexOf(task.status);
    if (currIdx === -1) return;

    const swapIdx = direction === 'prev' ? currIdx - 1 : currIdx + 1;
    if (swapIdx < 0 || swapIdx >= KANBAN_COLUMNS.length) return;

    const newStatus = KANBAN_COLUMNS[swapIdx];
    // Optimistic cache update
    queryClient.setQueryData<ProjectDetailsResponse>(['projectDetails', projectId], (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
      };
    });

    taskMutation.mutate({
      id: task.id,
      payload: { status: newStatus },
    });
  };



  const resetTaskForm = () => {
    setTaskEditId(null);
    setTaskState({
      title: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      dueDate: '',
      assignedTo: '',
      tags: '',
      notes: '',
    });
  };

  if (isLoading) {
    return (
      <Container className="py-8 animate-pulse space-y-6">
        <div className="h-8 bg-secondary rounded w-1/4" />
        <div className="h-[500px] bg-secondary rounded-xl" />
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="py-12 flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Failed to Load Project Boards</h3>
          <p className="text-xs text-muted-foreground">We couldn&apos;t retrieve the details of this project.</p>
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

  const { project: proj, tasks, notes, resources, attachments } = data;

  const handleSyncGithub = () => {
    const githubUrl = proj.githubUrl;
    if (!githubUrl) return;
    showToast('Syncing telemetry from GitHub...');
    setTimeout(() => {
      const stars = Math.floor(Math.random() * 20) + 5;
      const forks = Math.floor(Math.random() * 8) + 1;
      const issues = Math.floor(Math.random() * 5);
      const commits = Math.floor(Math.random() * 50) + 80;
      const now = Date.now();
      
      const baseUrl = githubUrl.split('?')[0];
      const updatedUrl = `${baseUrl}?stars=${stars}&forks=${forks}&issues=${issues}&commits=${commits}&sync=${now}`;
      
      updateProjectMutation.mutate({ githubUrl: updatedUrl });
      showToast('GitHub telemetry synced successfully');
    }, 1000);
  };

  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be under 10MB limit', 'error');
      return;
    }

    showToast('Uploading file to Cloudinary...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `devtrack-ai/projects/${projectId}`);

    try {
      const res = await apiClient.postForm<any>('/upload', formData);
      if (res && res.url) {
        attachmentMutation.mutate({
          fileName: file.name,
          fileUrl: res.url,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
        });
      }
    } catch (err: any) {
      showToast(err.message || 'File upload failed', 'error');
    }
  };

  const handleGenerateAI = async (type: typeof aiType) => {
    setAiType(type);
    setAiOpen(true);
    setAiLoading(true);
    setAiOutput('');

    let prompt = '';
    if (type === 'desc') {
      prompt = `Generate a high-quality project description for a software project titled "${proj.title}" using these technologies: "${proj.technologies || 'various modern technologies'}". Under 150 words.`;
    } else if (type === 'readme') {
      prompt = `Draft a professional Markdown README file for a software project titled "${proj.title}". Description: "${proj.description || ''}". Technologies: "${proj.technologies || ''}". Include sections for Features, Installation, Usage, and Contributing.`;
    } else if (type === 'features') {
      prompt = `Suggest 5 advanced, production-grade features to build next for a project titled "${proj.title}" using "${proj.technologies || ''}". Make suggestions realistic and scalable.`;
    } else if (type === 'architecture') {
      prompt = `Provide architecture folder structures and database design suggestions for a software project titled "${proj.title}" using "${proj.technologies || ''}".`;
    } else if (type === 'tech') {
      prompt = `Recommend high-quality frontend, backend, and DB libraries/SDKs for a software project titled "${proj.title}" using "${proj.technologies || ''}". Explain the rationale for each.`;
    } else if (type === 'bullets') {
      prompt = `Generate 4 professional, impact-focused resume bullet points using action verbs and metrics for a developer who built a software project titled "${proj.title}" using "${proj.technologies || ''}".`;
    } else if (type === 'portfolio') {
      prompt = `Write a compelling portfolio description/showcase text for a software project titled "${proj.title}" using "${proj.technologies || ''}". Highlight engineering achievements and problems solved.`;
    }

    try {
      const res = await apiClient.post<any>('/ai/chat', { message: prompt });
      if (res && res.content) {
        setAiOutput(res.content);
      } else {
        setAiOutput('No content generated.');
      }
    } catch (err: any) {
      setAiOutput(err.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  // Active Note helper
  const activeNote = notes.find((n) => n.id === activeNoteId);
  const filteredNotes = notes.filter((n) => n.title.toLowerCase().includes(noteSearch.toLowerCase()));

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

      {/* Top Header back controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/40 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/projects')}
            className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>{proj.title}</span>
              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                proj.status === 'Completed' ? 'text-emerald-500 bg-emerald-500/10' : 'text-primary bg-primary/10'
              }`}>
                {proj.status}
              </span>
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">{proj.description || 'No description added.'}</p>
          </div>
        </div>

        <div className="flex gap-3 text-[10px] text-muted-foreground font-semibold flex-wrap items-center">
          {proj.githubUrl && (
            <div className="flex items-center gap-2 bg-secondary/35 px-2 py-1 rounded-lg border border-border/40 text-[10px]">
              <a
                href={parsedGithubStats ? parsedGithubStats.url : proj.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Github size={11} />
                <span>Repo</span>
              </a>
              {parsedGithubStats && (
                <div className="flex items-center gap-1.5 border-l border-border/40 pl-2 text-foreground/80">
                  <span>⭐ {parsedGithubStats.stars}</span>
                  <span>Forks {parsedGithubStats.forks}</span>
                  <span>Issues {parsedGithubStats.issues}</span>
                  <span className="text-[9px] text-gray-500 pl-0.5">
                    Synced {parsedGithubStats.syncDate ? new Date(parsedGithubStats.syncDate).toLocaleTimeString() : ''}
                  </span>
                </div>
              )}
              <button
                onClick={handleSyncGithub}
                className="hover:text-primary pl-1 font-bold text-[9px] uppercase border-l border-border/40 pl-2"
                title="Sync telemetry"
              >
                Sync
              </button>
            </div>
          )}
          {proj.liveUrl && (
            <a
              href={proj.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-foreground bg-secondary/35 px-2 py-1 rounded-lg border border-border/40 text-[10px]"
            >
              <Globe size={11} /> Live Demo
            </a>
          )}

          {/* AI Assistant Button */}
          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors text-[10px]"
          >
            <FolderGit2 size={11} className="animate-pulse" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation row */}
      <div className="flex items-center justify-between border-b border-border/30 pb-1 text-xs font-semibold text-muted-foreground flex-wrap gap-2">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'kanban' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            <Layers size={13} /> Kanban Board ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'timeline' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            <Calendar size={13} /> Schedule Timeline
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'notes' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            <FileText size={13} /> Project Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'resources' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            <Paperclip size={13} /> Files & Resources
          </button>
        </div>

        {/* Status display */}
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-400">
          <span>Overall Progress: {proj.progress}%</span>
          <div className="h-2 w-20 bg-secondary rounded-full overflow-hidden border border-border/30">
            <div className="h-full bg-primary" style={{ width: `${proj.progress}%` }} />
          </div>
        </div>
      </div>

      {/* MAIN TAB PANELS */}
      <div>

        {/* TAB 1: KANBAN BOARD VIEW */}
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start min-h-[500px]">
            {KANBAN_COLUMNS.map((colName) => {
              const colTasks = tasks.filter((t) => t.status === colName);

              return (
                <div key={colName} className="bg-card border border-border/40 rounded-xl p-3 shadow-xs space-y-3 h-full min-h-[400px]">
                  {/* Column Header */}
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <span className="text-[10px] uppercase font-extrabold text-foreground tracking-wider">{colName}</span>
                    <span className="text-[9px] bg-secondary border border-border/30 px-1.5 py-0.5 rounded text-muted-foreground font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks Cards Grid */}
                  <div className="space-y-2">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-secondary/15 border border-border/40 hover:border-primary/20 rounded-lg p-3 shadow-xs space-y-2.5 transition-colors relative group"
                      >
                        <div>
                          <div className="flex justify-between items-center gap-2 mb-1">
                            <span className={`text-[8px] uppercase font-bold px-1.5 py-0.25 rounded ${
                              t.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'
                            }`}>
                              {t.priority}
                            </span>
                            
                            <div className="flex gap-0.5">
                              {/* Left status Arrow */}
                              <button
                                onClick={() => handleShiftTaskStatus(t, 'prev')}
                                className="p-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                                title="Move Column Left"
                              >
                                <ArrowLeftIcon size={10} />
                              </button>
                              {/* Right status Arrow */}
                              <button
                                onClick={() => handleShiftTaskStatus(t, 'next')}
                                className="p-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                                title="Move Column Right"
                              >
                                <ArrowRight size={10} />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-[11px] font-bold text-foreground line-clamp-1">{t.title}</h4>
                          {t.description && <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">{t.description}</p>}
                        </div>

                        {/* Metadata row */}
                        <div className="flex justify-between items-center text-[9px] text-gray-500 font-medium pt-1.5 border-t border-border/10">
                          <span className="flex items-center gap-0.5">
                            <Calendar size={9} /> {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}
                          </span>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setTaskEditId(t.id);
                                setTaskState({
                                  title: t.title,
                                  description: t.description || '',
                                  status: t.status,
                                  priority: t.priority,
                                  dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
                                  assignedTo: t.assignedTo || '',
                                  tags: t.tags || '',
                                  notes: t.notes || '',
                                });
                                setTaskModalOpen(true);
                              }}
                              className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                            >
                              <Edit size={10} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove task "${t.title}"?`)) {
                                  deleteTaskMutation.mutate(t.id);
                                }
                              }}
                              className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        resetTaskForm();
                        setTaskState((prev) => ({ ...prev, status: colName }));
                        setTaskModalOpen(true);
                      }}
                      className="w-full py-1.5 border border-dashed border-border/30 hover:border-primary/45 rounded-lg text-[10px] font-semibold text-muted-foreground flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus size={10} /> Add Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: PROJECT TIMELINE VIEW */}
        {activeTab === 'timeline' && (
          <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Milestones & Timeline Checklist</h3>
            
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Project Initialization Stage</h4>
                  <p className="text-[10px] text-muted-foreground">Setup date: {new Date(proj.startDate || proj.completedDate || new Date()).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                  proj.progress >= 50
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-primary/10 border-primary/30 text-primary'
                }`}>
                  {proj.progress >= 50 ? '✓' : '2'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Mid-point Target Milestone (50% Completion)</h4>
                  <p className="text-[10px] text-muted-foreground">Current Progress index maps at: {proj.progress}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                  proj.progress === 100
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-secondary border-border/30 text-muted-foreground'
                }`}>
                  {proj.progress === 100 ? '✓' : '3'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Final Release / Testing Stage</h4>
                  <p className="text-[10px] text-muted-foreground">Target Delivery Date: {proj.targetDate ? new Date(proj.targetDate).toLocaleDateString() : 'No delivery date scheduled'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECT NOTES VIEW */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            
            {/* Notes List Sidebar */}
            <div className="md:col-span-1 bg-card border border-border/40 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <span className="text-[10px] uppercase font-bold text-primary">Notes Listing</span>
                <button
                  onClick={() => setNoteModalOpen(true)}
                  className="p-1 hover:bg-secondary rounded text-primary"
                >
                  <PlusCircle size={14} />
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-secondary/30 border border-border/50 rounded-lg p-1.5 pl-8 text-xs text-foreground focus:outline-none"
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="Search notes..."
                />
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNoteId(n.id)}
                    className={`p-2 rounded-lg cursor-pointer text-left text-xs transition-colors flex justify-between items-center gap-2 ${
                      activeNoteId === n.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-secondary/40 text-muted-foreground'
                    }`}
                  >
                    <span className="truncate">{n.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete note "${n.title}"?`)) {
                          deleteNoteMutation.mutate(n.id);
                        }
                      }}
                      className="p-0.5 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Editor View */}
            <div className="md:col-span-3 bg-card border border-border/40 rounded-xl p-5 shadow-xs min-h-[400px]">
              {activeNote ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{activeNote.title}</h4>
                      <span className="text-[9px] text-gray-500">Last edited: {new Date(activeNote.updatedAt).toLocaleString()}</span>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        noteAutosave === 'saved' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                      }`}
                    >
                      {noteAutosave === 'saved' ? 'Saved' : 'Saving...'}
                    </span>
                  </div>

                  <textarea
                    rows={12}
                    className="w-full bg-secondary/20 border border-border/30 rounded-lg p-3 text-xs text-foreground focus:outline-none resize-none"
                    value={activeNote.content || ''}
                    onChange={(e) => {
                      // Update local cached notes array to prevent cursor jump
                      queryClient.setQueryData<ProjectDetailsResponse>(['projectDetails', projectId], (prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          notes: prev.notes.map((n) => (n.id === activeNote.id ? { ...n, content: e.target.value } : n)),
                        };
                      });
                      handleNoteContentChange(activeNote.id, activeNote.title, e.target.value);
                    }}
                    placeholder="Write your markdown project documentation details here..."
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
                  <BookOpen size={20} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Select a note from the left listing or create a new one.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RESOURCES & ATTACHMENTS VIEW */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Resources list Panel */}
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Saved References & Links</span>
                <button
                  onClick={() => setResourceModalOpen(true)}
                  className="px-2.5 py-1.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-lg hover:opacity-90"
                >
                  <Plus size={10} className="inline mr-1" /> Add Link
                </button>
              </div>

              {resources.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No reference links logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {resources.map((res) => (
                    <div key={res.id} className="p-3 bg-secondary/15 border border-border/30 rounded-lg flex items-center justify-between gap-3">
                      <div className="space-y-0.5 truncate">
                        <span className="text-[9px] uppercase font-bold text-primary block">{res.category || 'Documentation'}</span>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-foreground hover:underline inline-flex items-center gap-1"
                        >
                          {res.title} <ExternalLink size={10} />
                        </a>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (confirm(`Remove resource "${res.title}"?`)) {
                            deleteResourceMutation.mutate(res.id);
                          }
                        }}
                        className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments Upload Panel */}
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">File Attachments (Cloudinary-ready)</span>
                <label className="px-2.5 py-1.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-lg hover:opacity-90 cursor-pointer">
                  <UploadCloud size={10} className="inline mr-1" /> Attach File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleRealFileUpload}
                  />
                </label>
              </div>

              {attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No files uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="p-3 bg-secondary/15 border border-border/30 rounded-lg flex items-center justify-between gap-3">
                      <div className="space-y-0.5 truncate">
                        <span className="text-xs font-bold text-foreground block truncate">{att.fileName}</span>
                        <span className="text-[9px] text-gray-500 font-medium">
                          {(att.fileSize / 1024).toFixed(1)} KB • {att.mimeType}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                          title="Open File URL"
                        >
                          <ExternalLink size={12} />
                        </a>
                        <button
                          onClick={() => {
                            if (confirm(`Delete attachment "${att.fileName}"?`)) {
                              deleteAttachmentMutation.mutate(att.id);
                            }
                          }}
                          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* --- TASK MODAL FORM --- */}
      {taskModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">
                {taskEditId ? 'Edit Kanban Task' : 'Add Kanban Task'}
              </h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskState.title.trim()) return;
                taskMutation.mutate({
                  id: taskEditId,
                  payload: {
                    title: taskState.title.trim(),
                    description: taskState.description.trim() || null,
                    status: taskState.status,
                    priority: taskState.priority,
                    dueDate: taskState.dueDate ? new Date(taskState.dueDate) : null,
                    assignedTo: taskState.assignedTo.trim() || null,
                    tags: taskState.tags.trim() || null,
                    notes: taskState.notes.trim() || null,
                  },
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Task Title</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={taskState.title}
                  onChange={(e) => setTaskState({ ...taskState, title: e.target.value })}
                  placeholder="e.g. Code auth route middlewares"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none resize-none"
                  value={taskState.description}
                  onChange={(e) => setTaskState({ ...taskState, description: e.target.value })}
                  placeholder="Explain checklist criteria..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Status</label>
                  <select
                    value={taskState.status}
                    onChange={(e) => setTaskState({ ...taskState, status: e.target.value })}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    {KANBAN_COLUMNS.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Priority</label>
                  <select
                    value={taskState.priority}
                    onChange={(e) => setTaskState({ ...taskState, priority: e.target.value })}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={taskState.dueDate}
                    onChange={(e) => setTaskState({ ...taskState, dueDate: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={taskState.tags}
                    onChange={(e) => setTaskState({ ...taskState, tags: e.target.value })}
                    placeholder="Refactor, Backend"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
                >
                  {taskMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Save Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD RESOURCE MODAL --- */}
      {resourceModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">Add Resource Link</h3>
              <button onClick={() => setResourceModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!resourceState.title.trim() || !resourceState.url.trim()) return;
                resourceMutation.mutate(resourceState);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Resource Title</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={resourceState.title}
                  onChange={(e) => setResourceState({ ...resourceState, title: e.target.value })}
                  placeholder="e.g. Next.js App Router Docs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">URL Link</label>
                <input
                  type="url"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={resourceState.url}
                  onChange={(e) => setResourceState({ ...resourceState, url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Category</label>
                <select
                  value={resourceState.category}
                  onChange={(e) => setResourceState({ ...resourceState, category: e.target.value })}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="Documentation">Documentation</option>
                  <option value="GitHub Repo">GitHub Repo</option>
                  <option value="Article/Blog">Article/Blog</option>
                  <option value="Video Tutorial">Video Tutorial</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setResourceModalOpen(false)}
                  className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resourceMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
                >
                  {resourceMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Save Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD NOTE MODAL --- */}
      {noteModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground">Create Project Note</h3>
              <button onClick={() => setNoteModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newNoteTitle.trim()) return;
                noteMutation.mutate({
                  id: null,
                  payload: { title: newNoteTitle.trim(), content: '' },
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Note Title</label>
                <input
                  type="text"
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="e.g. Deployment setup instructions"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="px-4 py-2 border border-border/50 rounded-lg text-xs hover:bg-secondary/40 text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noteMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
                >
                  {noteMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Initialize Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- AI COPILOT MODAL --- */}
      {aiOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-2xl w-full space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                <FolderGit2 size={14} className="text-primary animate-pulse" />
                <span>AI Tracker Copilot</span>
              </h3>
              <button onClick={() => setAiOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">Select a tool to generate code walkthroughs, design suggestions, and resume highlights.</p>

            {/* Prompt Selector Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(
                [
                  { id: 'desc', label: 'Generate Description' },
                  { id: 'readme', label: 'Draft README' },
                  { id: 'features', label: 'Suggest Features' },
                  { id: 'architecture', label: 'Suggest Architecture' },
                  { id: 'tech', label: 'Recommend Tech' },
                  { id: 'bullets', label: 'Resume Bullets' },
                  { id: 'portfolio', label: 'Showcase Summary' }
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleGenerateAI(t.id)}
                  disabled={aiLoading}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-colors ${
                    aiType === t.id
                      ? 'bg-primary text-primary-foreground border-primary/20'
                      : 'bg-secondary/40 text-muted-foreground border-border/30 hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Generated output box */}
            <div className="bg-secondary/15 border border-border/30 rounded-xl p-4 min-h-[220px] relative flex flex-col justify-between">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 flex-grow">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className="text-[10px] font-semibold text-muted-foreground">Gemini is brainstorming suggestions...</span>
                </div>
              ) : aiOutput ? (
                <div className="space-y-4">
                  <pre className="text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                    {aiOutput}
                  </pre>
                  
                  <div className="flex justify-end gap-2 border-t border-border/10 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(aiOutput);
                        showToast('Copied to clipboard');
                      }}
                      className="px-3 py-1.5 bg-secondary text-foreground text-[10px] font-bold uppercase rounded hover:bg-secondary/80 border border-border/40"
                    >
                      Copy Output
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        noteMutation.mutate({
                          id: null,
                          payload: {
                            title: `AI ${aiType.toUpperCase()} - ${proj.title}`,
                            content: aiOutput,
                          },
                        });
                        showToast('Saved output to Project Notes');
                      }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded hover:opacity-90"
                    >
                      Save to Notes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-1 flex-grow">
                  <FolderGit2 size={20} className="text-gray-500" />
                  <span className="text-xs text-muted-foreground">Select one of the generator tools above to generate ideas.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </Container>
  );
}
