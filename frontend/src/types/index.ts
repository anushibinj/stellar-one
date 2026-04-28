export interface Template {
  id: string;
  name: string;
  system_prompt: string;
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

export interface CreateTemplateDTO {
  name: string;
  system_prompt: string;
}
