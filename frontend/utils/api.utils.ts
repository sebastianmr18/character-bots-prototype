/**
 * Obtiene un mensaje de error legible a partir de una respuesta `fetch` fallida.
 * Intenta leer `error` o `details` del cuerpo JSON; si no hay JSON, usa el código HTTP.
 *
 * @param response - Respuesta HTTP no exitosa.
 * @returns Texto de error para mostrar al usuario o registrar.
 */
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (typeof body?.error === 'string' && body.error.trim().length > 0) {
      return body.error
    }
    if (typeof body?.details === 'string' && body.details.trim().length > 0) {
      return body.details
    }
  } catch {
    return `HTTP ${response.status}`
  }
  return `HTTP ${response.status}`
}
