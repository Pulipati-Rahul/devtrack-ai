'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Monitor,
  Smartphone,
  Tablet,
  Settings,
  Palette,
  Eye,
  Globe,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  FileCheck,
  AlertTriangle,
  Github,
  Linkedin,
  Twitter,
  Mail,
  User,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Link,
  ChevronDown
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

// Define Interface structures
interface PortfolioConfig {
  id: string;
  userId: string;
  headline: string | null;
  bio: string | null;
  theme: string | null;
  published: boolean;
  publicSlug: string;
  appearance: {
    primaryColor?: string;
    accentColor?: string;
    typography?: string;
    darkMode?: boolean;
    cardStyle?: string;
    spacing?: string;
    borderRadius?: string;
    heroBgUrl?: string;
    resumeUrl?: string;
    profileImageUrl?: string;
  } | null;
  sectionsConfig: {
    id: string;
    name: string;
    visible: boolean;
    sortOrder: number;
  }[] | null;
  seoSettings: {
    title?: string | null;
    description?: string | null;
    keywords?: string | null;
    ogImage?: string | null;
    canonicalUrl?: string | null;
  } | null;
  socialLinks: {
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    portfolio?: string | null;
    email?: string | null;
  } | null;
}

interface PortfolioProjectItem {
  portfolioProjectId: string;
  featured: boolean;
  sortOrder: number;
  project: {
    id: string;
    title: string;
    description: string | null;
    technologies: string | null;
    githubUrl: string | null;
    liveUrl: string | null;
  };
}

