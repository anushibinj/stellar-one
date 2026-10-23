import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { HistoryItem } from '../types';
import { deleteTemplateItem } from '../services/templates';
import { Button } from '@/components/ui/button';
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
import ContentView from './ContentView';
import ModelBadges from './ModelBadges';

interface HistoryListProps {
  templateId: string;
  history: HistoryItem[];
  isLoading: boolean;
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-destructive"
      title="Delete"
      aria-label="Delete"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

export default function HistoryList({ templateId, history, isLoading }: HistoryListProps) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HistoryItem | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deleteTemplateItem(templateId, itemId),
    onSuccess: (_data, itemId) => {
      queryClient.invalidateQueries({ queryKey: ['history', templateId] });
      if (selected?.id === itemId) setSelected(null);
      setPendingDelete(null);
      toast.success('Generation deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete generation');
      console.error(error);
    },
  });

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
          {history.map((item) => (
            <Card
              key={item.id}
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
                <div className="min-w-0 space-y-1">
                  <p className="text-xs line-clamp-2 italic leading-relaxed">
                    "{item.content}"
                  </p>
                  <ModelBadges chat_model={item.chat_model} embedding_model={item.embedding_model} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CopyButton text={item.content} />
                  <DeleteButton onClick={() => setPendingDelete(item)} />
                  <span className="text-[10px] font-mono text-muted-foreground text-right">
                    {format(new Date(item.created_at), 'MMM d, HH:mm')}
                  </span>
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
              {selected && format(new Date(selected.created_at), 'MMM d, yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <ModelBadges chat_model={selected.chat_model} embedding_model={selected.embedding_model} />
          )}
          {selected && <ContentView content={selected.content} />}
          <DialogFooter>
            {selected && (
              <Button variant="destructive" size="sm" onClick={() => setPendingDelete(selected)}>
                <Trash2 className="h-3.5 w-3.5" />
                <span className="ml-1">Delete</span>
              </Button>
            )}
            {selected && <CopyButton text={selected.content} label="Click to copy" />}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this generation?</DialogTitle>
            <DialogDescription>
              This permanently removes it from history, and it will no longer be used for uniqueness checks.
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs italic line-clamp-3">"{pendingDelete?.content}"</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
