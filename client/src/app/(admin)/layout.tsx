import * as React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Admin header */}
      <header className="bg-red-950/20 border-b border-red-500/20 py-2 px-4 text-center text-xs font-semibold text-red-500 flex items-center justify-between">
        <span>⚠️ Administrator Access Controls</span>
        <Link href="/dashboard" className="underline hover:opacity-85">Return to App</Link>
      </header>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
