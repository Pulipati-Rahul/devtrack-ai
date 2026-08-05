'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Monitor,
  Bell,
  Lock,
  Eye,
  Sliders,
  FileText,
  Globe,
  Share2,
  Trash2,
  Download,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Github,
  Linkedin,
  Chrome
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';
import { ImageUpload } from '@/components/upload/ImageUpload';

// Interfaces
interface UserSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    aiSuggestions: boolean;
    dsaReminders: boolean;
    interviewReminders: boolean;
    resumeAlerts: boolean;
  };
  privacy: {
    portfolioVisibility: 'public' | 'private';
    publicProfile: boolean;
    analyticsSharing: boolean;
    aiDataUsage: boolean;
    searchIndexing: boolean;
  };
  aiPreferences: {
    responseLength: 'short' | 'medium' | 'long';
    tone: 'casual' | 'professional' | 'technical';
    creativity: number;
    autoSuggestions: boolean;
    streaming: boolean;
  };
  resumePreferences: {
    defaultTemplate: string;
    defaultFont: string;
    exportFormat: 'pdf' | 'docx' | 'json';
    autoSaveInterval: number;
  };
  portfolioPreferences: {
    defaultTemplate: string;
    theme: 'light' | 'dark' | 'system';
    seoDefaults: {
      title: string;
      description: string;
    };
    socialVisibility: boolean;
  };
  appearance: {
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    sidebarBehavior: 'collapsed' | 'expanded';
  };
  integrations: {
    github: boolean;
    linkedin: boolean;
    google: boolean;
  };
}

interface ActiveSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  createdAt: string;
}

