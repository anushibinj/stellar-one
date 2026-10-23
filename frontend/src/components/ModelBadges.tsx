import type { HistoryItem } from '../types';

type ModelBadgesProps = Pick<HistoryItem, 'chat_model' | 'embedding_model'>;

export default function ModelBadges({ chat_model, embedding_model }: ModelBadgesProps) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-muted-foreground">
      <span>chat: {chat_model ?? 'unknown'}</span>
      <span>embedding: {embedding_model ?? 'unknown'}</span>
    </div>
  );
}
