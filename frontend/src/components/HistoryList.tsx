import { useState } from 'react';
import type { GeneratedItemResponse } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import CopyButton from './CopyButton';

interface HistoryListProps {
  history: GeneratedItemResponse[];
  isLoading: boolean;
}

export default function HistoryList({ history, isLoading }: HistoryListProps) {
  const [selected, setSelected] = useState<GeneratedItemResponse | null>(null);

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
    <>
      <ScrollArea className="h-[400px] pr-3">
        <div className="space-y-2">
          {history.map((item, index) => (
            <Card
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(item);
                }
              }}
              className="cursor-pointer hover:bg-muted/30 transition-colors shadow-sm"
            >
              <CardContent className="p-3 flex justify-between items-center gap-3">
                <p className="text-xs line-clamp-2 italic leading-relaxed">
                  "{item.content}"
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <CopyButton text={item.content} />
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block mb-0.5">
                      Attempts
                    </span>
                    <span className="text-base font-mono font-bold leading-none">
                      {item.attempts}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generated Content</DialogTitle>
            <DialogDescription>
              {selected?.attempts} {selected?.attempts === 1 ? 'attempt' : 'attempts'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed">
            {selected?.content}
          </div>
          <DialogFooter>
            {selected && <CopyButton text={selected.content} label="Click to copy" />}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
