'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Sparkles,
  ClipboardList,
  FolderKanban,
  Code2,
  HelpCircle,
  Bot,
  BarChart3,
  Settings,
  ArrowRight,
  CheckCircle,
  UserPlus,
  UserCheck,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { Container } from '@/components/layout/reusable';

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function PublicHomePage() {
  const features = [
    { icon: FileText, title: 'Resume Builder', desc: 'Craft clean, structured, markdown-supported resumes using modern templates.' },
    { icon: Sparkles, title: 'ATS Analyzer', desc: 'Audit resume copy against target job keywords to calculate exact compliance scores.' },
    { icon: ClipboardList, title: 'Project Tracker', desc: 'Manage engineering tasks, set priorities, track issues, and monitor progress.' },
    { icon: FolderKanban, title: 'Portfolio Manager', desc: 'Compile portfolio showcases and bundle project assets onto custom URLs.' },
    { icon: Code2, title: 'DSA Tracker', desc: 'Log solved problems across platforms, category topics, and revision lists.' },
    { icon: HelpCircle, title: 'Interview Prep', desc: 'Engage with AI-driven mock interviews and receive scoring feedback cards.' },
    { icon: Bot, title: 'AI Career Coach', desc: 'Interact with a Gemini-powered career coach for resume reviews and roadmaps.' },
    { icon: BarChart3, title: 'Analytics Insights', desc: 'Track daily habits, active DSA problem streaks, and task completions.' },
    { icon: Settings, title: 'Account Settings', desc: 'Configure customized notification thresholds, profile values, and privacy toggles.' }
  ];

  const steps = [
    { step: '01', icon: UserPlus, title: 'Create Account', desc: 'Sign up for a secure workspace. Free plan available instantly.' },
    { step: '02', icon: UserCheck, title: 'Build Profile', desc: 'Import skills, experience history, and define your target career roles.' },
    { step: '03', icon: TrendingUp, title: 'Track Progress', desc: 'Log solved DSA problems, audit resumes, and organize tasks.' },
    { step: '04', icon: Briefcase, title: 'Land Dream Job', desc: 'Leverage AI roadmaps and mock interviews to excel in tech loops.' }
  ];

  const testimonials = [
    { name: 'Alex Rivera', role: 'Full Stack Engineer', text: 'Having a single dashboard to manage my projects, ATS keywords, and daily DSA practice has completely changed how I organize my job hunt.', avatar: 'AR' },
    { name: 'Sarah Chen', role: 'Software Engineer II', text: 'The ATS Analyzer highlighted missing keywords on my resume that helped me get my first interview callback in months. Incredible platform.', avatar: 'SC' },
    { name: 'Marcus Brody', role: 'CS Student', text: 'DevTrack AI is my daily landing page. I track my LeetCode progress and prepare for behavioral loops using the AI Mock sessions.', avatar: 'MB' }
  ];

  return (
    <div className="space-y-24 py-16 overflow-hidden">
      {/* 1. Hero Section */}
      <Container>
        <div className="relative text-center space-y-6 max-w-4xl mx-auto">
          {/* Subtle decorative glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <motion.div
            {...fadeInUp}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>Platform Core Infrastructure Online</span>
          </motion.div>

          <motion.h1
            {...fadeInUp}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight leading-[1.1] text-foreground"
          >
            The growth workspace for <span className="text-primary">technical developers</span>
          </motion.h1>

          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Track daily data structure habits, audit resumes for ATS compatibility, manage portfolio showcases, and prepare for tech loops in one consolidated SaaS environment.
          </motion.p>

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-primary-foreground bg-primary rounded-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Get Started for Free
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/features"
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold hover:bg-secondary rounded-lg border border-border/40 transition-colors flex items-center justify-center"
            >
              Explore Features
            </Link>
          </motion.div>
        </div>
      </Container>

      {/* 2. Trusted By Section */}
      <div className="border-y border-border/20 py-8 bg-card/20">
        <Container>
          <p className="text-[10px] uppercase font-bold tracking-widest text-center text-muted-foreground mb-6">
            Empowering engineers worldwide at tech giants
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale select-none">
            <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-foreground">GOOGLE_MOCK</span>
            <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-foreground">META_MOCK</span>
            <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-foreground">AMAZON_MOCK</span>
            <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-foreground">STRIPE_MOCK</span>
          </div>
        </Container>
      </div>

      {/* 3. Features Section */}
      <Container>
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-display font-bold">Unifying your career metrics</h2>
            <p className="text-sm text-muted-foreground">Every module works together to organize, track, and showcase your development journey.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="bg-card border border-border/40 p-6 rounded-xl space-y-4 hover:border-primary/30 transition-all group"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-base text-foreground">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>

      {/* 4. How It Works Section */}
      <div className="bg-card/45 border-y border-border/20 py-20">
        <Container>
          <div className="space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-display font-bold">How DevTrack AI works</h2>
              <p className="text-sm text-muted-foreground">A clean, guided roadmap from signup to career success.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="space-y-4 text-center md:text-left relative">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 bg-primary/15 rounded-full flex items-center justify-center text-primary mx-auto md:mx-0">
                        <Icon size={20} />
                      </div>
                      <span className="text-3xl font-display font-extrabold text-border/40 hidden md:block">{step.step}</span>
                    </div>
                    <h3 className="font-display font-semibold text-base text-foreground">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </div>

      {/* 5. Screenshots / Visual Placer Section */}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold leading-tight">Structured UI design for high productivity</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ditch messy spreadsheets. Organize data-structure practice, audit resume drafts dynamically, and coordinate task logs in a single web dashboard designed for developers.
            </p>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary shrink-0" />
                <span>Responsive interface fully optimized for mobile devices</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary shrink-0" />
                <span>Dual theme layout supporting Dark and Light aesthetics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary shrink-0" />
                <span>Fast client-side routing using Next.js framework standards</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="h-4 flex gap-1.5 border-b border-border/20 pb-4 mb-4">
              <div className="h-2 w-2 rounded-full bg-red-500/80" />
              <div className="h-2 w-2 rounded-full bg-yellow-500/80" />
              <div className="h-2 w-2 rounded-full bg-green-500/80" />
            </div>
            
            {/* Mock Dashboard Layout */}
            <div className="space-y-4">
              <div className="h-8 bg-secondary/50 rounded-lg flex items-center justify-between px-3">
                <span className="text-[10px] font-bold text-primary">ATS AUDITOR SCORE</span>
                <span className="text-[10px] font-extrabold text-foreground">84 / 100</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-[84%] bg-primary rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-secondary/40 border border-border/20 p-3 rounded-lg text-center space-y-1">
                  <span className="block text-[9px] text-muted-foreground">STREAK</span>
                  <span className="block text-xs font-bold text-foreground">12 Days</span>
                </div>
                <div className="bg-secondary/40 border border-border/20 p-3 rounded-lg text-center space-y-1">
                  <span className="block text-[9px] text-muted-foreground">DSA SOLVED</span>
                  <span className="block text-xs font-bold text-foreground">148</span>
                </div>
                <div className="bg-secondary/40 border border-border/20 p-3 rounded-lg text-center space-y-1">
                  <span className="block text-[9px] text-muted-foreground">TASKS DONE</span>
                  <span className="block text-xs font-bold text-foreground">92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* 6. Testimonials Section */}
      <Container>
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-display font-bold">What engineers are saying</h2>
            <p className="text-sm text-muted-foreground">Review comments and feedback from our early developer test group.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div key={test.name} className="bg-card border border-border/40 p-6 rounded-xl flex flex-col justify-between shadow-sm">
                <p className="text-xs text-muted-foreground italic leading-relaxed mb-6">&ldquo;{test.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {test.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-tight">{test.name}</h4>
                    <span className="text-[10px] text-muted-foreground">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* 7. Pricing Section */}
      <Container>
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-display font-bold">Simple, transparent pricing</h2>
            <p className="text-sm text-muted-foreground">Start organized for free, and upgrade as you scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-card border border-border/40 p-8 rounded-2xl space-y-6 relative flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">Developer Free</h3>
                  <p className="text-xs text-muted-foreground mt-1">Perfect for tracking core metrics and getting organized.</p>
                </div>
                <div className="flex items-baseline text-foreground">
                  <span className="text-4xl font-extrabold tracking-tight">$0</span>
                  <span className="ml-1 text-xs text-muted-foreground">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" /><span>Up to 1 standard Resume</span></li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" /><span>Full DSA problem tracker log</span></li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" /><span>Basic ATS keyword parsing audits</span></li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" /><span>Task management project board</span></li>
                </ul>
              </div>
              <Link
                href="/register"
                className="w-full text-center py-2.5 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow hover:opacity-90 transition-opacity"
              >
                Sign Up for Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-card border border-primary/20 p-8 rounded-2xl space-y-6 relative flex flex-col justify-between shadow-lg">
              <div className="absolute top-4 right-4 bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Coming Soon
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">Engineering Pro</h3>
                  <p className="text-xs text-muted-foreground mt-1">Unlock advanced AI reviews, coach loops, and metrics.</p>
                </div>
                <div className="flex items-baseline text-foreground">
                  <span className="text-4xl font-extrabold tracking-tight">$9</span>
                  <span className="ml-1 text-xs text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" /><span>Unlimited resumes & portfolios</span></li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" /><span>Gemini-powered AI career coach loops</span></li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" /><span>Advanced ATS audit metrics charts</span></li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" /><span>Comprehensive AI resume rewrite suggestions</span></li>
                </ul>
              </div>
              <button
                disabled
                className="w-full py-2.5 text-xs font-semibold bg-secondary text-muted-foreground border border-border/40 rounded-lg cursor-not-allowed"
              >
                Join Waitlist (Pro)
              </button>
            </div>
          </div>
        </div>
      </Container>

      {/* 8. FAQ Preview Section */}
      <Container>
        <div className="bg-card/30 border border-border/40 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-display font-bold text-lg text-foreground">Have questions?</h3>
            <p className="text-xs text-muted-foreground">Read answers about ATS compatibility, DSA logging, and system support.</p>
          </div>
          <Link
            href="/faq"
            className="px-5 py-2.5 text-xs font-semibold bg-secondary hover:bg-secondary/70 border border-border/40 rounded-lg text-foreground transition-all flex items-center gap-2"
          >
            Read Full FAQ
            <ArrowRight size={12} />
          </Link>
        </div>
      </Container>

      {/* 9. Final CTA Section */}
      <Container>
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-16 text-center space-y-6 max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Streamline your developer career loops</h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Create your account today and experience the complete engineering career dashboard metrics tracker.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex px-6 py-3 text-sm font-semibold text-primary-foreground bg-primary rounded-lg shadow-lg hover:opacity-90 transition-opacity"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
