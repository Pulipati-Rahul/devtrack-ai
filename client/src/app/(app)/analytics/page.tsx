'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Download,
  FileText,
  Code,
  Briefcase,
  Flame,
  Award,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

// Interfaces
interface DashboardData {
  careerScore: {
    current: number;
    previous: number;
    trend: string;
    suggestions: string[];
  };
  progressOverview: {
    activeProjects: number;
    totalResumes: number;
    dsaSolved: number;
    interviewSessions: number;
    taskCompletionRate: number;
  };
  aiRecommendations: string[];
  recentActivity: Array<{
    id: string;
    action: string;
    module: string;
    createdAt: string;
  }>;
}

interface ProjectsData {
  totalCount: number;
  completedCount: number;
  activeCount: number;
  techDistribution: { name: string; value: number }[];
  completionTrend: { name: string; date: string; status: string }[];
}

interface ResumeData {
  count: number;
  latestResumeName: string | null;
  lastUpdated: string | null;
  templateUsage: { name: string; value: number }[];
}

interface DsaData {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  topics: { name: string; value: number }[];
  platformDistribution: { name: string; value: number }[];
  revisionStats: {
    total: number;
    completed: number;
    pending: number;
  };
}

interface InterviewData {
  mockInterviews: number;
  avgScore: number;
  preparationTime: number;
  companiesPracticed: string[];
  categories: { name: string; value: number }[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [mounted, setMounted] = React.useState(false);
  const [timeFilter, setTimeFilter] = React.useState<'Week' | 'Month' | 'Year'>('Month');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all analytics datasets concurrently
  const { data: dashboard, isLoading: loadingDash, isError: errorDash } = useQuery<DashboardData>({
    queryKey: ['analyticsDashboard'],
    queryFn: () => apiClient.get<DashboardData>('/analytics/dashboard'),
  });

  const { data: projects, isLoading: loadingProj } = useQuery<ProjectsData>({
    queryKey: ['analyticsProjects'],
    queryFn: () => apiClient.get<ProjectsData>('/analytics/projects'),
  });

  const { data: resume, isLoading: loadingResume } = useQuery<ResumeData>({
    queryKey: ['analyticsResume'],
    queryFn: () => apiClient.get<ResumeData>('/analytics/resume'),
  });

  const { data: dsa, isLoading: loadingDsa } = useQuery<DsaData>({
    queryKey: ['analyticsDsa'],
    queryFn: () => apiClient.get<DsaData>('/analytics/dsa'),
  });

  const { data: interview, isLoading: loadingInterview } = useQuery<InterviewData>({
    queryKey: ['analyticsInterview'],
    queryFn: () => apiClient.get<InterviewData>('/analytics/interview'),
  });

  const [reportType, setReportType] = React.useState<'weekly' | 'monthly' | 'career' | 'resume' | 'interview'>('career');

  const { data: reports, refetch: refetchReports } = useQuery<any[]>({
    queryKey: ['analyticsReports'],
    queryFn: () => apiClient.get<any[]>('/analytics/reports'),
  });

  const { data: snapshots, refetch: refetchSnapshots } = useQuery<any[]>({
    queryKey: ['analyticsSnapshots'],
    queryFn: () => apiClient.get<any[]>('/analytics/snapshots'),
  });

  const generateReportMutation = useMutation({
    mutationFn: (type: string) => apiClient.post('/analytics/reports/generate', { reportType: type }),
    onSuccess: () => {
      refetchReports();
    },
  });

  const saveSnapshotMutation = useMutation({
    mutationFn: (type: string) => apiClient.post('/analytics/snapshots', { snapshotType: type }),
    onSuccess: () => {
      refetchSnapshots();
    },
  });

  // Export to CSV function
  const handleExportCSV = () => {
    if (!dashboard || !projects || !dsa || !interview) return;

    const rows = [
      ['Metric', 'Value'],
      ['Career Score', `${dashboard.careerScore.current}%`],
      ['Total Resumes', resume?.count || 0],
      ['Total Projects', projects.totalCount],
      ['Active Projects', projects.activeCount],
      ['Completed Projects', projects.completedCount],
      ['DSA Problems Solved', dsa.solved],
      ['Easy Problems', dsa.easy],
      ['Medium Problems', dsa.medium],
      ['Hard Problems', dsa.hard],
      ['Mock Interviews', interview.mockInterviews],
      ['Average Score', `${interview.avgScore}%`],
      ['Preparation Time (minutes)', interview.preparationTime],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'devtrack_career_analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF function (Triggers print preview styled for paper)
  const handleExportPDF = () => {
    window.print();
  };

  if (loadingDash || loadingProj || loadingResume || loadingDsa || loadingInterview) {
    return (
      <Container className="py-8 animate-pulse space-y-6">
        <div className="h-8 bg-secondary rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-secondary rounded-xl" />
          ))}
        </div>
        <div className="h-[400px] bg-secondary rounded-xl" />
      </Container>
    );
  }

