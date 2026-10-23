import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Sparkles, History as HistoryIcon, Info, Pencil } from 'lucide-react';
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
import EditTemplateModal from '../components/EditTemplateModal';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const { generationLoading, setGenerationLoading, setGenerationResult } = useStore();

  // Track the template currently being viewed so late responses for a
  // previously viewed template don't overwrite the current one.
  const currentIdRef = useRef(id);

  // Clear template-scoped state whenever the viewed template changes (and on unmount).
  useEffect(() => {
    currentIdRef.current = id;
    setGenerationResult(null);
    setGenerationLoading(false);
    setIsPromptOpen(false);
    setIsEditOpen(false);
    return () => {
      setGenerationResult(null);
      setGenerationLoading(false);
    };
  }, [id, setGenerationResult, setGenerationLoading]);

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
    mutationFn: (templateId: string) => {
      setGenerationLoading(true);
      return generateItem(templateId);
    },
    onSuccess: (data, templateId) => {
      queryClient.invalidateQueries({ queryKey: ['history', templateId] });
      if (currentIdRef.current !== templateId) return;
      setGenerationResult(data);
      toast.success('Item generated successfully');
    },
    onError: (error, templateId) => {
      if (currentIdRef.current !== templateId) return;
      toast.error('Generation failed');
      console.error(error);
    },
    onSettled: (_data, _error, templateId) => {
      if (currentIdRef.current !== templateId) return;
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
        <div className="flex w-full md:w-auto gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditOpen(true)}
          className="shadow-sm"
        >
          <Pencil className="mr-2 h-3 w-3" />
          <span className="text-xs">Edit</span>
        </Button>
        <Button 
          size="sm" 
          onClick={() => generateMutation.mutate(id!)}
          disabled={generationLoading}
          className="flex-1 md:flex-none shadow-sm shadow-primary/20"
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
      </div>

      {isEditOpen && (
        <EditTemplateModal
          template={template}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            queryClient.invalidateQueries({ queryKey: ['template', id] });
            queryClient.invalidateQueries({ queryKey: ['templates'] });
          }}
        />
      )}

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
          {template.output_schema && (
            <>
              <h5 className="font-semibold mt-3 mb-1">Output Schema</h5>
              <pre className="font-mono whitespace-pre-wrap">{JSON.stringify(template.output_schema, null, 2)}</pre>
            </>
          )}
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
            <HistoryList templateId={id!} history={history || []} isLoading={isHistoryLoading} />
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
