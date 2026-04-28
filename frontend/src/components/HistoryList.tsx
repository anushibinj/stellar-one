import type { GeneratedItemResponse } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryListProps {
  history: GeneratedItemResponse[];
  isLoading: boolean;
}

export default function HistoryList({ history, isLoading }: HistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-muted/5 text-muted-foreground text-sm">
        No history available for this template.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {history.map((item, index) => (
          <Card key={index} className="hover:bg-muted/30 transition-colors">
            <CardContent className="p-4 flex justify-between items-center gap-4">
              <p className="text-sm line-clamp-2 italic leading-relaxed">
                "{item.content}"
              </p>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-1">
                  Attempts
                </span>
                <span className="text-lg font-mono font-bold leading-none">
                  {item.attempts}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
