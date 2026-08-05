import * as React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background text-foreground transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 font-display font-semibold text-2xl text-primary justify-center">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            D
          </div>
          <span>DevTrack AI</span>
        </Link>
        <p className="text-xs text-muted-foreground">The growth workspace for technical developers</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 border border-border/40 shadow sm:rounded-xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
