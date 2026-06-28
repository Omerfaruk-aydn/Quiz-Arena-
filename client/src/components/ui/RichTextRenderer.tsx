import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface RichTextRendererProps {
  html: string;
  className?: string;
}

function renderMath(html: string): string {
  const blockRegex = /\$\$([\s\S]+?)\$\$/g;
  const inlineRegex = /(?<!\\)\$([^\n$]+?)(?<!\\)\$/g;

  let result = html.replace(blockRegex, (_, expr: string) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `<code>${expr}</code>`;
    }
  });

  result = result.replace(inlineRegex, (_, expr: string) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<code>${expr}</code>`;
    }
  });

  return result;
}

export function RichTextRenderer({ html, className }: RichTextRendererProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = renderMath(html || '');
    }
  }, [html]);

  return <div ref={ref} className={className} />;
}
