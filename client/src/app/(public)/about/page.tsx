'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Cpu, Database, Shield, Zap } from 'lucide-react';
import { Container, PageHeader } from '@/components/layout/reusable';

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function AboutPage() {
  const stack = [
    { icon: Cpu, title: 'Frontend Framework', desc: 'React 18 & Next.js 14 App Router, providing fast static pages and dynamic Client-side rendering.' },
    { icon: Database, title: 'Database Layer', desc: 'Drizzle ORM paired with a highly scalable Neon Serverless PostgreSQL database.' },
    { icon: Shield, title: 'Authentication', desc: 'Better Auth handling session tokens, password hashing, and cookie credentials securely.' },
    { icon: Zap, title: 'Backend Services', desc: 'Express.js runtime following Clean Architecture (Routes, Controllers, Services, Repositories).' }
  ];

  return (
    <Container className="py-12 space-y-12">
      <motion.div {...fadeInUp}>
        <PageHeader
          title="About DevTrack AI"
          description="DevTrack AI is built as a production-ready SaaS to help students and developers organize, track, and scale their career path."
        />
      </motion.div>

      {/* Mission & Vision Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border/40 p-8 rounded-xl space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Target size={18} />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">Our Mission</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            To eliminate the friction of career tracking for software engineers. By unifying portfolios, resumes, DSA tracking, and AI coaching into one unified interface, we allow developers to spend less time organizing and more time building and coding.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border/40 p-8 rounded-xl space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Eye size={18} />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">Our Vision</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            To become the core workspace driving technical careers globally. We aim to bridge the gap between learning progress and hiring loops, empowering engineers with verified data and intelligent coach insights to land their dream roles.
          </p>
        </motion.div>
      </div>

      {/* Technical Architecture */}
      <div className="space-y-6 pt-6">
        <div className="space-y-1.5 text-center md:text-left">
          <h2 className="text-xl font-display font-semibold text-foreground">Product Architecture Overview</h2>
          <p className="text-xs text-muted-foreground">Built with state-of-the-art technologies to guarantee fast loads, type safety, and security.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stack.map((tech) => {
            const Icon = tech.icon;
            return (
              <div key={tech.title} className="bg-card/50 border border-border/30 p-6 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center text-primary">
                    <Icon size={16} />
                  </div>
                  <h3 className="font-display font-semibold text-sm text-foreground">{tech.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{tech.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
