import { useStore } from '../store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SimilarityList() {
  const { generationResult, generationLoading } = useStore();

  if (generationLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!generationResult || generationResult.similar_items.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md bg-muted/10 text-muted-foreground text-xs italic">
        No similar items found in database.
      </div>
    );
  }

  const getIndicator = (score: number) => {
    if (score < 0.2) return { 
      color: 'border-red-500 bg-red-50 text-red-700', 
      label: 'Too Similar', 
      icon: <AlertCircle className="h-3 w-3" /> 
    };
    if (score < 0.4) return { 
      color: 'border-yellow-500 bg-yellow-50 text-yellow-700', 
      label: 'Borderline', 
      icon: <AlertTriangle className="h-3 w-3" /> 
    };
    return { 
      color: 'border-green-500 bg-green-50 text-green-700', 
      label: 'Good', 
      icon: <CheckCircle2 className="h-3 w-3" /> 
    };
  };

  return (
    <div className="space-y-2">
      {generationResult.similar_items.map((item, index) => {
        const indicator = getIndicator(item.score);
        return (
          <Card key={index} className={cn("border-l-4 transition-all hover:translate-x-1 shadow-sm", indicator.color)}>
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-1.5">
                <Badge variant="outline" className={cn("flex items-center gap-1 text-[10px] px-1.5 py-0 h-5", indicator.color)}>
                  {indicator.icon}
                  {indicator.label}
                </Badge>
                <span className="text-[10px] font-mono font-bold">
                  Score: {item.score.toFixed(4)}
                </span>
              </div>
              <p className="text-xs line-clamp-3 leading-relaxed">
                {item.content}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
