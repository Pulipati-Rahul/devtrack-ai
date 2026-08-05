'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileText,
  Sparkles,
  ClipboardList,
  FolderKanban,
  Code2,
  HelpCircle,
  Bot,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

// Define TS contracts matching DashboardPayload from service
interface DashboardPayload {
  careerScore: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    suggestions: string[];
  };
  progressOverview: {
    activeProjects: number;
    totalResumes: number;
    dsaSolved: number;
    interviewSessions: number;
    taskCompletionRate: number;
  };
  resumeWidget: {
    count: number;
    latestResumeName: string | null;
    latestResumeId: string | null;
    lastUpdated: string | null;
    atsScore: number | null;
  };
  dsaWidget: {
    streak: number;
    solvedToday: number;
    weeklyTarget: number;
    solvedTotal: number;
    distribution: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
  projectWidget: {
    activeCount: number;
    completedCount: number;
    totalCount: number;
    upcomingDeadlines: Array<{
      id: string;
      title: string;
      targetDate: string;
    }>;
  };
  interviewWidget: {
    sessionsCount: number;
    lastSessionDate: string | null;
    lastSessionScore: number | null;
    feedbackStatus: string | null;
  };
  aiRecommendations: string[];
  recentActivity: Array<{
    id: string;
    action: string;
    module: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Get local greeting string
  const greeting = React.useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const formattedDate = React.useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Fetch Dashboard Telemetry Data
  const { data, isLoading, isError, refetch } = useQuery<DashboardPayload>({
    queryKey: ['dashboardTelemetry'],
    queryFn: () => apiClient.get<DashboardPayload>('/analytics/dashboard'),
    retry: 1,
  });

  // Render Skeleton Loader
  if (isLoading) {
    return (
      <Container className="py-6 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-secondary rounded-lg w-1/3" />
          <div className="h-4 bg-secondary rounded-lg w-1/4" />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-secondary rounded-xl" />
          ))}
        </div>

        {/* Widgets Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-secondary rounded-xl md:col-span-1" />
          <div className="h-64 bg-secondary rounded-xl md:col-span-2" />
          <div className="h-64 bg-secondary rounded-xl md:col-span-1" />
          <div className="h-64 bg-secondary rounded-xl md:col-span-1" />
          <div className="h-64 bg-secondary rounded-xl md:col-span-1" />
        </div>
      </Container>
    );
  }

  // Render Error State
  if (isError || !data) {
    return (
      <Container className="py-12 flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6 shadow-lg">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto border border-destructive/20">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-display font-bold text-foreground">Dashboard Failed to Load</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We encountered a network error while fetching your dashboard metrics database details.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={12} />
            <span>Retry Connection</span>
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6 space-y-8">
      {/* 1. Welcome Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">
            {greeting}, <span className="text-primary">{user?.name || 'Developer'}</span>
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <Calendar size={12} />
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="text-emerald-500 font-medium">Core Workspace Connected</span>
          </p>
        </div>

        {/* Motivational Message */}
        <div className="hidden md:block bg-primary/5 border border-primary/20 rounded-xl px-4 py-2 text-right">
          <span className="block text-[10px] uppercase font-bold text-primary tracking-wider">DAILY MOTIVATION</span>
          <span className="text-xs text-muted-foreground italic">&ldquo;Consistency beats intensity. Make coding a habit.&rdquo;</span>
        </div>
      </div>

      {/* 2. Quick Actions Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link
          href="/resume"
          className="bg-card border border-border/40 hover:border-primary/30 p-4 rounded-xl shadow-sm text-center flex flex-col items-center gap-2 transition-all group"
        >
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <FileText size={16} />
          </div>
          <span className="text-xs font-semibold text-foreground">Create Resume</span>
        </Link>

        <Link
          href="/projects"
          className="bg-card border border-border/40 hover:border-primary/30 p-4 rounded-xl shadow-sm text-center flex flex-col items-center gap-2 transition-all group"
        >
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <ClipboardList size={16} />
          </div>
          <span className="text-xs font-semibold text-foreground">Add Project</span>
        </Link>

        <Link
          href="/dsa"
          className="bg-card border border-border/40 hover:border-primary/30 p-4 rounded-xl shadow-sm text-center flex flex-col items-center gap-2 transition-all group"
        >
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Code2 size={16} />
          </div>
          <span className="text-xs font-semibold text-foreground">Log DSA</span>
        </Link>

        <Link
          href="/interview"
          className="bg-card border border-border/40 hover:border-primary/30 p-4 rounded-xl shadow-sm text-center flex flex-col items-center gap-2 transition-all group"
        >
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <HelpCircle size={16} />
          </div>
          <span className="text-xs font-semibold text-foreground">Start Mock</span>
        </Link>

        <Link
          href="/ai"
          className="bg-card border border-border/40 hover:border-primary/30 p-4 rounded-xl shadow-sm text-center flex flex-col items-center gap-2 transition-all group col-span-2 sm:col-span-1"
        >
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Bot size={16} />
          </div>
          <span className="text-xs font-semibold text-foreground">Ask Coach</span>
        </Link>
      </div>

      {/* 3. Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Career Score & Profile Completeness Card */}
        <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp size={18} />
              <h3 className="font-display font-semibold text-sm">Career Score Index</h3>
            </div>
            
            {/* Score Circular Gauge */}
            <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" className="text-secondary" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-primary transition-all duration-1000"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.careerScore.current / 100)}`}
                />
              </svg>
              <div className="text-center">
                <span className="text-3xl font-display font-extrabold text-foreground">{data.careerScore.current}</span>
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">Index</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-muted-foreground">Previous: {data.careerScore.previous}</span>
              <span>•</span>
              <span className="flex items-center text-emerald-500 font-semibold gap-0.5">
                {data.careerScore.trend === 'up' ? <TrendingUp size={12} /> : null}
                <span>Stable Trend</span>
              </span>
            </div>
          </div>

          <Link
            href="/profile"
            className="w-full text-center py-2 text-xs font-semibold hover:bg-secondary rounded-lg border border-border/40 transition-colors flex items-center justify-center gap-1"
          >
            <span>Update Profile Detail</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* DSA Progress Widget */}
        <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-primary">
              <div className="flex items-center gap-2">
                <Code2 size={18} />
                <h3 className="font-display font-semibold text-sm">DSA Problem habits</h3>
              </div>
              <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold">
                {data.dsaWidget.streak} Day Streak
              </span>
            </div>

            {data.dsaWidget.solvedTotal === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">No DSA problems logged yet.</p>
                <Link
                  href="/dsa"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={12} />
                  <span>Log First Problem</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Solved Today:</span>
                  <span className="font-bold text-foreground">{data.dsaWidget.solvedToday} Problems</span>
                </div>
                
                {/* Solved difficulty distribution */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Difficulty Distribution</span>
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${data.dsaWidget.solvedTotal > 0 ? (data.dsaWidget.distribution.easy / data.dsaWidget.solvedTotal) * 100 : 0}%`,
                      }}
                      title={`Easy: ${data.dsaWidget.distribution.easy}`}
                    />
                    <div
                      className="bg-amber-500 h-full"
                      style={{
                        width: `${data.dsaWidget.solvedTotal > 0 ? (data.dsaWidget.distribution.medium / data.dsaWidget.solvedTotal) * 100 : 0}%`,
                      }}
                      title={`Medium: ${data.dsaWidget.distribution.medium}`}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{
                        width: `${data.dsaWidget.solvedTotal > 0 ? (data.dsaWidget.distribution.hard / data.dsaWidget.solvedTotal) * 100 : 0}%`,
                      }}
                      title={`Hard: ${data.dsaWidget.distribution.hard}`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Easy ({data.dsaWidget.distribution.easy})</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Medium ({data.dsaWidget.distribution.medium})</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Hard ({data.dsaWidget.distribution.hard})</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/dsa"
            className="w-full text-center py-2 text-xs font-semibold hover:bg-secondary rounded-lg border border-border/40 transition-colors flex items-center justify-center gap-1"
          >
            <span>View DSA Tracker</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Resume Tracker Widget */}
        <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <FileText size={18} />
              <h3 className="font-display font-semibold text-sm">Resumes & ATS Auditing</h3>
            </div>

            {data.resumeWidget.count === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">No resume drafts configured yet.</p>
                <Link
                  href="/resume"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={12} />
                  <span>Build Resume</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="bg-secondary/35 p-3 rounded-lg border border-border/20 space-y-1">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LATEST RESUME</span>
                  <span className="text-xs font-bold text-foreground block truncate">{data.resumeWidget.latestResumeName}</span>
                  {data.resumeWidget.lastUpdated && (
                    <span className="text-[10px] text-muted-foreground block">
                      Updated: {new Date(data.resumeWidget.lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <span className="text-xs text-muted-foreground">Latest ATS Match:</span>
                  <span className="text-xs font-extrabold text-primary">
                    {data.resumeWidget.atsScore ? `${data.resumeWidget.atsScore}%` : 'Not Checked'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/resume"
            className="w-full text-center py-2 text-xs font-semibold hover:bg-secondary rounded-lg border border-border/40 transition-colors flex items-center justify-center gap-1"
          >
            <span>Edit Resumes</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Project Tracker Summary Widget */}
        <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6 flex flex-col justify-between lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-primary">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} />
                <h3 className="font-display font-semibold text-sm">Projects & sprint Tasks</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Task completion: {data.progressOverview.taskCompletionRate}%
              </span>
            </div>

            {data.projectWidget.totalCount === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">No side projects logged in your workspace.</p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={12} />
                  <span>Log Project</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status Summary</span>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-secondary/35 rounded-lg border border-border/20">
                    <span className="text-muted-foreground">Active Projects:</span>
                    <span className="font-bold text-foreground">{data.projectWidget.activeCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-secondary/35 rounded-lg border border-border/20">
                    <span className="text-muted-foreground">Completed Projects:</span>
                    <span className="font-bold text-emerald-500">{data.projectWidget.completedCount}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Upcoming Deadlines</span>
                  {data.projectWidget.upcomingDeadlines.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic p-3 bg-secondary/15 rounded border border-dashed border-border/30">
                      No upcoming deadlines.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {data.projectWidget.upcomingDeadlines.map((dl) => (
                        <li key={dl.id} className="flex justify-between items-center text-xs p-2 bg-secondary/20 rounded border border-border/10">
                          <span className="truncate max-w-[150px] font-medium">{dl.title}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {new Date(dl.targetDate).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/projects"
            className="w-fit py-2 text-xs font-semibold text-primary hover:underline transition-colors flex items-center gap-1"
          >
            <span>Manage Project Boards</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* AI Recommendations List */}
        <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary border-b border-border/20 pb-3">
            <Bot size={18} />
            <h3 className="font-display font-semibold text-sm">AI Career Coach Tips</h3>
          </div>

          <ul className="space-y-3">
            {data.aiRecommendations.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Recent Activity Log Timeline */}
      <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-primary border-b border-border/20 pb-4">
          <Clock size={18} />
          <h3 className="font-display font-semibold text-sm">Recent Activity Logs</h3>
        </div>

        {data.recentActivity.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-4">No logged activity yet in this workspace.</p>
        ) : (
          <div className="relative border-l border-border/40 ml-2 pl-6 space-y-6">
            {data.recentActivity.map((log) => (
              <div key={log.id} className="relative">
                {/* Timeline Dot Indicator */}
                <div className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">{log.module}</span>
                  <p className="text-xs font-medium text-foreground">{log.action}</p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock size={9} />
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
