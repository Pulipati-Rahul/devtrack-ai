'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  UploadCloud,
  FileText,
  Briefcase,
  Layers,
  Star,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Loader2,
  Trash2,
  GitCompare,
  PlusCircle,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

interface ResumeListItem {
  id: string;
  name: string;
}

interface ATSStats {
  avgScore: number;
  bestScore: number;
  totalCount: number;
}

interface Suggestion {
  category: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects';
  priority: 'high' | 'medium' | 'low';
  severity: 'critical' | 'moderate' | 'minor';
  recommendation: string;
  before: string;
  after: string;
}

interface FeedbackReport {
  breakdown: {
    formatting: number;
    keywords: number;
    experience: number;
    skills: number;
    education: number;
    readability: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendedKeywords: string[];
  suggestions: Suggestion[];
  overallFeedback: string;
}

interface ATSReport {
  id: string;
  userId: string;
  resumeId: string | null;
  resumeName: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  atsScore: number;
  feedback: FeedbackReport;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function ATSPage() {
  const queryClient = useQueryClient();

  // Setup Form States
  const [resumeSource, setResumeSource] = React.useState<'builder' | 'manual'>('builder');
  const [selectedResumeId, setSelectedResumeId] = React.useState<string>('');
  const [manualResumeName, setManualResumeName] = React.useState<string>('');
  const [manualResumeText, setManualResumeText] = React.useState<string>('');
  
  const [jobTitle, setJobTitle] = React.useState<string>('');
  const [company, setCompany] = React.useState<string>('');
  const [jobDescription, setJobDescription] = React.useState<string>('');

  // Active Report Details View
  const [activeReportId, setActiveReportId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'revisions' | 'keywords' | 'breakdown'>('revisions');
  const [keywordFilter, setKeywordFilter] = React.useState<'matched' | 'missing' | 'recommended'>('missing');

  // Comparison Dialog States
  const [compareMode, setCompareMode] = React.useState(false);
  const [compareReportAId, setCompareReportAId] = React.useState<string>('');
  const [compareReportBId, setCompareReportBId] = React.useState<string>('');

  // File Upload states
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewResumeUrl, setPreviewResumeUrl] = React.useState<string | null>(null);

  // Job Description Templates
  const [jdTemplates, setJdTemplates] = React.useState<Array<{ id: string; title: string; desc: string }>>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('devtrack_jd_templates');
    if (saved) {
      try {
        setJdTemplates(JSON.parse(saved));
      } catch (e) {
        void e;
      }
    }
  }, []);

  const handleSaveJdTemplate = () => {
    if (!jobDescription.trim() || !jobTitle.trim()) {
      showToast('Target Title and Job Description are required to save a template', 'error');
      return;
    }
    const newTemplate = {
      id: Math.random().toString(36).substring(2, 9),
      title: `${jobTitle} @ ${company || 'General'}`,
      desc: jobDescription.trim(),
    };
    const updated = [...jdTemplates, newTemplate];
    setJdTemplates(updated);
    localStorage.setItem('devtrack_jd_templates', JSON.stringify(updated));
    showToast('Job Description template saved successfully');
  };