  if (errorDash || !dashboard) {
    return (
      <Container className="py-12 flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Failed to compile Analytics</h3>
          <p className="text-xs text-muted-foreground">We couldn&apos;t load data from active developer modules.</p>
        </div>
      </Container>
    );
  }

  // Define dynamic Radar metric values
  const radarData = [
    { subject: 'DSA', A: dsa ? Math.min((dsa.solved / 20) * 100, 100) : 0 },
    { subject: 'Projects', A: projects ? Math.min((projects.totalCount / 5) * 100, 100) : 0 },
    { subject: 'Resumes', A: resume ? Math.min((resume.count / 3) * 100, 100) : 0 },
    { subject: 'Interviews', A: interview ? Math.min((interview.mockInterviews / 4) * 100, 100) : 0 },
    { subject: 'Career Score', A: dashboard.careerScore.current },
  ];

  // Completion trend mapping
  const areaData = [
    { name: 'Start', score: 20 },
    { name: 'DSA Solves', score: Math.min(100, 20 + (dsa ? dsa.solved * 2 : 0)) },
    { name: 'Projects Log', score: Math.min(100, 35 + (projects ? projects.totalCount * 4 : 0)) },
    { name: 'Resume Draft', score: Math.min(100, 50 + (resume ? resume.count * 5 : 0)) },
    { name: 'Mock Trials', score: dashboard.careerScore.current },
  ];

