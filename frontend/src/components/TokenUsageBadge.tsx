import type { TokenUsage } from '../types';

const fmt = (n: number | undefined) => (n === undefined ? 'NA' : n.toLocaleString());

export default function TokenUsageBadge({ usage }: { usage: TokenUsage | null | undefined }) {
  if (!usage) {
    return <div className="text-[10px] font-mono text-muted-foreground">tokens: NA</div>;
  }
  const { chat, embedding } = usage;
  const details = [
    chat && `chat in/out: ${fmt(chat.input_tokens)}/${fmt(chat.output_tokens)}`,
    chat?.output_reasoning_tokens !== undefined && `reasoning: ${fmt(chat.output_reasoning_tokens)}`,
    chat?.input_cache_read_tokens !== undefined && `cached: ${fmt(chat.input_cache_read_tokens)}`,
    embedding && `embedding: ${fmt(embedding.total_tokens ?? embedding.input_tokens)}`,
    usage.attempts.length > 1 && `${usage.attempts.length} attempts`,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-muted-foreground">
      <span className="font-semibold">tokens: {fmt(usage.total_tokens)}</span>
      {details.map((d) => (
        <span key={d}>{d}</span>
      ))}
    </div>
  );
}
