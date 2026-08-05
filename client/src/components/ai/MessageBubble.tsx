import * as React from 'react';
import { User, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  isLoading?: boolean;
}

export function MessageBubble({ role, content, timestamp, isLoading }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
      role="log"
      aria-label={`${role} message`}
    >
      {/* Icon badge indicators */}
      <div
        className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${
          isUser
            ? 'bg-primary border-primary/20 text-primary-foreground'
            : 'bg-secondary border-border/30 text-primary'
        }`}
      >
        {isUser ? <User size={13} /> : <Sparkles size={13} className={isLoading ? 'animate-pulse' : ''} />}
      </div>

      {/* Bubble text content */}
      <div className="space-y-1">
        <div
          className={`p-3 rounded-2xl text-xs leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-card border border-border/40 text-foreground rounded-tl-none'
          }`}
        >
          {content}
          {isLoading && (
            <span className="inline-flex gap-1 items-center ml-2">
              <span className="h-1.5 w-1.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </div>
        {timestamp && (
          <span className={`text-[9px] text-gray-500 block ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
export default MessageBubble;
