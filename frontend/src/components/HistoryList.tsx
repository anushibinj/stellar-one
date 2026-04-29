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
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md bg-muted/5 text-muted-foreground text-xs">
        No history available for this template.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-3">
      <div className="space-y-2">
        {history.map((item, index) => (
          <Card key={index} className="hover:bg-muted/30 transition-colors shadow-sm">
            <CardContent className="p-3 flex justify-between items-center gap-3">
              <p className="text-xs line-clamp-2 italic leading-relaxed">
                "{item.content}"
              </p>
              <div className="text-right shrink-0">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block mb-0.5">
                  Attempts
                </span>
                <span className="text-base font-mono font-bold leading-none">
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
