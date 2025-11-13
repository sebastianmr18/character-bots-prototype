import type React from "react"
import { getStatusDisplay } from "@/utils/status.utils"

interface StatusIndicatorProps {
  status: string
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusDisplay = getStatusDisplay(status)

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusDisplay.bg} backdrop-blur-sm`}>
      <span className={`${statusDisplay.color} text-xs animate-pulse`}>{statusDisplay.icon}</span>
      <span className={`text-sm font-medium ${statusDisplay.color}`}>{status}</span>
    </div>
  )
}
