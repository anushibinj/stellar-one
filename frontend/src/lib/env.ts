// Runtime props (written to /env.js when the container starts) win over
// build-time props baked in by Vite, so changing .env needs only a restart.
const runtime: Record<string, string | undefined> =
  (window as unknown as { __ENV__?: Record<string, string> }).__ENV__ ?? {}

export const env = {
  VITE_API_URL: runtime.VITE_API_URL || import.meta.env.VITE_API_URL,
}
