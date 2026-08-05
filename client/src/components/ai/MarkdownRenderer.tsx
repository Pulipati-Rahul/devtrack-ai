import * as React from 'react';
import { CodeBlockRenderer } from './CodeBlockRenderer';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs leading-relaxed text-foreground">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code content
          const lines = part.slice(3, -3).trim().split('\n');
          const language = lines[0] && !lines[0].includes(' ') ? lines[0] : 'code';
          const code = language === 'code' ? lines.join('\n') : lines.slice(1).join('\n');
          return <CodeBlockRenderer key={index} language={language} code={code} />;
        }

        // Process standard text line by line to support bullet points and headers
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();

              // 1. Headers (e.g. ## Header)
              if (trimmed.startsWith('#')) {
                const level = (trimmed.match(/^#+/) || ['#'])[0].length;
                const headerText = trimmed.replace(/^#+\s*/, '');
                const HeaderTag = `h${Math.min(level + 1, 6)}` as keyof JSX.IntrinsicElements;
                return (
                  <HeaderTag key={lineIdx} className="font-bold text-foreground mt-2 mb-1">
                    {headerText}
                  </HeaderTag>
                );
              }

              // 2. Bullet list items (e.g. - Item or * Item)
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const listText = trimmed.substring(2);
                return (
                  <ul key={lineIdx} className="list-disc list-inside pl-2 space-y-0.5 text-muted-foreground">
                    <li>{renderBoldTokens(listText)}</li>
                  </ul>
                );
              }

              // 3. Regular text lines
              if (trimmed) {
                return (
                  <p key={lineIdx} className="text-muted-foreground leading-relaxed">
                    {renderBoldTokens(line)}
                  </p>
                );
              }

              return <div key={lineIdx} className="h-1.5" />;
            })}
          </div>
        );
      })}
    </div>
  );
}

// Render helper parsing double star bold tokens (**text**)
function renderBoldTokens(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// Attach helper
(MarkdownRenderer as any).renderBoldTokens = renderBoldTokens;
export default MarkdownRenderer;
