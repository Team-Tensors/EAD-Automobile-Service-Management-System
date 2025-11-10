import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderMarkdown = (text: string) => {
    // Split by newlines to handle line breaks
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      // Empty line
      if (line.trim() === '') {
        elements.push(<br key={`br-${index}`} />);
        return;
      }

      // Headers (##, ###)
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="font-bold text-base mt-2 mb-1">
            {processInlineMarkdown(line.replace(/^### /, ''))}
          </h3>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="font-bold text-lg mt-2 mb-1">
            {processInlineMarkdown(line.replace(/^## /, ''))}
          </h2>
        );
        return;
      }

      // Bullet points
      if (line.trim().startsWith('- ')) {
        elements.push(
          <div key={index} className="flex items-start ml-2 mb-1">
            <span className="mr-2 text-orange-400">•</span>
            <span>{processInlineMarkdown(line.replace(/^[\s-]*/, ''))}</span>
          </div>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={index} className="mb-1">
          {processInlineMarkdown(line)}
        </p>
      );
    });

    return elements;
  };

  const processInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold text **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before bold
        if (boldMatch.index > 0) {
          parts.push(
            <span key={key++}>
              {processLinks(remaining.substring(0, boldMatch.index))}
            </span>
          );
        }
        // Add bold text
        parts.push(
          <strong key={key++} className="font-semibold text-orange-300">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Italic text *text* or _text_
      const italicMatch = remaining.match(/[*_]([^*_]+)[*_]/);
      if (italicMatch && italicMatch.index !== undefined) {
        // Add text before italic
        if (italicMatch.index > 0) {
          parts.push(
            <span key={key++}>
              {processLinks(remaining.substring(0, italicMatch.index))}
            </span>
          );
        }
        // Add italic text
        parts.push(
          <em key={key++} className="italic">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
        continue;
      }

      // No more markdown, process remaining text for links
      parts.push(<span key={key++}>{processLinks(remaining)}</span>);
      break;
    }

    return parts;
  };

  const processLinks = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Markdown links [text](url)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && linkMatch.index !== undefined) {
        // Add text before link
        if (linkMatch.index > 0) {
          parts.push(remaining.substring(0, linkMatch.index));
        }
        // Add link
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline font-medium"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.substring(linkMatch.index + linkMatch[0].length);
        continue;
      }

      // No more links
      parts.push(remaining);
      break;
    }

    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
  };

  return (
    <div className="markdown-content text-sm leading-relaxed">
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;
