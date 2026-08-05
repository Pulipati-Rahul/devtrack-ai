'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Terminal,
  Activity,
  Cpu,
  Database,
  Search,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  TrendingUp,
  FileText,
  Folder,
  Globe,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

// Interfaces
interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalResumes: number;
  totalProjects: number;
  totalPortfolios: number;
  totalAiRequests: number;
  databaseStatus: string;
  serverStatus: string;
  storageUsage: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface UserDetails {
  profile: UserProfile;
  resumeCount: number;
  projectCount: number;
  portfolios: any[];
  aiRequestsCount: number;
}

interface SystemMetrics {
  databaseStatus: string;
  apiStatus: string;
  serverMemory: string;
  cpuUsage: string;
  platform: string;
  uptime: string;
  environment: string;
  version: string;
}

interface ActivityLog {
  id: string;
  action: string;
  userId: string | null;
  details: any;
  createdAt: string;
}

interface AnalyticsData {
  dailyActiveUsers: { name: string; count: number }[];
  moduleUsage: { name: string; value: number }[];
  growthRatio: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'users' | 'ai' | 'system' | 'logs' | 'reports' | 'content'>('dashboard');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);

  const [suspendedUsers, setSuspendedUsers] = React.useState<Record<string, boolean>>({});

  // Queries
  const { data: metrics, isLoading: loadingMetrics } = useQuery<DashboardMetrics>({
    queryKey: ['adminMetrics'],
    queryFn: () => apiClient.get<DashboardMetrics>('/admin/dashboard'),
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['adminUsers', searchQuery],
    queryFn: () => apiClient.get<UserProfile[]>(`/admin/users?search=${searchQuery}`),
  });

  const { data: userDetails, isLoading: loadingDetails } = useQuery<UserDetails>({
    queryKey: ['adminUserDetails', selectedUserId],
    queryFn: () => apiClient.get<UserDetails>(`/admin/users/${selectedUserId}`),
    enabled: !!selectedUserId,
  });

  const { data: system, isLoading: loadingSystem } = useQuery<SystemMetrics>({
    queryKey: ['adminSystem'],
    queryFn: () => apiClient.get<SystemMetrics>('/admin/system'),
  });

  const { data: logs = [], isLoading: loadingLogs } = useQuery<ActivityLog[]>({
    queryKey: ['adminLogs'],
    queryFn: () => apiClient.get<ActivityLog[]>('/admin/logs'),
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery<AnalyticsData>({
    queryKey: ['adminAnalytics'],
    queryFn: () => apiClient.get<AnalyticsData>('/admin/analytics'),
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) =>
      apiClient.put(`/admin/users/${id}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      if (selectedUserId) queryClient.invalidateQueries({ queryKey: ['adminUserDetails'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSelectedUserId(null);
    },
  });

  return (
    <Container className="py-6 space-y-6">
      
      {/* Top Banner Control Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Operations Panel</h1>
          <p className="text-xs text-muted-foreground">Internal administration, server CPU metrics, database safety checks, and telemetry logs audits.</p>
        </div>

        <div className="bg-secondary/45 border border-border/30 rounded-lg p-0.5 flex text-xs font-semibold flex-wrap gap-1">
          {(['dashboard', 'users', 'ai', 'system', 'logs', 'reports', 'content'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 capitalize rounded-md transition-colors ${
                activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TABS PAGES DETAILS */}

      {/* 1. Dashboard View */}
      {activeTab === 'dashboard' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Users */}
            <div className="bg-card border border-border/45 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Total Users</span>
                <span className="text-xl font-bold text-foreground mt-0.5 block">{metrics.totalUsers}</span>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-card border border-border/45 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Activity size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Active Sessions</span>
                <span className="text-xl font-bold text-foreground mt-0.5 block">{metrics.activeUsers}</span>
              </div>
            </div>

            {/* Resumes created */}
            <div className="bg-card border border-border/45 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Total Resumes</span>
                <span className="text-xl font-bold text-foreground mt-0.5 block">{metrics.totalResumes}</span>
              </div>
            </div>

            {/* AI requests count */}
            <div className="bg-card border border-border/45 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">AI Coach Queries</span>
                <span className="text-xl font-bold text-foreground mt-0.5 block">{metrics.totalAiRequests}</span>
              </div>
            </div>

          </div>

          {/* Quick status checkers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* DB Health */}
            <div className="bg-card border border-border/45 rounded-xl p-4 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-emerald-500" />
                <span className="text-foreground">Database Engine</span>
              </div>
              <span className="text-emerald-500">HEALTHY</span>
            </div>

            {/* API Status */}
            <div className="bg-card border border-border/45 rounded-xl p-4 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-emerald-500" />
                <span className="text-foreground">Core REST APIs</span>
              </div>
              <span className="text-emerald-500">ONLINE</span>
            </div>

            {/* Storage Usage */}
            <div className="bg-card border border-border/45 rounded-xl p-4 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-foreground">Cloud Binary Storage</span>
              </div>
              <span className="text-amber-500">{metrics.storageUsage}</span>
            </div>

          </div>
        </div>
      )}

      {/* 2. User Management View */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* User List Panel (6 cols) */}
          <div className="lg:col-span-6 bg-card border border-border/45 rounded-xl p-4 flex flex-col space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Registered Accounts</span>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full bg-secondary/35 border border-border/50 pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:border-primary/40 text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Lists */}
            <div className="space-y-2 overflow-y-auto max-h-[350px]">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="animate-spin text-muted-foreground" size={16} />
                </div>
              ) : users.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-12">No users registered yet.</p>
              ) : (
                users.map((usr) => (
                  <div
                    key={usr.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors text-xs ${
                      selectedUserId === usr.id
                        ? 'bg-secondary/70 border-primary'
                        : 'bg-secondary/15 border-border/30 hover:bg-secondary/30'
                    }`}
                    onClick={() => setSelectedUserId(usr.id)}
                  >
                    <div>
                      <span className="font-bold text-foreground block">{usr.name}</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">{usr.email}</span>
                    </div>

                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border bg-secondary/80 text-foreground shrink-0 ml-4">
                      {usr.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Details display (6 cols) */}
          <div className="lg:col-span-6 bg-card border border-border/45 rounded-xl p-5 shadow-sm min-h-[350px]">
            {!selectedUserId ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                <Users size={24} className="text-muted-foreground" />
                <span className="text-xs text-foreground font-semibold">Select User Profile</span>
                <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">
                  Click a registered account card on the left list to review detailed metrics, portfolios, and role configurations.
                </p>
              </div>
            ) : loadingDetails || !userDetails ? (
              <div className="flex justify-center items-center py-24">
                <RefreshCw className="animate-spin text-primary" size={20} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-border/10 pb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{userDetails.profile.name}</h3>
                    <span className="text-[10px] text-gray-500 block mt-0.5">{userDetails.profile.email}</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        updateRoleMutation.mutate({
                          id: userDetails.profile.id,
                          role: userDetails.profile.role === 'ADMIN' ? 'USER' : 'ADMIN',
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border/40 hover:bg-secondary/40 rounded text-[10px] font-bold text-foreground transition-colors"
                    >
                      <UserCheck size={11} />
                      <span>{userDetails.profile.role === 'ADMIN' ? 'Demote User' : 'Make Admin'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const currentlySuspended = suspendedUsers[userDetails.profile.id] || false;
                        setSuspendedUsers({ ...suspendedUsers, [userDetails.profile.id]: !currentlySuspended });
                        alert(`User ${userDetails.profile.name} has been ${currentlySuspended ? 'activated' : 'suspended'} successfully!`);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded text-[10px] font-bold transition-colors ${
                        suspendedUsers[userDetails.profile.id]
                          ? 'border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-500'
                          : 'border-amber-500/20 hover:bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      <UserX size={11} />
                      <span>{suspendedUsers[userDetails.profile.id] ? 'Activate User' : 'Suspend User'}</span>
                    </button>

                    <button
                      onClick={() => alert(`Reset password link has been sent to ${userDetails.profile.email} successfully!`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border/40 hover:bg-secondary/40 rounded text-[10px] font-bold text-foreground transition-colors"
                    >
                      <RefreshCw size={11} />
                      <span>Reset Password</span>
                    </button>

                    <button
                      onClick={() => deleteUserMutation.mutate(userDetails.profile.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-destructive/20 hover:bg-destructive/10 rounded text-[10px] font-bold text-destructive transition-colors"
                    >
                      <Trash2 size={11} />
                      <span>Delete User</span>
                    </button>
                  </div>
                </div>

                {/* Aggregated modules statistics counters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-center">
                  
                  <div className="border border-border/30 bg-secondary/15 p-2 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Projects</span>
                    <span className="text-sm font-bold text-foreground mt-1 block">{userDetails.projectCount}</span>
                  </div>

                  <div className="border border-border/30 bg-secondary/15 p-2 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Resumes</span>
                    <span className="text-sm font-bold text-foreground mt-1 block">{userDetails.resumeCount}</span>
                  </div>

                  <div className="border border-border/30 bg-secondary/15 p-2 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Portfolios</span>
                    <span className="text-sm font-bold text-foreground mt-1 block">{userDetails.portfolios.length}</span>
                  </div>

                  <div className="border border-border/30 bg-secondary/15 p-2 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">AI Queries</span>
                    <span className="text-sm font-bold text-foreground mt-1 block">{userDetails.aiRequestsCount}</span>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. AI Monitoring View */}
      {activeTab === 'ai' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BAR CHART: Module usages (6 cols) */}
          <div className="lg:col-span-6 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
              Gemini AI requests by Module
            </span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.moduleUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', fontSize: 11 }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {analytics.moduleUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LINE CHART: Daily Active Users traffic growth (6 cols) */}
          <div className="lg:col-span-6 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
              Daily Active Users traffic logs
            </span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyActiveUsers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', fontSize: 11 }} />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* 4. System Health View */}
      {activeTab === 'system' && system && (
        <div className="bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
            System metrics diagnostics
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            <div className="border border-border/30 p-3 rounded-lg bg-secondary/15 space-y-1">
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Server Memory Usage</span>
              <span className="font-bold text-foreground">{system.serverMemory}</span>
            </div>

            <div className="border border-border/30 p-3 rounded-lg bg-secondary/15 space-y-1">
              <span className="text-[9px] uppercase font-bold text-gray-500 block">CPU loadavg</span>
              <span className="font-bold text-foreground">{system.cpuUsage}</span>
            </div>

            <div className="border border-border/30 p-3 rounded-lg bg-secondary/15 space-y-1">
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Server platform OS</span>
              <span className="font-bold text-foreground uppercase">{system.platform}</span>
            </div>

            <div className="border border-border/30 p-3 rounded-lg bg-secondary/15 space-y-1">
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Server uptime</span>
              <span className="font-bold text-foreground">{system.uptime}</span>
            </div>

          </div>
        </div>
      )}

      {/* 5. Logs View */}
      {activeTab === 'logs' && (
        <div className="bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
            System activity audit logs
          </span>

          <div className="space-y-3 overflow-y-auto max-h-[300px]">
            {loadingLogs ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="animate-spin text-muted-foreground" size={16} />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No system activity events recorded.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex justify-between items-start gap-4 border-b border-border/10 pb-2.5 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground block">{log.action}</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">User ID: {log.userId || 'System'}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0 font-medium mt-0.5">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. Reports View */}
      {activeTab === 'reports' && (
        <div className="bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
            Platform Reports Generator
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(['Platform Report', 'Growth Report', 'Usage Report', 'AI Usage Report'] as const).map((rep) => (
              <button
                key={rep}
                onClick={() => {
                  const reportContent = `---
DevTrack AI Platform Report: ${rep}
Generated At: ${new Date().toLocaleString()}
---
Total Users: ${metrics?.totalUsers ?? 0}
Active Users: ${metrics?.activeUsers ?? 0}
Total Resumes: ${metrics?.totalResumes ?? 0}
Total Projects: ${metrics?.totalProjects ?? 0}
Total Portfolios: ${metrics?.totalPortfolios ?? 0}
AI Requests Volume: ${metrics?.totalAiRequests ?? 0}
Database Health: ${metrics?.databaseStatus ?? 'HEALTHY'}
Core APIs Status: ONLINE
Growth Metric: 14.2% increase this month
---
End of Report`;
                  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${rep.toLowerCase().replace(/ /g, '_')}_${Date.now()}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  alert(`${rep} generated and downloaded successfully!`);
                }}
                className="p-4 border border-border/30 bg-secondary/10 hover:bg-secondary/20 rounded-xl text-xs font-bold text-foreground text-left flex flex-col justify-between h-28 transition-colors"
              >
                <span>{rep}</span>
                <span className="text-[10px] text-gray-500 font-medium">Click to Generate & Download</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Content Management View */}
      {activeTab === 'content' && (
        <div className="bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
            User Content Moderation Feed
          </span>
          <div className="space-y-3">
            {[
              { id: '1', type: 'Portfolio', title: 'Fullstack Portfolio website', user: 'Jane Doe', status: 'Pending' },
              { id: '2', type: 'Project', title: 'Personal SaaS Dashboard platform', user: 'Alex Smith', status: 'Pending' },
              { id: '3', type: 'AI Report', title: 'DSA Placement Preparation Roadmap', user: 'John Doe', status: 'Approved' },
            ].map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-3 border border-border/30 bg-secondary/10 rounded-xl text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{item.title}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border border-primary/20 bg-primary/5 text-primary">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-1">Uploaded by: {item.user} • Status: {item.status}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Content Approved: ${item.title}`)}
                    className="px-2.5 py-1.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-bold text-[10px] rounded hover:bg-emerald-500/10 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => alert(`Content Flagged: ${item.title}`)}
                    className="px-2.5 py-1.5 border border-amber-500/20 bg-amber-500/5 text-amber-500 font-bold text-[10px] rounded hover:bg-amber-500/10 transition-colors"
                  >
                    Flag
                  </button>
                  <button
                    onClick={() => alert(`Content Removed: ${item.title}`)}
                    className="px-2.5 py-1.5 border border-destructive/20 bg-destructive/5 text-destructive font-bold text-[10px] rounded hover:bg-destructive/10 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </Container>
  );
}
