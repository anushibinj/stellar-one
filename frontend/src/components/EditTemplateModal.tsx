import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateTemplate } from '../services/templates';
import type { Template } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditTemplateModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTemplateModal({ template, isOpen, onClose, onSuccess }: EditTemplateModalProps) {
  const [name, setName] = useState(template.name);
  const [systemPrompt, setSystemPrompt] = useState(template.system_prompt);

  const mutation = useMutation({
    mutationFn: () => updateTemplate(template.id, { name: name.trim(), system_prompt: systemPrompt.trim() }),
    onSuccess: () => {
      toast.success('Template updated successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to update template');
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the name and system prompt. Existing generated items are kept.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-prompt">System Prompt</Label>
              <Textarea
                id="edit-prompt"
                className="min-h-[150px]"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
