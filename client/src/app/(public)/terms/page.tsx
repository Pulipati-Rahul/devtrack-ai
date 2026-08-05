'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Container, PageHeader } from '@/components/layout/reusable';

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function TermsPage() {
  return (
    <Container className="py-12 max-w-4xl space-y-12">
      <motion.div {...fadeInUp}>
        <PageHeader
          title="Terms of Service"
          description="Last Updated: August 3, 2026. Please read these terms carefully before utilizing the DevTrack AI SaaS workspace."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-card border border-border/40 p-8 rounded-xl space-y-6 shadow-sm text-xs sm:text-sm text-muted-foreground leading-relaxed"
      >
        <section className="space-y-3">
          <h2 className="font-display font-semibold text-sm sm:text-base text-foreground">1. Account Registration</h2>
          <p>
            By creating a DevTrack AI account, you agree to provide accurate and complete email profile details. You are responsible for keeping your login credentials confidential and monitoring all activities under your account session.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-semibold text-sm sm:text-base text-foreground">2. Code of Conduct</h2>
          <p>
            You agree to use DevTrack AI solely for legitimate career management, education progress logging, and professional portfolio hosting. You must not submit malicious codes, host spam materials on public portfolio slugs, or execute scripts designed to overload our database servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-semibold text-sm sm:text-base text-foreground">3. Platform Resources & Limits</h2>
          <p>
            We offer a Free Plan with standard limits (e.g. standard resumes, standard DSA logs, standard rate limits). Pro Plan packages (Coming Soon) are charged on a monthly subscription model. We reserve the right to modify pricing thresholds or rate-limiting rules to safeguard resources.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-semibold text-sm sm:text-base text-foreground">4. Service Terminations</h2>
          <p>
            We reserve the right to temporarily suspend or permanently terminate user accounts that violate our code of conduct, distribute spam, or compromise the database integrity of our platform.
          </p>
        </section>
      </motion.div>
    </Container>
  );
}
