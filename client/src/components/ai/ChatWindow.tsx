import * as React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  assistantName?: string;
}

export function ChatWindow({
  messages,
  onSendMessage,
  isLoading,
  placeholder = 'Type your message...',
  assistantName = 'AI Assistant',
}: ChatWindowProps) {
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages or loading state shifts
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-secondary/20 px-4 py-3 border-b border-border/30 flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">{assistantName}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Ready to assist" />
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-xs font-semibold text-foreground">Start a Conversation</span>
            <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">
              Ask questions about career advancement, resume ATS reviews, or coding challenges.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Message Bubble rendering Markdown */}
              <div className="space-y-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-secondary/40 border border-border/30 text-foreground rounded-tl-none'
                  }`}
                >
                  <MarkdownRenderer content={msg.content} />
                </div>
                {msg.createdAt && (
                  <span className={`text-[9px] text-gray-500 block ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={scrollRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-secondary/15 border-t border-border/35 flex gap-2">
        <input
          type="text"
          className="flex-1 bg-secondary/35 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/45"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          aria-label="Send message"
        >
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </button>
      </form>
    </div>
  );
}
export default ChatWindow;
