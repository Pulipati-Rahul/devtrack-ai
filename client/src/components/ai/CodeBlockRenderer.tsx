import * as React from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockRendererProps {
  language?: string;
  code: string;
}

export function CodeBlockRenderer({ language = 'javascript', code }: CodeBlockRendererProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="border border-border/40 rounded-lg overflow-hidden bg-zinc-950 font-mono text-[10px] my-2 text-zinc-200">
      <div className="bg-zinc-900 px-3.5 py-1.5 flex justify-between items-center text-[9px] uppercase font-bold text-zinc-400">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={10} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
export default CodeBlockRenderer;