interface ImportResponse {
  headline: string;
  bio: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    portfolio: string;
    email: string;
  };
  developer: {
    educations: any[];
    experiences: any[];
    skills: any[];
    certifications: any[];
    achievements: any[];
  };
  projects: any[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const PRESET_FONTS = ['Inter', 'Outfit', 'Playfair Display', 'Fira Code'];
const PRESET_COLORS = [
  { name: 'Sleek Gray', primary: 'hsl(215, 20%, 65%)', accent: 'hsl(255, 60%, 60%)' },
  { name: 'Ocean Emerald', primary: 'hsl(162, 50%, 45%)', accent: 'hsl(180, 70%, 50%)' },
  { name: 'Vibrant Orange', primary: 'hsl(24, 75%, 50%)', accent: 'hsl(340, 80%, 55%)' },
  { name: 'Royal Violet', primary: 'hsl(270, 70%, 50%)', accent: 'hsl(290, 80%, 60%)' },
];

export default function PortfolioBuilderPage() {
  const queryClient = useQueryClient();

  // Active workspace settings tabs
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'appearance' | 'sections' | 'projects' | 'seo'>('dashboard');
  const [previewSize, setPreviewSize] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Input states
  const [slugInput, setSlugInput] = React.useState('');
  const [headlineInput, setHeadlineInput] = React.useState('');
  const [bioInput, setBioInput] = React.useState('');
  
  // Customizer styling states
  const [themeInput, setThemeInput] = React.useState('Modern');
  const [primaryColor, setPrimaryColor] = React.useState('hsl(215, 20%, 65%)');
  const [accentColor, setAccentColor] = React.useState('hsl(255, 60%, 60%)');
  const [fontFamily, setFontFamily] = React.useState('Inter');
  const [darkMode, setDarkMode] = React.useState(true);
  const [cardStyle, setCardStyle] = React.useState('bordered');
  const [borderRadius, setBorderRadius] = React.useState('lg');
  const [spacingStyle, setSpacingStyle] = React.useState('normal');

  // SEO Input states
  const [seoTitle, setSeoTitle] = React.useState('');
  const [seoDesc, setSeoDesc] = React.useState('');
  const [seoKeys, setSeoKeys] = React.useState('');
  const [seoCanon, setSeoCanon] = React.useState('');

  // Social Links states
  const [socialGithub, setSocialGithub] = React.useState('');
  const [socialLinkedin, setSocialLinkedin] = React.useState('');
  const [socialTwitter, setSocialTwitter] = React.useState('');
  const [socialEmail, setSocialEmail] = React.useState('');

  // Media Assets Upload states
  const [heroBgUrl, setHeroBgUrl] = React.useState('');
  const [resumeUrl, setResumeUrl] = React.useState('');
  const [profileImageUrl, setProfileImageUrl] = React.useState('');

  // AI assistant states & functions
  const [aiGenerating, setAiGenerating] = React.useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = React.useState<string>('');

  const handleGenerateAIField = async (field: 'headline' | 'bio' | 'seoDesc') => {
    setAiGenerating(field);
    let prompt = '';
    if (field === 'headline') {
      prompt = `Generate 3 short, punchy developer portfolio taglines/headlines (under 10 words each) using active verbs. Make it sound modern, professional, and highlight high impact. Output only the lines.`;
    } else if (field === 'bio') {
      prompt = `Generate a compelling, professional developer portfolio bio under 100 words. Highlight building high-performance applications, collaborating with team members, and solving complex problems. Output only the bio.`;
    } else if (field === 'seoDesc') {
      prompt = `Generate an SEO-optimized meta description under 150 characters for a developer portfolio page with the headline: "${headlineInput}" and bio: "${bioInput}". Output only the description.`;
    }

    try {
      const res = await apiClient.post<any>('/ai/chat', { message: prompt });
      if (res && res.content) {
        if (field === 'headline') {
          const lines = res.content.split('\n').map((l: string) => l.trim().replace(/^[-0-9.\s]+/, '')).filter(Boolean);
          if (lines.length > 0) setHeadlineInput(lines[0]);
        } else if (field === 'bio') {
          setBioInput(res.content.trim());
        } else if (field === 'seoDesc') {
          setSeoDesc(res.content.trim().slice(0, 150));
        }
        showToast('AI suggestion generated');
      }
    } catch (e: any) {
      showToast(e.message || 'AI generation failed', 'error');
    } finally {
      setAiGenerating(null);
    }
  };

  const handleAuditPortfolio = async () => {
    setAiGenerating('audit');
    setAiSuggestions('');
    const prompt = `Critique this developer portfolio:
Headline/Tagline: "${headlineInput}"
Bio: "${bioInput}"

Suggest exactly 3 action-oriented improvements in a bulleted list to make this portfolio look premium and stand out to technical recruiters. Keep it concise.`;

    try {
      const res = await apiClient.post<any>('/ai/chat', { message: prompt });
      if (res && res.content) {
        setAiSuggestions(res.content.trim());
      }
    } catch (e: any) {
      showToast(e.message || 'Audit suggestions failed', 'error');
    } finally {
      setAiGenerating(null);
    }
  };

  // Reorder sorting functions
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const list = [...sectionsList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const updated = list.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));
    setSectionsList(updated);
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const list = [...featuredProjectsMap];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const updated = list.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));
    setFeaturedProjectsMap(updated);
  };

  // File Upload logic
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'bg' | 'resume') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'resume') {
      if (file.type !== 'application/pdf') {
        showToast('Only PDF files are allowed for resumes', 'error');
        return;
      }
    } else {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are allowed', 'error');
        return;
      }
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be under 10MB limit', 'error');
      return;
    }

    showToast(`Uploading ${target} to Cloudinary...`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `devtrack-ai/portfolio`);

    try {
      const res = await apiClient.postForm<any>('/upload', formData);
      if (res && res.url) {
        if (target === 'avatar') setProfileImageUrl(res.url);
        else if (target === 'bg') setHeroBgUrl(res.url);
        else if (target === 'resume') setResumeUrl(res.url);
        showToast('Upload completed successfully');
      }
    } catch (err: any) {
      showToast(err.message || 'File upload failed', 'error');
    }
  };

  // Section visible/reorder list
  const [sectionsList, setSectionsList] = React.useState<any[]>([]);
  // Featured projects checklist
  const [featuredProjectsMap, setFeaturedProjectsMap] = React.useState<any[]>([]);

  // Float notifications
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // --- 1. Queries ---
  const { data: configData, isLoading, isError, refetch } = useQuery<{
    portfolio: PortfolioConfig;
    projects: PortfolioProjectItem[];
  }>({
    queryKey: ['portfolioConfig'],
    queryFn: () => apiClient.get<{ portfolio: PortfolioConfig; projects: PortfolioProjectItem[] }>('/portfolio'),
  });

  // Sync inputs when configuration is loaded
  React.useEffect(() => {
    if (configData?.portfolio) {
      const p = configData.portfolio;
      setSlugInput(p.publicSlug);
      setHeadlineInput(p.headline || '');
      setBioInput(p.bio || '');
      setThemeInput(p.theme || 'Modern');

      if (p.appearance) {
        setPrimaryColor(p.appearance.primaryColor || 'hsl(215, 20%, 65%)');
        setAccentColor(p.appearance.accentColor || 'hsl(255, 60%, 60%)');
        setFontFamily(p.appearance.typography || 'Inter');
        setDarkMode(p.appearance.darkMode ?? true);
        setCardStyle(p.appearance.cardStyle || 'bordered');
        setBorderRadius(p.appearance.borderRadius || 'lg');
        setSpacingStyle(p.appearance.spacing || 'normal');
        setHeroBgUrl(p.appearance.heroBgUrl || '');
        setResumeUrl(p.appearance.resumeUrl || '');
        setProfileImageUrl(p.appearance.profileImageUrl || '');
      }

      if (p.sectionsConfig) {
        setSectionsList(p.sectionsConfig);
      }

      if (p.seoSettings) {
        setSeoTitle(p.seoSettings.title || '');
        setSeoDesc(p.seoSettings.description || '');
        setSeoKeys(p.seoSettings.keywords || '');
        setSeoCanon(p.seoSettings.canonicalUrl || '');
      }

      if (p.socialLinks) {
        setSocialGithub(p.socialLinks.github || '');
        setSocialLinkedin(p.socialLinks.linkedin || '');
        setSocialTwitter(p.socialLinks.twitter || '');
        setSocialEmail(p.socialLinks.email || '');
      }
    }
    if (configData?.projects) {
      setFeaturedProjectsMap(configData.projects);
    }
  }, [configData]);

  // --- 2. Mutations ---
  const saveMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<any>('/portfolio', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioConfig'] });
      showToast('Portfolio configuration saved successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to save portfolio settings', 'error');
    },
  });

  const publishMutation = useMutation({
    mutationFn: (flag: boolean) =>
      apiClient.post<any>(`/portfolio/${flag ? 'publish' : 'unpublish'}`),
    onSuccess: (_, flag) => {
      queryClient.invalidateQueries({ queryKey: ['portfolioConfig'] });
      showToast(flag ? 'Portfolio is now live' : 'Portfolio is offline');
    },
    onError: (err: any) => {
      showToast(err.message || 'Publish status toggle failed', 'error');
    },
  });

  const importMutation = useMutation({
    mutationFn: () => apiClient.get<ImportResponse>('/portfolio/import/profile'),
    onSuccess: (res) => {
      // Prompt for confirmation before applying
      if (confirm('Import profile inputs? This will fill the builder form (you must click Save to persist).')) {
        setHeadlineInput(res.headline || '');
        setBioInput(res.bio || '');
        setSocialGithub(res.socialLinks.github || '');
        setSocialLinkedin(res.socialLinks.linkedin || '');
        setSocialTwitter(res.socialLinks.twitter || '');
        setSocialEmail(res.socialLinks.email || '');
        
        // Populate featured projects with imported project records
        if (res.projects && Array.isArray(res.projects)) {
          const mapped = res.projects.map((proj, idx) => ({
            featured: true,
            sortOrder: idx + 1,
            project: proj,
          }));
          setFeaturedProjectsMap(mapped);
        }

        showToast('Profile parameters loaded. Click Save to keep changes.');
      }
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to import profile data', 'error');
    },
  });

  // --- 3. Save Configuration handler ---
  const handleSave = () => {
    if (!slugInput.trim()) {
      showToast('Slug is required', 'error');
      return;
    }

    const payload = {
      headline: headlineInput.trim(),
      bio: bioInput.trim(),
      theme: themeInput,
      publicSlug: slugInput.trim().toLowerCase(),
      appearance: {
        primaryColor,
        accentColor,
        typography: fontFamily,
        darkMode,
        cardStyle,
        spacing: spacingStyle,
        borderRadius,
        heroBgUrl,
        resumeUrl,
        profileImageUrl,
      },
      sectionsConfig: sectionsList,
      seoSettings: {
        title: seoTitle.trim() || null,
        description: seoDesc.trim() || null,
        keywords: seoKeys.trim() || null,
        canonicalUrl: seoCanon.trim() || null,
      },
      socialLinks: {
        github: socialGithub.trim() || null,
        linkedin: socialLinkedin.trim() || null,
        twitter: socialTwitter.trim() || null,
        email: socialEmail.trim() || null,
      },
      projects: featuredProjectsMap.map((p, idx) => ({
        projectId: p.project.id,
        featured: p.featured,
        sortOrder: idx + 1,
      })),
    };

    saveMutation.mutate(payload);
  };

  const handleToggleProject = (projId: string) => {
    setFeaturedProjectsMap((prev) =>
      prev.map((item) =>
        item.project.id === projId ? { ...item, featured: !item.featured } : item
      )
    );
  };

  if (isLoading) {
    return (
      <Container className="py-8 animate-pulse space-y-6">
        <div className="h-8 bg-secondary rounded w-1/4" />
        <div className="h-[500px] bg-secondary rounded-xl" />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="py-12 flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Failed to Load Portfolio Builder</h3>
          <p className="text-xs text-muted-foreground">We couldn&apos;t retrieve your portfolio configuration settings.</p>
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

  // Determine current public URL link (mock relative)
  const currentSlug = configData?.portfolio?.publicSlug || slugInput || '';
  const publicUrl = `/portfolio/${currentSlug}`;
  const isPublished = configData?.portfolio?.published || false;

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

      {/* Top Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/40 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Portfolio Manager</h1>
          <p className="text-xs text-muted-foreground">Build, style, and publish professional developer pages showcasing your skills.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => importMutation.mutate()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw size={12} />
            <span>Sync Profile</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            {saveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT CONFIGURATION PANEL (7 columns) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Builder Settings Tabs */}
          <div className="flex items-center border-b border-border/30 pb-1 text-xs font-semibold text-muted-foreground flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'dashboard' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
              }`}
            >
              <Globe size={13} /> Status Info
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-3 pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'appearance' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
              }`}
            >
              <Palette size={13} /> Appearance Styles
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`px-3 pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'sections' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
              }`}
            >
              <Settings size={13} /> Profile Sections
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'projects' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
              }`}
            >
              <Briefcase size={13} /> Featured Projects
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-3 pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'seo' ? 'text-primary border-primary' : 'border-transparent hover:text-foreground'
              }`}
            >
              <ShieldCheck size={13} /> SEO Settings
            </button>
          </div>

          {/* TAB 1: STATUS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Portfolio Status & Deployment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/10 border border-border/30 rounded-lg p-4 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Publish Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-2 w-2 rounded-full ${isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="text-xs font-bold text-foreground">{isPublished ? 'Live & Published' : 'Offline Draft'}</span>
                  </div>
                </div>

                <div className="bg-secondary/10 border border-border/30 rounded-lg p-4 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Views Tracker</span>
                  <span className="text-base font-bold text-foreground mt-1 block">128 scans (Placeholder)</span>
                </div>
              </div>

              {/* Headline & Bio Inputs */}
              <div className="space-y-4 pt-3 border-t border-border/20">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Portfolio Tagline / Headline</label>
                    <button
                      onClick={() => handleGenerateAIField('headline')}
                      disabled={aiGenerating !== null}
                      className="inline-flex items-center gap-1 text-[9px] font-bold text-primary hover:opacity-85"
                    >
                      {aiGenerating === 'headline' ? <Loader2 size={8} className="animate-spin" /> : <Sparkles size={8} />}
                      <span>AI Tagline</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={headlineInput}
                    onChange={(e) => setHeadlineInput(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer specialized in React"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Professional Biography (Bio)</label>
                    <button
                      onClick={() => handleGenerateAIField('bio')}
                      disabled={aiGenerating !== null}
                      className="inline-flex items-center gap-1 text-[9px] font-bold text-primary hover:opacity-85"
                    >
                      {aiGenerating === 'bio' ? <Loader2 size={8} className="animate-spin" /> : <Sparkles size={8} />}
                      <span>AI Bio</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none resize-none"
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Write detailed biography details..."
                  />
                </div>
              </div>

              {/* Slug configuration input */}
              <div className="space-y-1.5 pt-3 border-t border-border/20">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Custom Public Slug</label>
                <div className="flex border border-border/50 rounded-lg overflow-hidden bg-secondary/35">
                  <span className="bg-secondary px-3 py-2 text-xs text-muted-foreground select-none">/portfolio/</span>
                  <input
                    type="text"
                    className="w-full bg-transparent p-2 text-xs text-foreground focus:outline-none"
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    placeholder="johndoe"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground">Slug can only contain lowercase letters, numbers, dashes, and underscores.</p>
              </div>

              {/* AI Audit Critique */}
              <div className="pt-3 border-t border-border/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">AI Portfolio Inspector</span>
                  <button
                    onClick={handleAuditPortfolio}
                    disabled={aiGenerating !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {aiGenerating === 'audit' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    <span>Audit Portfolio</span>
                  </button>
                </div>
                {aiSuggestions ? (
                  <div className="bg-primary/5 border border-primary/25 rounded-lg p-3 text-[10px] text-foreground leading-relaxed whitespace-pre-wrap font-mono">
                    {aiSuggestions}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground">Click the button to receive 3 immediate optimization suggestions from Gemini AI based on your bio details.</p>
                )}
              </div>

              {/* Publish Toggle Button */}
              <div className="pt-3 border-t border-border/20 flex justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-foreground">Published Page URLs</span>
                  {isPublished ? (
                    <a
                      href={publicUrl}
                      target="_blank"
                      className="text-[10px] text-primary hover:underline block mt-0.5"
                    >
                      {publicUrl} <ExternalLink size={8} className="inline" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Not deployed yet. Click publish.</span>
                  )}
                </div>

                <button
                  onClick={() => publishMutation.mutate(!isPublished)}
                  disabled={publishMutation.isPending}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                    isPublished
                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                      : 'bg-emerald-500 text-white hover:opacity-90'
                  }`}
                >
                  {publishMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>{isPublished ? 'Unpublish Portfolio' : 'Deploy Portfolio'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE CUSTOMIZER */}
          {activeTab === 'appearance' && (
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Theme & Color Styling</h3>

              {/* Template Picker */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Portfolio Layout Template</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Modern', 'Minimal', 'Professional', 'Creative'].map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => setThemeInput(tpl)}
                      className={`p-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                        themeInput === tpl
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/50 bg-secondary/15 hover:bg-secondary/40 text-muted-foreground'
                      }`}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* HSL preset picker */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Color Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => {
                        setPrimaryColor(col.primary);
                        setAccentColor(col.accent);
                      }}
                      className="p-2 border border-border/30 rounded-lg text-[10px] text-left text-foreground font-semibold flex items-center justify-between hover:bg-secondary/35"
                    >
                      <span>{col.name}</span>
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: col.primary }} />
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: col.accent }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography / Font styles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Typography Font</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    {PRESET_FONTS.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Border Radius</label>
                  <select
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="none">Sharp edges (none)</option>
                    <option value="md">Rounded (md)</option>
                    <option value="lg">Standard (lg)</option>
                    <option value="xl">Full cards (xl)</option>
                  </select>
                </div>
              </div>

              {/* Layout properties */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Card Style</label>
                  <select
                    value={cardStyle}
                    onChange={(e) => setCardStyle(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="bordered">Bordered</option>
                    <option value="flat">Flat</option>
                    <option value="glass">Glassmorphism</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Spacing</label>
                  <select
                    value={spacingStyle}
                    onChange={(e) => setSpacingStyle(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Color Mode</label>
                  <select
                    value={darkMode ? 'dark' : 'light'}
                    onChange={(e) => setDarkMode(e.target.value === 'dark')}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="dark">Force Dark</option>
                    <option value="light">Force Light</option>
                  </select>
                </div>
              </div>

              {/* Media Asset Upload Section */}
              <div className="pt-3 border-t border-border/20 space-y-4">
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">Portfolio Media Assets</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-gray-500 font-bold">Profile Photo Override</label>
                    <div className="flex flex-col gap-2">
                      {profileImageUrl ? (
                        <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border">
                          <img src={profileImageUrl} className="h-full w-full object-cover" alt="Profile" />
                          <button
                            onClick={() => setProfileImageUrl('')}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <label className="h-12 w-12 rounded-full border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/20">
                          <Plus size={12} className="text-muted-foreground" />
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'avatar')} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-gray-500 font-bold">Hero Background Image</label>
                    <div className="flex items-center gap-2">
                      {heroBgUrl ? (
                        <div className="flex items-center gap-2 bg-secondary/35 border border-border/40 p-2 rounded-lg text-xs w-full justify-between">
                          <span className="truncate max-w-[120px] text-[10px]">Background set</span>
                          <button onClick={() => setHeroBgUrl('')} className="text-muted-foreground hover:text-destructive">
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <label className="px-3 py-1.5 border border-dashed border-border rounded-lg text-[10px] cursor-pointer hover:bg-secondary/20 text-center w-full">
                          <span>Upload background</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'bg')} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-gray-500 font-bold">Resume PDF Download</label>
                    <div className="flex items-center gap-2">
                      {resumeUrl ? (
                        <div className="flex items-center gap-2 bg-secondary/35 border border-border/40 p-2 rounded-lg text-xs w-full justify-between">
                          <span className="truncate max-w-[120px] text-[10px]">Resume PDF uploaded</span>
                          <button onClick={() => setResumeUrl('')} className="text-muted-foreground hover:text-destructive">
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <label className="px-3 py-1.5 border border-dashed border-border rounded-lg text-[10px] cursor-pointer hover:bg-secondary/20 text-center w-full">
                          <span>Upload PDF</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'resume')} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTIONS CONFIG */}
          {activeTab === 'sections' && (
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Sections Configurations</h3>
                <span className="text-[10px] text-muted-foreground">Toggle sections visible status</span>
              </div>

              {/* Sections list */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {sectionsList.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="flex justify-between items-center p-3 bg-secondary/15 border border-border/30 rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-bold w-4">#{idx + 1}</span>
                      <span className="text-xs font-bold text-foreground">{sec.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Sorting Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, 'down')}
                          disabled={idx === sectionsList.length - 1}
                          className="p-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={sec.visible}
                          onChange={() => {
                            setSectionsList((prev) =>
                              prev.map((s) => (s.id === sec.id ? { ...s, visible: !s.visible } : s))
                            );
                          }}
                        />
                        <div className="w-8 h-4 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FEATURED PROJECTS */}
          {activeTab === 'projects' && (
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Showcase featured projects</h3>
                <span className="text-[10px] text-muted-foreground">Pick from tracker listings</span>
              </div>

              {featuredProjectsMap.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No projects pulled yet. Hit Sync Profile to load projects from the Project Tracker.
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {featuredProjectsMap.map((item, idx) => (
                    <div
                      key={item.project.id}
                      className={`p-3 border rounded-lg flex justify-between items-start gap-4 transition-colors ${
                        item.featured
                          ? 'border-primary bg-primary/10'
                          : 'border-border/30 bg-secondary/15'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleProject(item.project.id)}
                        className="space-y-1 truncate pr-8 cursor-pointer flex-grow"
                      >
                        <h4 className="text-xs font-bold text-foreground truncate">{item.project.title}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 truncate">{item.project.description || 'No description'}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Sorting controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveProject(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveProject(idx, 'down')}
                            disabled={idx === featuredProjectsMap.length - 1}
                            className="p-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>
                        <div
                          onClick={() => handleToggleProject(item.project.id)}
                          className={`h-4 w-4 rounded border flex items-center justify-center cursor-pointer ${
                            item.featured ? 'border-primary bg-primary text-primary-foreground' : 'border-border/50 bg-secondary'
                          }`}
                        >
                          {item.featured && <Check size={10} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SEO & SOCIALS */}
          {activeTab === 'seo' && (
            <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Search engine & Social parameters</h3>

              {/* Title & description tags */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">SEO Title</label>
                  <input
                    type="text"
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="e.g. John Doe - Full Stack Developer Portfolio"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">SEO Description</label>
                    <button
                      onClick={() => handleGenerateAIField('seoDesc')}
                      disabled={aiGenerating !== null}
                      className="inline-flex items-center gap-1 text-[9px] font-bold text-primary hover:opacity-85"
                    >
                      {aiGenerating === 'seoDesc' ? <Loader2 size={8} className="animate-spin" /> : <Sparkles size={8} />}
                      <span>AI SEO Meta</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    className="w-full bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none resize-none"
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    placeholder="Summarize skills..."
                  />
                </div>
              </div>

              {/* Social links URL logs */}
              <div className="space-y-3 pt-3 border-t border-border/20">
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">Social URL Profiles</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] text-gray-500 font-bold">GitHub</label>
                    <input
                      type="url"
                      className="w-full bg-secondary/35 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                      value={socialGithub}
                      onChange={(e) => setSocialGithub(e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-gray-500 font-bold">LinkedIn</label>
                    <input
                      type="url"
                      className="w-full bg-secondary/35 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                      value={socialLinkedin}
                      onChange={(e) => setSocialLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] text-gray-500 font-bold">Twitter/X</label>
                    <input
                      type="url"
                      className="w-full bg-secondary/35 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                      value={socialTwitter}
                      onChange={(e) => setSocialTwitter(e.target.value)}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-gray-500 font-bold">Contact Email</label>
                    <input
                      type="email"
                      className="w-full bg-secondary/35 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                      value={socialEmail}
                      onChange={(e) => setSocialEmail(e.target.value)}
                      placeholder="test@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT LIVE PREVIEW CANVAS (5 columns) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/20 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye size={13} /> Live Preview Canvas
            </span>

            {/* Viewport size controls */}
            <div className="flex bg-secondary border border-border/40 rounded-lg p-0.5">
              <button
                onClick={() => setPreviewSize('desktop')}
                className={`p-1.5 rounded-md transition-colors ${previewSize === 'desktop' ? 'bg-background text-primary' : 'text-muted-foreground'}`}
                title="Desktop Layout"
              >
                <Monitor size={12} />
              </button>
              <button
                onClick={() => setPreviewSize('tablet')}
                className={`p-1.5 rounded-md transition-colors ${previewSize === 'tablet' ? 'bg-background text-primary' : 'text-muted-foreground'}`}
                title="Tablet Layout"
              >
                <Tablet size={12} />
              </button>
              <button
                onClick={() => setPreviewSize('mobile')}
                className={`p-1.5 rounded-md transition-colors ${previewSize === 'mobile' ? 'bg-background text-primary' : 'text-muted-foreground'}`}
                title="Mobile View"
              >
                <Smartphone size={12} />
              </button>
            </div>
          </div>

          {/* Viewport sandbox wrapper */}
          <div className="bg-secondary/15 border border-border/30 rounded-xl p-4 flex items-center justify-center min-h-[500px]">
            <motion.div
              animate={{
                width: previewSize === 'desktop' ? '100%' : previewSize === 'tablet' ? '500px' : '320px',
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="bg-card border border-border/40 rounded-xl shadow-md overflow-hidden min-h-[460px] flex flex-col justify-between"
              style={{ fontFamily: fontFamily }}
            >
              {/* Mock browser top address bar */}
              <div className="bg-secondary border-b border-border/30 px-3 py-1.5 flex items-center justify-between text-[8px] text-gray-500">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="truncate max-w-[200px] bg-card px-4 py-0.5 rounded border border-border/20">
                  localhost:3000{publicUrl}
                </span>
                <div className="w-8" />
              </div>

              {/* Dynamic Theme Mock Renderer */}
              <div className={`p-6 flex-grow space-y-5 text-left ${darkMode ? 'bg-[#0b0c10] text-gray-300' : 'bg-white text-gray-800'}`}>
                {/* Hero / Headline */}
                <div
                  className="p-4 rounded-lg space-y-2 relative overflow-hidden"
                  style={heroBgUrl ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, ${darkMode ? '0.7' : '0.45'}), rgba(0, 0, 0, ${darkMode ? '0.9' : '0.75'})), url(${heroBgUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : undefined}
                >
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest font-extrabold" style={{ color: accentColor }}>
                        Welcome to my space
                      </span>
                      <h2 className={`text-sm font-extrabold ${heroBgUrl ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {headlineInput || 'Headline profile subtitle...'}
                      </h2>
                    </div>

                    {profileImageUrl && (
                      <img src={profileImageUrl} className="h-8 w-8 rounded-full object-cover border border-border" alt="Profile" />
                    )}
                  </div>
                  
                  <p className={`text-[10px] leading-relaxed relative z-10 ${heroBgUrl ? 'text-gray-300' : 'text-muted-foreground'}`}>
                    {bioInput || 'Write summary biography details.'}
                  </p>

                  {resumeUrl && (
                    <div className="pt-1.5 relative z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold rounded">
                        Resume Attached
                      </span>
                    </div>
                  )}
                </div>

                {/* Grid layout sections mock */}
                <div className="space-y-4">
                  {sectionsList
                    .filter((s) => s.visible)
                    .map((sec) => (
                      <div key={sec.id} className="p-3 bg-secondary/10 border border-border/30 rounded-lg space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">{sec.name}</span>
                        
                        {sec.id === 'skills' && (
                          <div className="flex flex-wrap gap-1">
                            {['React', 'TypeScript', 'Node.js', 'PostgreSQL'].map((t) => (
                              <span key={t} className="text-[8px] border border-border/40 px-1.5 py-0.25 rounded text-gray-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {sec.id === 'projects' && (
                          <div className="space-y-1">
                            {featuredProjectsMap.filter((item) => item.featured).length === 0 ? (
                              <span className="text-[9px] text-gray-500 italic">No featured projects selected</span>
                            ) : (
                              featuredProjectsMap
                                .filter((item) => item.featured)
                                .slice(0, 2)
                                .map((item) => (
                                  <div key={item.project.id} className="text-[9px] font-semibold text-foreground flex justify-between">
                                    <span>{item.project.title}</span>
                                    <span style={{ color: primaryColor }}>View Code</span>
                                  </div>
                                ))
                            )}
                          </div>
                        )}

                        {sec.id === 'contact' && (
                          <div className="flex gap-2 text-[9px] text-gray-500">
                            {socialGithub && <Github size={10} />}
                            {socialLinkedin && <Linkedin size={10} />}
                            {socialTwitter && <Twitter size={10} />}
                            {socialEmail && <Mail size={10} />}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Mock footer */}
              <div className="bg-secondary/15 border-t border-border/20 p-2.5 text-center text-[8px] text-gray-500">
                <span>© 2026 Developer Portfolio • DevTrack AI Showcase</span>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </Container>
  );
}
