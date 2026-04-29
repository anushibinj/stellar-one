import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Terminal, Copy, Check, Code } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function GeneratedResultCard() {
  const { generationResult, generationLoading } = useStore();
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const copyToClipboard = () => {
    if (generationResult?.content) {
      navigator.clipboard.writeText(generationResult.content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (generationLoading) {
    return (
      <Card className="border-2 border-primary/20 shadow-sm overflow-hidden">
        <CardHeader className="bg-primary/5 pb-2 pt-3 px-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-3/4 mb-2" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!generationResult) {
    return (
      <Card className="border-dashed border-2 flex flex-col items-center justify-center py-10 text-muted-foreground bg-muted/20">
        <Terminal className="h-8 w-8 mb-2 opacity-20" />
        <p className="text-sm">No item generated yet. Click "Generate Item" to start.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="border-2 border-primary/50 shadow-md overflow-hidden ring-2 ring-primary/5">
        <CardHeader className="bg-primary/5 flex flex-row items-center justify-between pb-2 pt-3 px-4">
          <CardTitle className="text-base flex items-center">
            <Badge variant="outline" className="mr-2 font-mono text-[10px] px-1 py-0 h-5">
              {generationResult.attempts} {generationResult.attempts === 1 ? 'Attempt' : 'Attempts'}
            </Badge>
            Result
          </CardTitle>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowRaw(!showRaw)}
              className={cn("p-1.5 hover:bg-muted rounded-md transition-colors", showRaw && "bg-muted text-primary")}
              title="Toggle Raw JSON"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={copyToClipboard}
              className="p-1.5 hover:bg-muted rounded-md transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative">
            <blockquote className="text-sm font-medium leading-relaxed text-foreground italic">
              "{generationResult.content}"
            </blockquote>
            <div className="absolute -left-4 top-0 w-0.5 h-full bg-primary rounded-full opacity-50" />
          </div>
        </CardContent>
      </Card>

      {showRaw && (
        <Card className="bg-slate-950 text-slate-50 font-mono text-[10px] overflow-hidden">
          <CardHeader className="py-1.5 px-3 border-b border-slate-800 bg-slate-900">
            <span className="text-slate-400">raw_response.json</span>
          </CardHeader>
          <CardContent className="p-3">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(generationResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// I need to import cn
import { cn } from '@/lib/utils';
