/**
 * Constantes de conexión en tiempo real para chat y modo llamada.
 */

/** URL base del WebSocket de chat (incluye barra final). */
export const WS_URL = `${process.env.NEXT_PUBLIC_WS_BASE_URL}/ws/chat/`;

/** URL del WebSocket de audio en vivo (Gemini Live). */
export const LIVE_WS_URL = `${process.env.NEXT_PUBLIC_WS_BASE_URL}/live`;
