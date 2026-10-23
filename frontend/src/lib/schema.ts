/** Parse the output-schema textarea. Empty => null (unconstrained); throws on invalid JSON or non-object. */
export function parseOutputSchema(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parsed = JSON.parse(trimmed);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Output schema must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

export function stringifyOutputSchema(schema: Record<string, unknown> | null): string {
  return schema ? JSON.stringify(schema, null, 2) : '';
}
