'use client';

import * as React from 'react';
import { Icons } from '@/components/ui/icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Next.js caught layout error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="text-center space-y-4 max-w-md">
        <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
          <Icons.Warning size={24} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-display font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An error occurred while loading this page. Our logs have recorded this event.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow hover:opacity-90 transition-opacity"
        >
          <Icons.Spinner size={14} className="animate-spin" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
