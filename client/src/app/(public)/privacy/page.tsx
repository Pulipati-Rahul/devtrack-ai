'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Container, PageHeader } from '@/components/layout/reusable';

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function PrivacyPage() {
  return (
    <Container className="py-12 max-w-4xl space-y-12">
      <motion.div {...fadeInUp}>
        <PageHeader
          title="Privacy Policy"
          description="Last Updated: August 3, 2026. This policy outlines how DevTrack AI collects, stores, and protects user data."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-card border border-border/40 p-8 rounded-xl space-y-6 shadow-sm text-xs sm:text-sm text-muted-foreground leading-relaxed"
      >
        <section className="space-y-3">
          <h2 className="font-display font-semibold text-sm sm:text-base text-foreground">1. Information Collection</h2>
          <p>
            We collect information necessary to deliver our developer metrics, resume builders, and portfolio hosting services. This includes account profile credentials (names, emails) and data sheets uploaded directly by the user (resumes, work histories, project tasks, and DSA problem records).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-semibold text-sm sm:text-base text-foreground">2. Data Usage & Security</h2>
          <p>
            Your information is stored securely in our PostgreSQL database using Neon Serverless encryption. Cryptographic session verification is managed through Better Auth cookies. We do not sell, trade, or distribute your resume files, profile values, or habit tracker logs to third-party recruitment agencies without your explicit consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-semibold text-sm sm:text-base text-foreground">3. AI Processing Policies</h2>
          <p>
            When using the Gemini-driven AI Career Coach or Mock Interview loops, relevant resume snippets or response contents are securely transmitted to Google API endpoints for scoring analysis. These requests are not used for public model training in accordance with enterprise data protection agreements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-semibold text-sm sm:text-base text-foreground">4. User Rights & Data Removal</h2>
          <p>
            You retain absolute ownership of your career profiles. You can edit, import, or delete resumes, projects, and DSA logs at any time. If you decide to terminate your account, you can request complete erasure of your identity data from our database servers.
          </p>
        </section>
      </motion.div>
    </Container>
  );
}
