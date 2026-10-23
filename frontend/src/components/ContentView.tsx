import type { ReactNode } from 'react';

// Only objects and arrays count as JSON; bare numbers/strings/booleans read better as text.
function parseJson(content: string): unknown | undefined {
  const trimmed = content.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

function highlight(json: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of json.matchAll(TOKEN)) {
    const [text, str, colon, bool] = match;
    const start = match.index!;
    if (start > last) nodes.push(json.slice(last, start));
    let cls: string;
    if (str) cls = colon ? 'text-sky-600 dark:text-sky-400' : 'text-emerald-600 dark:text-emerald-400';
    else if (bool) cls = 'text-purple-600 dark:text-purple-400';
    else if (text === 'null') cls = 'text-muted-foreground';
    else cls = 'text-amber-600 dark:text-amber-400';
    if (str && colon) {
      nodes.push(<span key={start} className={cls}>{str}</span>, colon);
    } else {
      nodes.push(<span key={start} className={cls}>{text}</span>);
    }
    last = start + text.length;
  }
  if (last < json.length) nodes.push(json.slice(last));
  return nodes;
}

export default function ContentView({ content }: { content: string }) {
  const parsed = parseJson(content);

  if (parsed === undefined) {
    return (
      <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed">
        {content}
      </div>
    );
  }

  return (
    <pre className="max-h-[60vh] overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed">
      {highlight(JSON.stringify(parsed, null, 2))}
    </pre>
  );
}
