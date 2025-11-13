import type { StatusDisplayConfig } from "../types/chat.types"

export const getStatusDisplay = (status: string): StatusDisplayConfig => {
  switch (status) {
    case "Conectado":
    case "Listo":
      return {
        color: "text-green-600 dark:text-green-400",
        icon: "●",
        bg: "bg-green-100 dark:bg-green-900/30",
      }
    case "Desconectado":
    case "Error de conexión":
      return {
        color: "text-red-600 dark:text-red-400",
        icon: "●",
        bg: "bg-red-100 dark:bg-red-900/30",
      }
    case "Grabando voz...":
      return {
        color: "text-orange-600 dark:text-orange-400",
        icon: "●",
        bg: "bg-orange-100 dark:bg-orange-900/30",
      }
    default:
      return {
        color: "text-blue-600 dark:text-blue-400",
        icon: "●",
        bg: "bg-blue-100 dark:bg-blue-900/30",
      }
  }
}
