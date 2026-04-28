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
      <div className="container py-10 max-w-screen-xl animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="h-10 w-full bg-muted rounded mb-8" />
        <div className="h-[400px] w-full bg-muted rounded" />
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="container py-10 max-w-screen-xl text-center">
        <p className="text-destructive">Template not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-screen-xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => navigate('/')}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Templates
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{template.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">Template ID: {template.id.slice(0, 8)}...</Badge>
            <span className="text-sm text-muted-foreground">Created {new Date(template.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <Button 
          size="lg" 
          onClick={() => generateMutation.mutate()} 
          disabled={generationLoading}
          className="w-full md:w-auto shadow-lg shadow-primary/20"
        >
          {generationLoading ? (
            <span className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Item
            </span>
          )}
        </Button>
      </div>

      <Collapsible
        open={isPromptOpen}
        onOpenChange={setIsPromptOpen}
        className="mb-10 space-y-2 border rounded-lg p-4 bg-muted/30"
      >
        <div className="flex items-center justify-between space-x-4">
          <h4 className="text-sm font-semibold flex items-center">
            <Info className="mr-2 h-4 w-4" />
            System Prompt
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isPromptOpen ? 'Hide' : 'Show'}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="text-sm text-muted-foreground leading-relaxed">
          {template.system_prompt}
        </CollapsibleContent>
      </Collapsible>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              Generated Result
            </h2>
            <GeneratedResultCard />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <HistoryIcon className="mr-2 h-5 w-5" />
              Generation History
            </h2>
            <HistoryList history={history || []} isLoading={isHistoryLoading} />
          </section>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-6">Similarity Check</h2>
            <SimilarityList />
          </section>
        </div>
      </div>
    </div>
  );
}
