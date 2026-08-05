'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  FileText,
  Sparkles,
  FolderKanban,
  ClipboardList,
  Code2,
  HelpCircle,
  Bot,
  BarChart3,
  Settings
} from 'lucide-react';
import { Container, PageHeader } from '@/components/layout/reusable';

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function FeaturesPage() {
  const modules = [
    {
      icon: LayoutDashboard,
      title: 'Unified Dashboard',
      subtitle: 'Career Central Command',
      desc: 'Get a 360-degree view of your professional progress. Monitor current coding streaks, upcoming task deadlines, ATS compliance scorecards, and AI coach recommendations in one integrated board.'
    },
    {
      icon: User,
      title: 'Developer Profile',
      subtitle: 'Verified Engineering Identity',
      desc: 'Establish a comprehensive developer identity. Organize education, work experience, certifications, and technical skill lists. This profile acts as the core database driving all resume and portfolio builders.'
    },
    {
      icon: FileText,
      title: 'Resume Builder',
      subtitle: 'Markdown Template Compiler',
      desc: 'Craft clean, structured, markdown-supported resumes using modern templates. Import your profile details automatically, toggle standard sections, and export PDF sheets cleanly.'
    },
    {
      icon: Sparkles,
      title: 'ATS Analyzer',
      subtitle: 'Resume Keyword Auditor',
      desc: 'Audit resume copy against target job description keywords. Evaluate matching density, detect missing skills, and calculate exact compliance scores to bypass robotic screeners.'
    },
    {
      icon: FolderKanban,
      title: 'Portfolio Manager',
      subtitle: 'Asset Showcase Builder',
      desc: 'Showcase your engineering accomplishments. Compile descriptions of side-projects, connect repositories, add tech-stack tags, and bundle your portfolio onto customizable public URLs.'
    },
    {
      icon: ClipboardList,
      title: 'Project Tracker',
      subtitle: 'Task & Issue Boards',
      desc: 'Coordinate side project development. Create custom issue lists, write task logs, establish priorities (Low/Medium/High), update state progress bars, and link notes or resource attachments.'
    },
    {
      icon: Code2,
      title: 'DSA Habits Tracker',
      subtitle: 'Problem Practice Logger',
      desc: 'Log resolved problems across platforms (LeetCode, HackerRank, etc.). Categorize by difficulty levels (Easy/Medium/Hard) and topics, and configure spaced repetition review schedules.'
    },
    {
      icon: HelpCircle,
      title: 'Interview Preparation',
      subtitle: 'AI Mock Loop Sessions',
      desc: 'Engage with simulated behavioral or technical coding interviews. Receive question prompts, record answers, and obtain diagnostic feedback lists tracking ratings, strengths, and weaknesses.'
    },
    {
      icon: Bot,
      title: 'AI Career Coach',
      subtitle: 'Gemini Technical Assistant',
      desc: 'Interact with an intelligent tech recruiter bot. Request resume audits, formulate DSA learning roadmaps, ask mock loop questions, and refine your developer strategy.'
    }
  ];

  return (
    <Container className="py-12 space-y-12">
      <motion.div {...fadeInUp}>
        <PageHeader
          title="Developer Platform Features"
          description="DevTrack AI integrates nine specialized modules into one unified workspace, eliminating disconnected trackers and simplifying your path to tech loops."
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="bg-card border border-border/40 p-6 rounded-xl space-y-4 hover:border-primary/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Icon size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{mod.subtitle}</span>
                  <h3 className="font-display font-semibold text-base text-foreground mt-0.5">{mod.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Container>
  );
}