  return (
    <Container className="py-6 space-y-6 print:p-0">
      
      {/* Top Banner Control Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Career Analytics Dashboard</h1>
          <p className="text-xs text-muted-foreground">Consolidated performance metrics, study streaks, and developer competence trends.</p>
        </div>

        <div className="flex gap-2 text-xs">
          <div className="bg-secondary/45 border border-border/30 rounded-lg p-0.5 flex">
            {(['Week', 'Month', 'Year'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
                  timeFilter === filter ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border/50 rounded-lg text-xs font-semibold hover:bg-secondary/40 text-foreground"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <FileText size={13} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD OVERVIEW SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Career Score */}
        <div className="bg-card border border-border/45 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Career score</span>
          <span className="text-2xl font-bold mt-2 text-primary">{dashboard.careerScore.current}%</span>
          <div className="mt-1 text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
            <TrendingUp size={10} />
            <span>{dashboard.careerScore.trend.toUpperCase()}</span>
          </div>
        </div>

        {/* Resumes Completeness */}
        <div className="bg-card border border-border/45 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Resumes Drafted</span>
          <span className="text-2xl font-bold mt-2 text-foreground">{resume?.count || 0}</span>
          <span className="text-[9px] text-gray-500 font-medium">Latest: {resume?.latestResumeName || 'None'}</span>
        </div>

        {/* Projects logged */}
        <div className="bg-card border border-border/45 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Projects</span>
          <span className="text-2xl font-bold mt-2 text-foreground">
            {projects ? `${projects.completedCount}/${projects.totalCount}` : '0/0'}
          </span>
          <span className="text-[9px] text-emerald-500 font-semibold">{projects?.activeCount || 0} active logs</span>
        </div>

        {/* DSA solved */}
        <div className="bg-card border border-border/45 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">DSA Solved</span>
          <span className="text-2xl font-bold mt-2 text-foreground">{dsa?.solved || 0} solved</span>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-500 font-bold">
            <span className="text-emerald-500">{dsa?.easy}E</span>
            <span>•</span>
            <span className="text-amber-500">{dsa?.medium}M</span>
            <span>•</span>
            <span className="text-rose-500">{dsa?.hard}H</span>
          </div>
        </div>

        {/* Mocks complete */}
        <div className="bg-card border border-border/45 rounded-xl p-4 flex flex-col justify-between shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Mocks completed</span>
          <span className="text-2xl font-bold mt-2 text-foreground">{interview?.mockInterviews || 0} sessions</span>
          <span className="text-[9px] text-amber-500 font-bold">Avg score: {interview?.avgScore || 0}%</span>
        </div>

      </div>

      {/* RECHARTS PLOTS MATRIX */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AREA CHART: Career Score growth (8 cols) */}
          <div className="lg:col-span-8 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
              Career Score Progression
            </span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', fontSize: 11 }} />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RADAR CHART: Developer competency mapping (4 cols) */}
          <div className="lg:col-span-4 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
              Preparation Competence
            </span>
            <div className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="subject" stroke="#6b7280" style={{ fontSize: 9, fontWeight: 'bold' }} />
                  <PolarRadiusAxis stroke="#6b7280" style={{ fontSize: 8 }} />
                  <Radar name="Competence %" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BAR CHART: DSA platform Solves (6 cols) */}
          <div className="lg:col-span-6 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
              DSA Platforms distribution
            </span>
            <div className="h-60">
              {dsa && dsa.platformDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dsa.platformDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 10 }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', fontSize: 11 }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {dsa.platformDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-20">Solve coding challenges to see platforms usage.</p>
              )}
            </div>
          </div>

          {/* PIE CHART: Project Tech usage (6 cols) */}
          <div className="lg:col-span-6 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
              Project Technology Mix
            </span>
            <div className="h-60 flex justify-center items-center">
              {projects && projects.techDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projects.techDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projects.techDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', fontSize: 11 }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-20">Log tech keywords in projects to see distribution.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* LOWER SECTION: SYSTEM RECOMMENDATIONS & HISTORY LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        
        {/* RECOMMENDATIONS (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
            Learning Recommendations
          </span>
          <ul className="space-y-2.5">
            {dashboard.aiRecommendations.map((rec, i) => (
              <li key={i} className="text-xs flex items-start gap-2.5 leading-relaxed text-muted-foreground">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* TIMELINE ACTIVITIES (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
            Recent Activities
          </span>
          {dashboard.recentActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No recent activity logs recorded.</p>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {dashboard.recentActivity.map((activity) => (
                <div key={activity.id} className="text-xs flex justify-between gap-4 border-b border-border/10 pb-2">
                  <div>
                    <span className="font-semibold text-foreground block">{activity.action}</span>
                    <span className="text-[9px] uppercase bg-secondary/80 border border-border/20 px-1.5 py-0.5 rounded text-foreground font-semibold inline-block mt-1">
                      {activity.module}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0 font-medium mt-0.5">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* REPORTS AND SNAPSHOTS GENERATOR PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        
        {/* Generate Report & Snapshots Actions (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
            AI Report Generator & snapshots
          </span>

          <div className="space-y-3">
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Select Report Type</label>
              <select
                className="bg-secondary/40 border border-border/50 rounded-lg p-2 focus:outline-none focus:border-primary text-foreground w-full"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
              >
                <option value="weekly" className="bg-card">Weekly Performance Report</option>
                <option value="monthly" className="bg-card">Monthly Performance Report</option>
                <option value="career" className="bg-card">Career Progress Report</option>
                <option value="resume" className="bg-card">Resume Keyword Audit</option>
                <option value="interview" className="bg-card">Interview Readiness Report</option>
              </select>
            </div>

            <button
              onClick={() => generateReportMutation.mutate(reportType)}
              disabled={generateReportMutation.isPending}
              className="w-full bg-primary text-primary-foreground font-semibold rounded-lg p-2.5 hover:opacity-90 disabled:opacity-50 transition-opacity text-xs inline-flex items-center justify-center gap-1.5"
            >
              {generateReportMutation.isPending && <Loader2 size={13} className="animate-spin" />}
              <span>Compile AI Report</span>
            </button>
          </div>

          <div className="border-t border-border/20 pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-foreground block">System Snapshot</span>
                <span className="text-[9px] text-muted-foreground block">Capture daily scores metrics.</span>
              </div>
              <button
                onClick={() => saveSnapshotMutation.mutate('daily')}
                disabled={saveSnapshotMutation.isPending}
                className="bg-secondary hover:bg-secondary/80 border border-border/50 font-bold rounded-lg px-3 py-1.5 transition-colors inline-flex items-center gap-1 text-[10px] text-foreground"
              >
                {saveSnapshotMutation.isPending && <Loader2 size={10} className="animate-spin" />}
                <span>Take Snapshot</span>
              </button>
            </div>

            {/* List of snapshots */}
            {snapshots && snapshots.length > 0 && (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {snapshots.slice(0, 3).map((snap) => (
                  <div key={snap.id} className="p-2 bg-secondary/15 border border-border/30 rounded-lg flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{new Date(snap.createdAt).toLocaleDateString()} Snapshot</span>
                    <span className="font-bold text-primary">Score: {snap.scores.productivityScore || 0}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reports History logs lists (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border/45 rounded-xl p-5 shadow-sm space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-border/20 pb-2">
            Generated Reports archive
          </span>

          {!reports || reports.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-12">No reports compiled yet. Use the selector to compile your first report!</p>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {reports.map((rep) => (
                <div key={rep.id} className="p-3 bg-secondary/15 border border-border/30 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="font-bold text-foreground block">{rep.title}</span>
                      <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider block w-max mt-1">
                        {rep.reportType}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold shrink-0">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">{rep.summary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-border/10 pt-2 text-[10px]">
                    <div>
                      <span className="font-bold text-foreground block mb-1">Strengths</span>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                        {Array.isArray(rep.insights?.strengths) && rep.insights.strengths.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-foreground block mb-1">Improvement Suggestions</span>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                        {Array.isArray(rep.insights?.improvementSuggestions) && rep.insights.improvementSuggestions.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </Container>
  );
}