  const handleDeleteJdTemplate = (id: string) => {
    const updated = jdTemplates.filter((t) => t.id !== id);
    setJdTemplates(updated);
    localStorage.setItem('devtrack_jd_templates', JSON.stringify(updated));
    showToast('Job Description template deleted');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'resume' | 'jd') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be under 10MB', 'error');
      return;
    }

    setIsUploading(true);
    showToast('Uploading and parsing document...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.postForm<any>('/ats/upload', formData);
      if (res && res.text) {
        if (target === 'resume') {
          setManualResumeName(file.name);
          setManualResumeText(res.text);
          setPreviewResumeUrl(res.url);
          showToast('Resume uploaded and parsed successfully');
        } else {
          setJobDescription(res.text);
          showToast('Job Description uploaded and parsed successfully');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'File upload/parse failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportPDF = () => {
    if (!activeReport) return;
    window.print();
    showToast('Triggered PDF print export window');
  };

  const handleExportJSON = () => {
    if (!activeReport) return;
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats_report_${activeReport.jobTitle.replace(/\s+/g, '_')}.json`;
    a.click();
    showToast('Report exported as JSON');
  };

  // Loading Steps State
  const [analysisStep, setAnalysisStep] = React.useState<number>(0);

  // Floating Toasts
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // --- 1. Queries ---
  const { data: resumesList } = useQuery<ResumeListItem[]>({
    queryKey: ['resumesListForATS'],
    queryFn: () => apiClient.get<ResumeListItem[]>('/resumes'),
  });

  const { data: historyList, isLoading: isHistoryLoading, refetch: refetchHistory } = useQuery<ATSReport[]>({
    queryKey: ['atsHistoryList'],
    queryFn: () => apiClient.get<ATSReport[]>('/ats/history'),
  });

  const { data: statsData, refetch: refetchStats } = useQuery<ATSStats>({
    queryKey: ['atsOverviewStats'],
    queryFn: () => apiClient.get<ATSStats>('/ats/stats'),
  });

  // --- 2. Mutations ---
  const analyzeMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<ATSReport>('/ats/analyze', payload),
    onMutate: () => {
      setAnalysisStep(1);
      const steps = [
        'Reading resume parameters...',
        'Parsing job description tokens...',
        'Calling Google Gemini AI audit engines...',
        'Compiling scoring matrix suggestions...'
      ];
      // Increment step indicator sequentially
      let curr = 1;
      const interval = setInterval(() => {
        curr += 1;
        if (curr <= 4) setAnalysisStep(curr);
      }, 2000);
      return { interval };
    },
    onSuccess: (newReport, variables, context) => {
      if (context?.interval) clearInterval(context.interval);
      queryClient.invalidateQueries({ queryKey: ['atsHistoryList'] });
      queryClient.invalidateQueries({ queryKey: ['atsOverviewStats'] });
      showToast('ATS Compliance check completed successfully');
      setActiveReportId(newReport.id);
      setAnalysisStep(0);
      resetForm();
    },
    onError: (err: any, variables, context) => {
      if (context?.interval) clearInterval(context.interval);
      showToast(err.message || 'ATS Analysis failed', 'error');
      setAnalysisStep(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`/ats/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atsHistoryList'] });
      queryClient.invalidateQueries({ queryKey: ['atsOverviewStats'] });
      showToast('ATS Report log removed');
      if (activeReportId) setActiveReportId(null);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to remove ATS log', 'error');
    },
  });

  const resetForm = () => {
    setSelectedResumeId('');
    setManualResumeName('');
    setManualResumeText('');
    setJobTitle('');
    setCompany('');
    setJobDescription('');
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !company.trim() || !jobDescription.trim()) {
      showToast('Job Title, Company, and Job Description are required', 'error');
      return;
    }

    let resumeNamePayload = '';
    let rawTextPayload = '';

    if (resumeSource === 'builder') {
      if (!selectedResumeId) {
        showToast('Please select a builder resume', 'error');
        return;
      }
      const matched = resumesList?.find((r) => r.id === selectedResumeId);
      resumeNamePayload = matched?.name || 'DevTrack Resume';
      
      // Load details for that resume to generate text transcript
      try {
        setAnalysisStep(1);
        const details = await apiClient.get<any>(`/resumes/${selectedResumeId}`);
        const sections = details?.sections || [];
        // Construct clean text representation of the sections
        const blocks: string[] = [];
        sections.forEach((sec: any) => {
          if (!sec.visible || !sec.content) return;
          blocks.push(`Section: ${sec.sectionType.toUpperCase()}`);
          if (sec.sectionType === 'personal') {
            blocks.push(`Name: ${sec.content.fullName || ''}\nHeadline: ${sec.content.headline || ''}\nContacts: ${sec.content.email || ''} ${sec.content.phone || ''}`);
          } else if (sec.sectionType === 'summary') {
            blocks.push(sec.content.text || '');
          } else if (Array.isArray(sec.content)) {
            sec.content.forEach((item: any) => {
              blocks.push(JSON.stringify(item));
            });
          }
        });
        rawTextPayload = blocks.join('\n\n');
      } catch (err) {
        showToast('Failed to parse selected builder resume details', 'error');
        setAnalysisStep(0);
        return;
      }
    } else {
      if (!manualResumeName.trim() || !manualResumeText.trim()) {
        showToast('Resume Name and content details are required', 'error');
        return;
      }
      resumeNamePayload = manualResumeName.trim();
      rawTextPayload = manualResumeText.trim();
    }

    analyzeMutation.mutate({
      resumeId: resumeSource === 'builder' ? selectedResumeId : null,
      resumeName: resumeNamePayload,
      rawResumeText: rawTextPayload,
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      jobDescription: jobDescription.trim(),
    });
  };

  const activeReport = historyList?.find((r) => r.id === activeReportId);
  const compareReportA = historyList?.find((r) => r.id === compareReportAId);
  const compareReportB = historyList?.find((r) => r.id === compareReportBId);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/40 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">ATS Resume Analyzer</h1>
          <p className="text-xs text-muted-foreground">Compare your resumes against target JDs, check keyword matches, and review AI audit notes.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCompareMode(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <GitCompare size={14} />
            <span>Compare Resumes</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      {statsData && statsData.totalCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Average ATS Score</span>
              <h3 className="text-2xl font-bold text-foreground">{statsData.avgScore}%</h3>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Best ATS Score</span>
              <h3 className="text-2xl font-bold text-emerald-500">{statsData.bestScore}%</h3>
            </div>
            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
              <Star size={20} fill="currentColor" />
            </div>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Scans Run</span>
              <h3 className="text-2xl font-bold text-foreground">{statsData.totalCount} Analyses</h3>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Layers size={20} />
            </div>
          </div>
        </div>
      )}

      {/* LOADING INTERSTITIAL STAGE */}
      {analysisStep > 0 && (
        <div className="bg-card border border-primary/20 rounded-xl p-8 max-w-lg mx-auto text-center space-y-6 shadow-lg">
          <Loader2 size={36} className="animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <h3 className="font-display font-semibold text-sm text-foreground">AI Resuming Compliance Audit</h3>
            <p className="text-xs text-muted-foreground">Please wait while Gemini processes the match criteria...</p>
          </div>
          {/* Sequenced logs logs */}
          <div className="text-[10px] text-gray-500 font-mono space-y-1">
            <div className={analysisStep >= 1 ? 'text-primary' : ''}>[1] Extracting resume content block: {analysisStep >= 1 ? 'DONE' : 'PENDING'}</div>
            <div className={analysisStep >= 2 ? 'text-primary' : ''}>[2] Parsing Job Description keywords: {analysisStep >= 2 ? 'DONE' : 'PENDING'}</div>
            <div className={analysisStep >= 3 ? 'text-primary' : ''}>[3] Invoking Gemini-1.5 heuristics matching: {analysisStep >= 3 ? 'DONE' : 'PENDING'}</div>
            <div className={analysisStep >= 4 ? 'text-primary' : ''}>[4] Saving scorecard metrics: {analysisStep >= 4 ? 'DONE' : 'PENDING'}</div>
          </div>
        </div>
      )}

      {analysisStep === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT CONTAINER: Setup Console Form & History Lists */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* SETUP PANEL CARD */}
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border/20 pb-2 text-primary">
                <BrainCircuit size={15} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Analysis Setup</h3>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                {/* Source Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Resume Source</label>
                  <div className="grid grid-cols-2 gap-2 bg-secondary/20 p-0.5 rounded-lg border border-border/30">
                    <button
                      type="button"
                      onClick={() => setResumeSource('builder')}
                      className={`py-1.5 text-[10px] font-bold uppercase rounded ${
                        resumeSource === 'builder' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Builder Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => setResumeSource('manual')}
                      className={`py-1.5 text-[10px] font-bold uppercase rounded ${
                        resumeSource === 'manual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Paste Text
                    </button>
                  </div>
                </div>

                {/* Conditional Fields */}
                {resumeSource === 'builder' ? (
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400">Select Created Resume</label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    >
                      <option value="">-- Choose Resume --</option>
                      {resumesList?.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* File Upload Zone */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-gray-400">Upload PDF / DOCX Resume</label>
                      <div className="border-2 border-dashed border-border/40 hover:border-primary/40 transition-colors rounded-lg p-4 text-center cursor-pointer relative bg-secondary/5">
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          disabled={isUploading}
                          onChange={(e) => handleFileUpload(e, 'resume')}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          {isUploading ? (
                            <>
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              <span className="text-[10px] font-medium text-muted-foreground">Uploading & Extracting...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-6 w-6 text-muted-foreground" />
                              <span className="text-[10px] font-bold text-foreground">Click to upload file</span>
                              <span className="text-[9px] text-gray-500">PDF, DOCX up to 10MB</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {previewResumeUrl && (
                      <div className="flex items-center justify-between p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs">
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle size={12} /> Resume File Loaded
                        </span>
                        <a
                          href={previewResumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] uppercase font-bold text-primary hover:underline"
                        >
                          Preview Uploaded Resume
                        </a>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-gray-400">Resume Name</label>
                      <input
                        type="text"
                        className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                        value={manualResumeName}
                        onChange={(e) => setManualResumeName(e.target.value)}
                        placeholder="e.g. Uploaded Resume Tech"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-gray-400">Resume Text Content</label>
                      <textarea
                        rows={5}
                        className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none resize-none"
                        value={manualResumeText}
                        onChange={(e) => setManualResumeText(e.target.value)}
                        placeholder="Paste complete copy of your PDF resume text details here..."
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400">Target Role Title</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Frontend Engineer"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400">Company Name</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] uppercase font-bold text-gray-400">Job Description (JD)</label>
                    <span className="text-[9px] text-gray-500 font-medium">{jobDescription.length} characters</span>
                  </div>

                  {/* Upload JD & Template controls */}
                  <div className="flex gap-2 flex-wrap pb-1 pt-0.5">
                    {/* Hidden input for JD file upload */}
                    <div className="relative">
                      <button
                        type="button"
                        className="px-2 py-0.5 bg-secondary hover:bg-secondary/80 border border-border/40 text-[9px] font-bold uppercase rounded inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <UploadCloud size={10} />
                        <span>Upload JD</span>
                      </button>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => handleFileUpload(e, 'jd')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveJdTemplate}
                      className="px-2 py-0.5 bg-secondary hover:bg-secondary/80 border border-border/40 text-[9px] font-bold uppercase rounded inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <PlusCircle size={10} />
                      <span>Save Template</span>
                    </button>

                    {jdTemplates.length > 0 && (
                      <select
                        onChange={(e) => {
                          const matched = jdTemplates.find((t) => t.id === e.target.value);
                          if (matched) {
                            setJobDescription(matched.desc);
                            if (matched.title.includes(' @ ')) {
                              const [tTitle, tCompany] = matched.title.split(' @ ');
                              setJobTitle(tTitle);
                              setCompany(tCompany);
                            } else {
                              setJobTitle(matched.title);
                            }
                          }
                        }}
                        className="bg-secondary hover:bg-secondary/80 border border-border/40 text-[9px] font-bold uppercase rounded px-2 py-0.5 text-muted-foreground"
                      >
                        <option value="">Load Template...</option>
                        {jdTemplates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <textarea
                    rows={6}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none resize-none"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job details listing requirements..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={analyzeMutation.isPending}
                  className="w-full py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Analyze Compliance</span>
                </button>
              </form>
            </div>

            {/* HISTORICAL LOGS CARD */}
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Scan History</span>
                <span className="text-[10px] text-muted-foreground">{historyList?.length || 0} run logs</span>
              </div>

              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-muted-foreground" />
                </div>
              ) : historyList?.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">No analysis runs stored yet.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {historyList?.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => setActiveReportId(h.id)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                        activeReportId === h.id
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-secondary/15 border-border/30 hover:border-primary/20'
                      }`}
                    >
                      <div className="space-y-0.5 truncate">
                        <h4 className="text-[11px] font-bold text-foreground truncate pr-2">
                          {h.jobTitle} @ {h.company}
                        </h4>
                        <p className="text-[9px] text-gray-500 font-medium">
                          {h.resumeName} • {new Date(h.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            h.atsScore >= 80
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : h.atsScore >= 60
                              ? 'text-amber-500 bg-amber-500/10'
                              : 'text-rose-500 bg-rose-500/10'
                          }`}
                        >
                          {h.atsScore}%
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this ATS log from history?')) {
                              deleteMutation.mutate(h.id);
                            }
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive rounded"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT CONTAINER: Audit Report Visuals */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeReport ? (
              <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6">
                {/* Header overview metrics */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/10 pb-4">
                  <div className="space-y-1.5">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <span>ATS Audit Report</span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        ({activeReport.jobTitle} @ {activeReport.company})
                      </span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-medium pb-1">
                      Resume tested: {activeReport.resumeName} • Run date: {new Date(activeReport.createdAt).toLocaleString()}
                    </p>
                    {/* Export Actions Toolbar */}
                    <div className="flex gap-2 text-[9px] uppercase font-bold">
                      <button
                        onClick={handleExportPDF}
                        className="px-2 py-1 bg-secondary text-foreground hover:bg-secondary/80 border border-border/40 rounded flex items-center gap-1"
                      >
                        <FileText size={10} />
                        <span>Export PDF</span>
                      </button>
                      <button
                        onClick={handleExportJSON}
                        className="px-2 py-1 bg-secondary text-foreground hover:bg-secondary/80 border border-border/40 rounded flex items-center gap-1"
                      >
                        <Layers size={10} />
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Circular Score Gauge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="relative h-14 w-14 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-secondary"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={
                            activeReport.atsScore >= 80
                              ? 'text-emerald-500'
                              : activeReport.atsScore >= 60
                              ? 'text-amber-500'
                              : 'text-rose-500'
                          }
                          strokeWidth="3.5"
                          strokeDasharray={`${activeReport.atsScore}, 100`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-extrabold text-foreground">{activeReport.atsScore}%</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="block text-[9px] uppercase font-bold text-muted-foreground">Scoring Assessment</span>
                      <span className={`block text-xs font-bold ${
                        activeReport.atsScore >= 80
                          ? 'text-emerald-500'
                          : activeReport.atsScore >= 60
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }`}>
                        {activeReport.atsScore >= 80 ? 'Excellent Match' : activeReport.atsScore >= 60 ? 'Moderate Alignment' : 'Critical Fixes Required'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overall Feedback description */}
                <div className="p-3 bg-secondary/15 border border-border/30 rounded-lg space-y-1">
                  <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-primary">
                    <Sparkles size={11} />
                    <span>Summary Evaluation</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{activeReport.feedback.overallFeedback}</p>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-border/30 flex gap-4 text-xs font-semibold text-muted-foreground">
                  <button
                    onClick={() => setActiveTab('revisions')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTab === 'revisions' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
                    }`}
                  >
                    Bullet Revisions ({activeReport.feedback.suggestions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('keywords')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTab === 'keywords' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
                    }`}
                  >
                    Keyword Matrix
                  </button>
                  <button
                    onClick={() => setActiveTab('breakdown')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTab === 'breakdown' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
                    }`}
                  >
                    Meters Breakdown
                  </button>
                </div>

                {/* Tab content panels */}
                <div>
                  
                  {/* TAB 1: BULLET POINT REVISIONS LIST */}
                  {activeTab === 'revisions' && (
                    <div className="space-y-4">
                      {activeReport.feedback.suggestions.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No spelling, formatting, or bullet adjustments found.</p>
                      ) : (
                        activeReport.feedback.suggestions.map((s, idx) => (
                          <div key={idx} className="bg-secondary/10 border border-border/20 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                Section: {s.category}
                              </span>

                              <div className="flex gap-2">
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                                  s.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                  {s.priority} Priority
                                </span>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                                  s.severity === 'critical' ? 'bg-red-500/15 text-red-500 border border-red-500/20' : 'bg-secondary text-foreground'
                                }`}>
                                  {s.severity}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                              <span className="font-semibold text-foreground">Recommendation:</span> {s.recommendation}
                            </p>

                            {s.before && s.after && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] leading-relaxed border-t border-border/10">
                                <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-1">
                                  <span className="text-[9px] font-extrabold uppercase text-rose-500 block">Resume Bullet</span>
                                  <p className="text-muted-foreground italic font-medium">&ldquo;{s.before}&rdquo;</p>
                                </div>
                                <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg space-y-1">
                                  <span className="text-[9px] font-extrabold uppercase text-emerald-500 block">ATS Optimized Suggestion</span>
                                  <p className="text-foreground font-semibold">&ldquo;{s.after}&rdquo;</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 2: KEYWORDS MATRICES */}
                  {activeTab === 'keywords' && (
                    <div className="space-y-4">
                      {/* Keyword Filter Toggles */}
                      <div className="flex gap-2 border-b border-border/10 pb-2">
                        {(['missing', 'matched', 'recommended'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setKeywordFilter(mode)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-colors ${
                              keywordFilter === mode
                                ? 'bg-primary text-primary-foreground border-primary/20'
                                : 'bg-secondary/40 text-muted-foreground border-border/30 hover:text-foreground'
                            }`}
                          >
                            {mode} ({
                              mode === 'missing'
                                ? activeReport.feedback.missingKeywords.length
                                : mode === 'matched'
                                ? activeReport.feedback.matchedKeywords.length
                                : activeReport.feedback.recommendedKeywords.length
                            })
                          </button>
                        ))}
                      </div>

                      {/* Keywords Grid Output */}
                      <div>
                        {keywordFilter === 'missing' && (
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">Incorporate these keywords inside job accomplishments to pass semantic scanners:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeReport.feedback.missingKeywords.map((k, i) => (
                                <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {keywordFilter === 'matched' && (
                          <div className="space-y-3">
                            <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                              <CheckCircle size={12} /> Successfully aligned keyword indexes:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeReport.feedback.matchedKeywords.map((k, i) => (
                                <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {keywordFilter === 'recommended' && (
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">Industry standard recommended terms matching the target title spec:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeReport.feedback.recommendedKeywords.map((k, i) => (
                                <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SLIDERS ASSESSMENT METERS */}
                  {activeTab === 'breakdown' && (
                    <div className="space-y-4">
                      {Object.entries(activeReport.feedback.breakdown).map(([cat, score]) => (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                            <span className="capitalize">{cat} Compliance</span>
                            <span>{score}%</span>
                          </div>
                          
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/30">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                score >= 80
                                  ? 'bg-emerald-500'
                                  : score >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-card border border-border/40 rounded-xl space-y-4">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <BrainCircuit size={24} />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-sm font-bold text-foreground">Audit Board Empty</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Select a report run from history logs on the left sidebar, or upload and trigger a new analysis scan.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- COMPARISON MODAL DIALOG --- */}
      {compareMode && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-4xl w-full space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-1">
                <GitCompare size={14} /> Resume Comparison Screen
              </h3>
              <button onClick={() => setCompareMode(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">Select two compliance runs to contrast category scores and keywords.</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Report A (Before/Baseline)</label>
                <select
                  value={compareReportAId}
                  onChange={(e) => setCompareReportAId(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="">-- Choose Report --</option>
                  {historyList?.map((h) => (
                    <option key={h.id} value={h.id}>{h.jobTitle} @ {h.company} ({h.atsScore}%)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Report B (Optimized Version)</label>
                <select
                  value={compareReportBId}
                  onChange={(e) => setCompareReportBId(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="">-- Choose Report --</option>
                  {historyList?.map((h) => (
                    <option key={h.id} value={h.id}>{h.jobTitle} @ {h.company} ({h.atsScore}%)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Details Grid */}
            {compareReportA && compareReportB && (
              <div className="border-t border-border/20 pt-4 space-y-4">
                <div className="grid grid-cols-3 text-xs font-bold border-b border-border/10 pb-2 text-foreground uppercase tracking-wider">
                  <div>Compliance Category</div>
                  <div className="text-center">{compareReportA.resumeName}</div>
                  <div className="text-center">{compareReportB.resumeName}</div>
                </div>

                <div className="grid grid-cols-3 text-xs py-1.5 border-b border-border/10 text-muted-foreground font-semibold">
                  <div>Overall ATS Score</div>
                  <div className="text-center font-bold text-foreground">{compareReportA.atsScore}%</div>
                  <div className="text-center font-bold text-emerald-500">{compareReportB.atsScore}%</div>
                </div>

                {Object.keys(compareReportA.feedback.breakdown).map((cat) => {
                  const scoreA = (compareReportA.feedback.breakdown as any)[cat];
                  const scoreB = (compareReportB.feedback.breakdown as any)[cat];
                  return (
                    <div key={cat} className="grid grid-cols-3 text-xs py-1.5 border-b border-border/10 text-muted-foreground">
                      <div className="capitalize">{cat}</div>
                      <div className="text-center font-medium">{scoreA}%</div>
                      <div className={`text-center font-bold ${scoreB >= scoreA ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {scoreB}% ({scoreB - scoreA >= 0 ? `+${scoreB - scoreA}` : scoreB - scoreA})
                      </div>
                    </div>
                  );
                })}

                <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="bg-secondary/15 p-3 rounded-lg space-y-1">
                    <span className="font-bold text-foreground">Matched Keywords ({compareReportB.feedback.matchedKeywords.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {compareReportB.feedback.matchedKeywords.slice(0, 10).map((k) => (
                        <span key={k} className="text-[9px] font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-secondary/15 p-3 rounded-lg space-y-1">
                    <span className="font-bold text-foreground">Remaining Missing ({compareReportB.feedback.missingKeywords.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {compareReportB.feedback.missingKeywords.slice(0, 10).map((k) => (
                        <span key={k} className="text-[9px] font-semibold px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border/10">
              <button
                type="button"
                onClick={() => {
                  setCompareMode(false);
                  setCompareReportAId('');
                  setCompareReportBId('');
                }}
                className="px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

    </Container>
  );
}
