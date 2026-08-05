'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Container, PageHeader } from '@/components/layout/reusable';

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

interface FAQItem {
  question: string;
  answer: string;
}

function AccordionItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border border-border/40 bg-card rounded-xl overflow-hidden shadow-sm transition-all duration-300">
      <button
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-secondary/40 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-display font-semibold text-sm text-foreground">{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground shrink-0 ml-4"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/10">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What is DevTrack AI?',
      answer: 'DevTrack AI is a centralized SaaS workspace designed for software engineers. It groups key career metrics (data structure logs, markdown resumes, task trackers, portfolios, and AI roadmaps) in a single dashboard to simplify career development and recruitment.'
    },
    {
      question: 'How does the ATS Analyzer compute scores?',
      answer: 'Our ATS Analyzer scans target job descriptions and extracts core technical keywords (skills, frameworks, concepts). It audits your uploaded resume draft, checks keyword density, flags missing components, and calculates a percentage matching score to help you clear screening loops.'
    },
    {
      question: 'Does the DSA Habits Tracker sync with LeetCode automatically?',
      answer: 'In the free tier, DSA logging is managed manually to encourage reflective problem documentation. You record the platform, difficulty level, topics, and notes. Spaced repetition lists calculate active schedules for review. Automated synchronizations are planned for future Pro releases.'
    },
    {
      question: 'Can I custom configure my public portfolio slug?',
      answer: 'Yes! The Portfolio Manager compiles active projects and links, allowing you to define a clean, customized URL slug (e.g., devtrack.ai/portfolio/your-username) that you can share with tech recruiters.'
    },
    {
      question: 'What AI tools are built into the platform?',
      answer: 'We utilize Google Gemini to drive: (1) AI Career Coach chats for resume audits, (2) Interview Preparation loops simulating behavioral prompts and rating answers, and (3) Automated suggestions for skills optimization.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. Authentication is driven by Better Auth utilizing cryptographic password hashing and strict HTTP Only SameSite session cookies. Your resume drafts and task logs are private to your account.'
    }
  ];

  return (
    <Container className="py-12 max-w-4xl space-y-12">
      <motion.div {...fadeInUp}>
        <PageHeader
          title="Frequently Asked Questions"
          description="Read through responses regarding platform features, data audits, security, and developer profiles."
        />
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <AccordionItem
            key={faq.question}
            item={faq}
            isOpen={openIndex === idx}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </Container>
  );
}
