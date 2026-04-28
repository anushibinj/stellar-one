import { create } from 'zustand';
import { Template, GeneratedItemResponse } from '../types';

interface AppState {
  selectedTemplate: Template | null;
  generationLoading: boolean;
  generationResult: GeneratedItemResponse | null;
  templates: Template[];
  
  setSelectedTemplate: (template: Template | null) => void;
  setGenerationLoading: (loading: boolean) => void;
  setGenerationResult: (result: GeneratedItemResponse | null) => void;
  setTemplates: (templates: Template[]) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedTemplate: null,
  generationLoading: false,
  generationResult: null,
  templates: [],

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setGenerationLoading: (loading) => set({ generationLoading: loading }),
  setGenerationResult: (result) => set({ generationResult: result }),
  setTemplates: (templates) => set({ templates: templates }),
}));
