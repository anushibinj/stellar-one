import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Sparkles, History as HistoryIcon, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getTemplate, generateItem, getTemplateHistory } from '../services/templates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import GeneratedResultCard from '../components/GeneratedResultCard';
import SimilarityList from '../components/SimilarityList';
import HistoryList from '../components/HistoryList';
import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  
  const { generationLoading, setGenerationLoading, setGenerationResult } = useStore();

  const { data: template, isLoading: isTemplateLoading, isError } = useQuery({
    queryKey: ['template', id],
    queryFn: () => getTemplate(id!),
    enabled: !!id,
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['history', id],
    queryFn: () => getTemplateHistory(id!),
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: () => {
      setGenerationLoading(true);
      return generateItem(id!);
    },
    onSuccess: (data) => {
      setGenerationResult(data);
      toast.success('Item generated successfully');
      queryClient.invalidateQueries({ queryKey: ['history', id] });
    },
    onError: (error) => {
      toast.error('Generation failed');
      console.error(error);
    },
    onSettled: () => {
      setGenerationLoading(false);
    }
  });

  if (isTemplateLoading) {
    return (
      <div className="container py-6 max-w-screen-xl animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-3" />
        <div className="h-8 w-full bg-muted rounded mb-6" />
        <div className="h-[300px] w-full bg-muted rounded" />
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="container py-6 max-w-screen-xl text-center">
        <p className="text-sm text-destructive">Template not found.</p>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-screen-xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 -ml-2 text-muted-foreground h-8 text-xs"
        onClick={() => navigate('/')}
      >
        <ChevronLeft className="mr-1 h-3 w-3" />
        Back to Templates
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">ID: {template.id.slice(0, 8)}...</Badge>
            <span className="text-xs text-muted-foreground">Created {new Date(template.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => generateMutation.mutate()} 
          disabled={generationLoading}
          className="w-full md:w-auto shadow-sm shadow-primary/20"
        >
          {generationLoading ? (
            <span className="flex items-center text-xs">
              <Sparkles className="mr-2 h-3 w-3 animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center text-xs">
              <Sparkles className="mr-2 h-3 w-3" />
              Generate Item
            </span>
          )}
        </Button>
      </div>

      <Collapsible
        open={isPromptOpen}
        onOpenChange={setIsPromptOpen}
        className="mb-6 space-y-1 border rounded-md p-3 bg-muted/30"
      >
        <div className="flex items-center justify-between space-x-4">
          <h4 className="text-xs font-semibold flex items-center">
            <Info className="mr-2 h-3 w-3" />
            System Prompt
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
              {isPromptOpen ? 'Hide' : 'Show'}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="text-xs text-muted-foreground leading-relaxed mt-2">
          {template.system_prompt}
        </CollapsibleContent>
      </Collapsible>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-bold mb-3 flex items-center">
              Generated Result
            </h2>
            <GeneratedResultCard />
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 flex items-center">
              <HistoryIcon className="mr-2 h-4 w-4" />
              Generation History
            </h2>
            <HistoryList history={history || []} isLoading={isHistoryLoading} />
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-bold mb-3">Similarity Check</h2>
            <SimilarityList />
          </section>
        </div>
      </div>
    </div>
  );
}
