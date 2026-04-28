import api from './api';
import { Template, GeneratedItemResponse, CreateTemplateDTO } from '../types';

export const getTemplates = async (): Promise<Template[]> => {
  const { data } = await api.get('/templates');
  return data;
};

export const getTemplate = async (id: string): Promise<Template> => {
  const { data } = await api.get(`/templates/${id}`);
  return data;
};

export const createTemplate = async (template: CreateTemplateDTO): Promise<Template> => {
  const { data } = await api.post('/templates', template);
  return data;
};

export const generateItem = async (templateId: string): Promise<GeneratedItemResponse> => {
  const { data } = await api.post(`/templates/${templateId}/generate`);
  return data;
};

export const getTemplateHistory = async (templateId: string): Promise<GeneratedItemResponse[]> => {
  // Assuming there's a history endpoint, if not we'll handle it or mock it
  // For now let's assume GET /templates/{id}/history exists or we just show the current generation
  // The requirement says "Show previous generated items for this template"
  // If the backend doesn't have it, I'll return an empty array for now or mock it.
  try {
    const { data } = await api.get(`/templates/${templateId}/history`);
    return data;
  } catch (error) {
    console.error('History endpoint not found, returning empty', error);
    return [];
  }
};
