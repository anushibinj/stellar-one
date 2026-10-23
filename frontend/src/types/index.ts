export interface Template {
  id: string;
  name: string;
  system_prompt: string;
  output_schema: Record<string, unknown> | null;
  created_at: string;
}

export interface SimilarItem {
  content: string;
  score: number;
}

export interface GeneratedItemResponse {
  content: string;
  attempts: number;
  similar_items: SimilarItem[];
}

export interface HistoryItem {
  id: string;
  template_id: string;
  content: string;
  created_at: string;
}

export interface CreateTemplateDTO {
  name: string;
  system_prompt: string;
  output_schema: Record<string, unknown> | null;
}
