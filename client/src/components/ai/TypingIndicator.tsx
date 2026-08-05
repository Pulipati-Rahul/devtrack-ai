import * as React from 'react';
import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[85%] mr-auto" role="status" aria-label="AI is typing">
      <div className="h-7 w-7 rounded-full bg-secondary border border-border/30 text-primary flex items-center justify-center shrink-0">
        <Sparkles size={13} className="animate-spin text-primary/60" style={{ animationDuration: '3s' }} />
      </div>

      <div className="bg-card border border-border/40 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1">
        <span className="h-1.5 w-1.5 bg-primary/75 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 bg-primary/75 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 bg-primary/75 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
export default TypingIndicator;
