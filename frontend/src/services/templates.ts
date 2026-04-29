import api from './api';
import type { Template, GeneratedItemResponse, CreateTemplateDTO } from '../types';

export const getTemplates = async (): Promise<Template[]> => {
  const { data } = await api.get('/templates');
  return data;
};

export const getTemplate = async (id: string): Promise<Template> => {
  const { data } = await api.get('/templates');
  const template = data.find((t: Template) => t.id === id);
  if (!template) {
    throw new Error('Template not found');
  }
  return template;
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
  try {
    const { data } = await api.get(`/templates/${templateId}/items`);
    return data;
  } catch (error) {
    console.error('History endpoint not found, returning empty', error);
    return [];
  }
};
