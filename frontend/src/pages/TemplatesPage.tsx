import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getTemplates } from '../services/templates';
import { Button } from '@/components/ui/button';
import TemplateCard from '../components/TemplateCard';
import CreateTemplateModal from '../components/CreateTemplateModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function TemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: templates, isLoading, isError, refetch } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  return (
    <div className="container py-6 max-w-screen-xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your semantic generation templates.</p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton count={6} />
        </div>
      ) : isError ? (
        <div className="text-center py-10 border rounded-lg bg-muted/50">
          <p className="text-sm text-destructive">Error loading templates. Please try again.</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : templates?.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">No templates found. Create your first one!</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => setIsModalOpen(true)}>
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}

      <CreateTemplateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
