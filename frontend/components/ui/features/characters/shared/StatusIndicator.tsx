/**
 * Muestra el estado de conexión o flujo con color e icono según `status.utils`.
 */

import type React from "react"
import { getStatusDisplay } from "@/utils/status.utils"

interface StatusIndicatorProps {
  status: string
}

/** Píldora de estado con estilos derivados de la etiqueta de texto. */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusDisplay = getStatusDisplay(status)

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusDisplay.bg} backdrop-blur-sm`}>
      <span className={`${statusDisplay.color} text-xs animate-pulse`}>{statusDisplay.icon}</span>
      <span className={`text-sm font-medium ${statusDisplay.color}`}>{status}</span>
    </div>
  )
}
