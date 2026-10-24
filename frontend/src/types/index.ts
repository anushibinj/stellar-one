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

export interface TokenUsage {
  chat?: Record<string, number>;
  embedding?: Record<string, number>;
  total_tokens: number;
  attempts: unknown[];
}

export interface GeneratedItemResponse {
  content: string;
  chat_model: string;
  embedding_model: string;
  attempts: number;
  similar_items: SimilarItem[];
  token_usage: TokenUsage | null; // null = NA
}

export interface HistoryItem {
  id: string;
  template_id: string;
  content: string;
  chat_model: string | null;
  embedding_model: string | null;
  token_usage: TokenUsage | null; // null = NA
  created_at: string;
}

export interface CreateTemplateDTO {
  name: string;
  system_prompt: string;
  output_schema: Record<string, unknown> | null;
}