const CATEGORIES = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Monitor },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'ai', label: 'AI Preferences', icon: Sliders },
  { id: 'resume', label: 'Resume Preferences', icon: FileText },
  { id: 'portfolio', label: 'Portfolio Preferences', icon: Globe },
  { id: 'integrations', label: 'Integrations', icon: Share2 },
  { id: 'sessions', label: 'Active Sessions', icon: Monitor },
  { id: 'data', label: 'Data Management', icon: Trash2 },
] as const;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = React.useState<typeof CATEGORIES[number]['id']>('account');
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Form states for profile details
  const [displayName, setDisplayName] = React.useState('');
  const [profilePic, setProfilePic] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  // Fetch Settings
  const { data: settings, isLoading: loadingSettings } = useQuery<UserSettings>({
    queryKey: ['userSettings'],
    queryFn: () => apiClient.get<UserSettings>('/settings'),
  });

  React.useEffect(() => {
    if (settings) {
      setDisplayName((settings as any).name || '');
      setProfilePic((settings as any).image || '');
    }
  }, [settings]);

  // Fetch Sessions
  const { data: sessions = [], isLoading: loadingSessions } = useQuery<ActiveSession[]>({
    queryKey: ['activeSessions'],
    queryFn: () => apiClient.get<ActiveSession[]>('/sessions'),
  });

  // Mutator to save settings
  const saveMutation = useMutation({
    mutationFn: (payload: Partial<UserSettings> & { name?: string; image?: string }) =>
      apiClient.put<UserSettings>('/settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  // Mutator to revoke session
  const revokeSessionMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    },
  });

  // Mutator to request account deletion
  const deleteAccountMutation = useMutation({
    mutationFn: () => apiClient.post('/account/delete-request', {}),
    onSuccess: () => {
      window.location.href = '/login';
    },
  });

  const wipeDataMutation = useMutation({
    mutationFn: (target: 'ai' | 'analytics' | 'all') => apiClient.post('/delete-data', { target }),
    onSuccess: (_, target) => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert(`Wiped ${target} database logs successfully.`);
    },
  });

  if (loadingSettings) {
    return (
      <Container className="py-8 animate-pulse space-y-6">
        <div className="h-8 bg-secondary rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-64 bg-secondary rounded-xl col-span-1" />
          <div className="h-[400px] bg-secondary rounded-xl col-span-3" />
        </div>
      </Container>
    );
  }

  if (!settings) return null;

  const handleToggleNotification = (key: keyof UserSettings['notifications']) => {
    saveMutation.mutate({
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  const handleTogglePrivacy = (key: keyof UserSettings['privacy']) => {
    saveMutation.mutate({
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key],
      },
    });
  };

  const handleUpdateAI = (key: keyof UserSettings['aiPreferences'], value: any) => {
    saveMutation.mutate({
      aiPreferences: {
        ...settings.aiPreferences,
        [key]: value,
      },
    });
  };

  const handleUpdateResume = (key: keyof UserSettings['resumePreferences'], value: any) => {
    saveMutation.mutate({
      resumePreferences: {
        ...settings.resumePreferences,
        [key]: value,
      },
    });
  };

  const handleUpdatePortfolio = (key: keyof UserSettings['portfolioPreferences'], value: any) => {
    saveMutation.mutate({
      portfolioPreferences: {
        ...settings.portfolioPreferences,
        [key]: value,
      },
    });
  };

  const handleUpdateAppearance = (key: keyof UserSettings['appearance'], value: any) => {
    saveMutation.mutate({
      appearance: {
        ...settings.appearance,
        [key]: value,
      },
    });
  };

  const handleExportData = async () => {
    try {
      const res = await apiClient.post<any>('/export', {});
      const csvContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', 'devtrack_account_data.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (err) {
      alert('Failed to export stored preference footprint.');
    }
  };


  return (
    <Container className="py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="flex justify-between items-center border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Settings & Preferences</h1>
          <p className="text-xs text-muted-foreground">Manage profile configurations, notifications controls, connected integrations, and active device sessions.</p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold animate-fadeIn">
            <CheckCircle size={13} />
            <span>Preferences Saved!</span>
          </div>
        )}
      </div>

      {/* Split view Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Categories Navigation (3 cols) */}
        <div className="md:col-span-3 bg-card border border-border/45 rounded-xl p-3 flex flex-col space-y-1 h-fit">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Configurations Form display (9 cols) */}
        <div className="md:col-span-9 bg-card border border-border/45 rounded-xl p-5 shadow-sm min-h-[400px]">
          
          {/* 1. Account Settings */}
          {activeCategory === 'account' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Account Profile</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Display Name</label>
                  <input
                    type="text"
                    className="w-full bg-secondary/35 border border-border/50 p-2.5 rounded-lg focus:outline-none focus:border-primary/45 text-foreground"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground block">Profile Photo</label>
                  <ImageUpload value={profilePic} onChange={setProfilePic} />
                </div>
              </div>

              <button
                onClick={() => saveMutation.mutate({ name: displayName, image: profilePic })}
                disabled={saveMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Profile Changes
              </button>
            </div>
          )}

          {/* 2. Appearance preferences */}
          {activeCategory === 'appearance' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">System Appearance</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Theme Mode selector */}
                <div className="space-y-2">
                  <label className="font-semibold text-foreground">Color Theme Mode</label>
                  <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => saveMutation.mutate({ theme: mode })}
                        className={`flex-1 p-3 rounded-lg border text-xs font-bold capitalize transition-all ${
                          settings.theme === mode
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-secondary/20 border-border/40 text-muted-foreground hover:bg-secondary/40'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size choice */}
                <div className="space-y-2">
                  <label className="font-semibold text-foreground">Font Scaling Size</label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => handleUpdateAppearance('fontSize', sz)}
                        className={`flex-1 p-3 rounded-lg border text-xs font-bold capitalize transition-all ${
                          settings.appearance?.fontSize === sz
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-secondary/20 border-border/40 text-muted-foreground hover:bg-secondary/40'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color picker */}
                <div className="space-y-2">
                  <label className="font-semibold text-foreground">Primary Accent tint</label>
                  <div className="flex gap-2">
                    {['indigo', 'emerald', 'amber', 'rose'].map((tint) => (
                      <button
                        key={tint}
                        onClick={() => handleUpdateAppearance('accentColor', tint)}
                        className={`flex-1 p-3 rounded-lg border text-xs font-bold capitalize transition-all ${
                          settings.appearance?.accentColor === tint
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-secondary/20 border-border/40 text-muted-foreground hover:bg-secondary/40'
                        }`}
                      >
                        {tint}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Layout switcher */}
                <div className="flex items-center justify-between border border-border/30 p-3 rounded-lg bg-secondary/15">
                  <div>
                    <span className="font-semibold text-foreground block">Compact Layout Mode</span>
                    <span className="text-[10px] text-gray-500">Minimize paddings and margins for dashboard feeds.</span>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={settings.appearance?.compactMode || false}
                    onChange={(e) => handleUpdateAppearance('compactMode', e.target.checked)}
                  />
                </div>

              </div>
            </div>
          )}

          {/* 3. Notification switches */}
          {activeCategory === 'notifications' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Notifications Preference</span>
              
              <div className="space-y-3">
                {([
                  { key: 'email', title: 'Email Updates', desc: 'Receive project milestone activity reports in your email box.' },
                  { key: 'push', title: 'Push Alerts', desc: 'Enable native browser notifications.' },
                  { key: 'inApp', title: 'In-App Alerts', desc: 'Show alert markers inside application navigation header.' },
                  { key: 'aiSuggestions', title: 'AI Coaching tips', desc: 'Receive suggested actions from Career Coach.' },
                  { key: 'dsaReminders', title: 'Daily DSA streak reminder', desc: 'Alerts when solve streaks are about to reset.' },
                  { key: 'interviewReminders', title: 'Mock Interview notifications', desc: 'Receive schedule reminder updates.' },
                ] as const).map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between p-3.5 border border-border/30 rounded-xl bg-secondary/10 text-xs">
                    <div>
                      <span className="font-bold text-foreground block">{opt.title}</span>
                      <span className="text-[10px] text-gray-500 leading-normal block mt-0.5">{opt.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary shrink-0"
                      checked={settings.notifications?.[opt.key] || false}
                      onChange={() => handleToggleNotification(opt.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Privacy */}
          {activeCategory === 'privacy' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Privacy Settings</span>
              
              <div className="space-y-3">
                
                {/* Visibility select */}
                <div className="flex items-center justify-between p-3.5 border border-border/30 rounded-xl bg-secondary/10 text-xs">
                  <div>
                    <span className="font-bold text-foreground block">Portfolio Visibility</span>
                    <span className="text-[10px] text-gray-500 mt-0.5 block">Define accessibility scope for generated portfolios.</span>
                  </div>
                  <select
                    className="bg-card border border-border/40 p-1.5 rounded text-xs focus:outline-none"
                    value={settings.privacy?.portfolioVisibility || 'public'}
                    onChange={(e) => saveMutation.mutate({
                      privacy: {
                        ...settings.privacy,
                        portfolioVisibility: e.target.value as any,
                      },
                    })}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {([
                  { key: 'publicProfile', title: 'Search Indexing public profile', desc: 'Allow search engines (Google, Bing) to index your public portfolio slug.' },
                  { key: 'analyticsSharing', title: 'Share Analytics data', desc: 'Share telemetry logs to improve platform performance.' },
                  { key: 'aiDataUsage', title: 'AI training queries', desc: 'Use chat queries to compile local recommendations.' },
                ] as const).map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between p-3.5 border border-border/30 rounded-xl bg-secondary/10 text-xs">
                    <div>
                      <span className="font-bold text-foreground block">{opt.title}</span>
                      <span className="text-[10px] text-gray-500 leading-normal block mt-0.5">{opt.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary shrink-0"
                      checked={settings.privacy?.[opt.key] || false}
                      onChange={() => handleTogglePrivacy(opt.key)}
                    />
                  </div>
                ))}

              </div>
            </div>
          )}

          {/* 5. Security */}
          {activeCategory === 'security' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Security & Credentials</span>
              
              <div className="space-y-4 text-xs max-w-md">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Change Password</label>
                  <input
                    type="password"
                    placeholder="Enter new account password"
                    className="w-full bg-secondary/35 border border-border/50 p-2.5 rounded-lg focus:outline-none focus:border-primary/45 text-foreground"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => {
                    setNewPassword('');
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                  }}
                  disabled={!newPassword}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  Change Password
                </button>
              </div>
            </div>
          )}

          {/* 6. AI Preferences */}
          {activeCategory === 'ai' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Gemini AI Settings</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Tone select */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Coach Tone</label>
                  <select
                    className="w-full bg-secondary/35 border border-border/50 p-2.5 rounded-lg focus:outline-none text-foreground"
                    value={settings.aiPreferences?.tone || 'professional'}
                    onChange={(e) => handleUpdateAI('tone', e.target.value)}
                  >
                    <option value="casual">Casual Mentor</option>
                    <option value="professional">Professional Consultant</option>
                    <option value="technical">Technical Auditor</option>
                  </select>
                </div>

                {/* Length select */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Response Length</label>
                  <select
                    className="w-full bg-secondary/35 border border-border/50 p-2.5 rounded-lg focus:outline-none text-foreground"
                    value={settings.aiPreferences?.responseLength || 'medium'}
                    onChange={(e) => handleUpdateAI('responseLength', e.target.value)}
                  >
                    <option value="short">Short (concise bullets)</option>
                    <option value="medium">Medium (standard roadmaps)</option>
                    <option value="long">Long (detailed audits)</option>
                  </select>
                </div>

                {/* Creativity Slider */}
                <div className="space-y-1.5 col-span-2 border border-border/20 p-3 rounded-lg bg-secondary/10">
                  <div className="flex justify-between">
                    <label className="font-semibold text-foreground">Creativity / Temperature ({settings.aiPreferences?.creativity ?? 0.7})</label>
                    <span className="text-[10px] text-gray-500">Lower for exact, structured JSON; higher for novel projects.</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full accent-primary"
                    value={settings.aiPreferences?.creativity ?? 0.7}
                    onChange={(e) => handleUpdateAI('creativity', parseFloat(e.target.value))}
                  />
                </div>

              </div>
            </div>
          )}

          {/* 7. Resume & Portfolio Preferences */}
          {activeCategory === 'resume' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Resume Defaults</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Default Template</label>
                  <select
                    className="w-full bg-secondary/35 border border-border/50 p-2.5 rounded-lg focus:outline-none text-foreground"
                    value={settings.resumePreferences?.defaultTemplate || 'Modern'}
                    onChange={(e) => handleUpdateResume('defaultTemplate', e.target.value)}
                  >
                    <option value="Modern">Modern Executive</option>
                    <option value="Minimal">Minimal Academic</option>
                    <option value="Tech">Developer Tech</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Default Font</label>
                  <select
                    className="w-full bg-secondary/35 border border-border/50 p-2.5 rounded-lg focus:outline-none text-foreground"
                    value={settings.resumePreferences?.defaultFont || 'Inter'}
                    onChange={(e) => handleUpdateResume('defaultFont', e.target.value)}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* 8. Portfolio */}
          {activeCategory === 'portfolio' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Portfolio Defaults</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Portfolio template style</label>
                  <select
                    className="w-full bg-secondary/35 border border-border/50 p-2.5 rounded-lg focus:outline-none text-foreground"
                    value={settings.portfolioPreferences?.defaultTemplate || 'Sleek'}
                    onChange={(e) => handleUpdatePortfolio('defaultTemplate', e.target.value)}
                  >
                    <option value="Sleek">Sleek Dark Mode</option>
                    <option value="Glass">Glassmorphism Grid</option>
                    <option value="Terminal">Terminal Retro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Default title SEO meta</label>
                  <input
                    type="text"
                    className="w-full bg-secondary/35 border border-border/50 p-2.5 rounded-lg focus:outline-none text-foreground"
                    value={settings.portfolioPreferences?.seoDefaults?.title || ''}
                    onChange={(e) => handleUpdatePortfolio('seoDefaults', {
                      ...settings.portfolioPreferences?.seoDefaults,
                      title: e.target.value,
                    })}
                  />
                </div>

              </div>
            </div>
          )}

          {/* 9. Integrations */}
          {activeCategory === 'integrations' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Third-party Integrations</span>
              
              <div className="space-y-3">
                {([
                  { key: 'github', label: 'GitHub Connection', icon: Github, desc: 'Sync repository metrics and project source codes.' },
                  { key: 'linkedin', label: 'LinkedIn Profile', icon: Linkedin, desc: 'Import work experience timeline.' },
                  { key: 'google', label: 'Google Credentials', icon: Chrome, desc: 'Used for single sign-on verification.' },
                ] as const).map((integ) => {
                  const Icon = integ.icon;
                  const isConnected = settings.integrations?.[integ.key] || false;
                  return (
                    <div key={integ.key} className="flex items-center justify-between p-3.5 border border-border/30 rounded-xl bg-secondary/10 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-card flex items-center justify-center border border-border/40 text-foreground">
                          <Icon size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-foreground block">{integ.label}</span>
                          <span className="text-[10px] text-gray-500">{integ.desc}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => saveMutation.mutate({
                          integrations: {
                            ...settings.integrations,
                            [integ.key]: !isConnected,
                          },
                        })}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                          isConnected
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                            : 'bg-primary text-primary-foreground border-primary/20 hover:opacity-90'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 10. Active Sessions */}
          {activeCategory === 'sessions' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Active Logged Devices</span>
              
              {sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No other active devices detected.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="flex items-center justify-between p-3 border border-border/30 bg-secondary/10 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-foreground block">{sess.userAgent || 'Unknown Device Browser'}</span>
                        <div className="text-[10px] text-gray-500 flex gap-2 mt-0.5">
                          <span>IP: {sess.ipAddress || '127.0.0.1'}</span>
                          <span>•</span>
                          <span>Last Active: {new Date(sess.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => revokeSessionMutation.mutate(sess.id)}
                        className="p-2 border border-destructive/20 hover:bg-destructive/10 text-destructive text-[10px] font-bold rounded-lg transition-colors"
                        title="Revoke session token"
                      >
                        Revoke Session
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 11. Data Management */}
          {activeCategory === 'data' && (
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/10 pb-2">Data & Danger Zone</span>
              
              <div className="space-y-4">
                
                {/* Export Data */}
                <div className="flex items-center justify-between p-3.5 border border-border/30 rounded-xl bg-secondary/10 text-xs">
                  <div>
                    <span className="font-bold text-foreground block">Export Stored Data</span>
                    <span className="text-[10px] text-gray-500">Download a full JSON copy of settings and sessions history.</span>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border/40 rounded-lg hover:bg-secondary/40 text-foreground text-xs font-semibold"
                  >
                    <Download size={13} />
                    <span>Download JSON</span>
                  </button>
                </div>

                {/* Clear AI History */}
                <div className="flex items-center justify-between p-3.5 border border-border/30 rounded-xl bg-secondary/10 text-xs">
                  <div>
                    <span className="font-bold text-foreground block">Clear AI History</span>
                    <span className="text-[10px] text-gray-500">Delete all your stored career coach conversations.</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete career coach conversations?')) {
                        wipeDataMutation.mutate('ai');
                      }
                    }}
                    disabled={wipeDataMutation.isPending}
                    className="px-3.5 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg text-xs font-bold transition-colors"
                  >
                    Wipe AI History
                  </button>
                </div>

                {/* Clear Analytics */}
                <div className="flex items-center justify-between p-3.5 border border-border/30 rounded-xl bg-secondary/10 text-xs">
                  <div>
                    <span className="font-bold text-foreground block">Wipe Analytics Logs</span>
                    <span className="text-[10px] text-gray-500">Delete all generated reports and progress snapshots.</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete analytics logs and reports?')) {
                        wipeDataMutation.mutate('analytics');
                      }
                    }}
                    disabled={wipeDataMutation.isPending}
                    className="px-3.5 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg text-xs font-bold transition-colors"
                  >
                    Wipe Analytics
                  </button>
                </div>

                {/* Account Deletion */}
                <div className="border border-destructive/20 bg-destructive/5 p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="text-destructive mt-0.5 shrink-0" size={16} />
                    <div>
                      <span className="font-bold text-foreground text-xs block">Danger Zone: Delete Account</span>
                      <span className="text-[10px] text-gray-500 leading-normal block mt-0.5">
                        This action will immediately wipe your account records, portfolios, resumes, and project trackers. This process cannot be undone.
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you absolutely sure you want to delete your DevTrack account? This cascade deletes all portfolio documents.')) {
                        deleteAccountMutation.mutate();
                      }
                    }}
                    disabled={deleteAccountMutation.isPending}
                    className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete My Account'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </Container>
  );
}
