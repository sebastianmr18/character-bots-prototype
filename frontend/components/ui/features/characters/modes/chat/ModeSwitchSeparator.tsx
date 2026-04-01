import type React from "react"

interface ModeSwitchSeparatorProps {
  text: string
}

export const ModeSwitchSeparator: React.FC<ModeSwitchSeparatorProps> = ({ text }) => {
  return (
    <div className="flex items-center gap-3 py-1" role="separator" aria-label={text}>
      <div className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {text}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
