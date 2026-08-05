'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6 max-w-md bg-card border border-border/40 p-8 rounded-2xl shadow-xl relative"
      >
        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/20">
          <ShieldAlert size={28} />
        </div>
        
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">Error 404</span>
          <h2 className="text-2xl font-display font-bold text-foreground">Page Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            The page you are looking for does not exist, has been moved, or resides behind authenticated route guards.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow hover:opacity-90 transition-opacity"
          >
            <Home size={12} />
            <span>Return Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
