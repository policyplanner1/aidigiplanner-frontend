export async function checkApiHealth() {
  const response = await fetch("/health", {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!response.ok) {
    throw new Error(`API health check failed (${response.status}).`);
  }
  return response.json() as Promise<Record<string, string>>;
}
