// Mensaje legible de una respuesta fallida del motor de cálculo (Octave).
// Nunca devuelve HTML del servidor: solo el texto de la validación (422) o del error (500).
export async function engineErrorMessage(response, fallback = "No se pudo completar el cálculo.") {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) return fallback;
  const body = await response.json().catch(() => ({}));
  const detail = body.errors ? Object.values(body.errors).flat()[0] : null;
  return detail || body.error || body.message || fallback;
}
