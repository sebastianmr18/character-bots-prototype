/**
 * Extracts a human-readable error message from a failed fetch Response.
 * Tries to read `error` or `details` from the JSON body; falls back to the HTTP status.
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
