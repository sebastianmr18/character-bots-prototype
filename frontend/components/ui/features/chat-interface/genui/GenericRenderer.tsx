import type React from "react"
import type { MessageBlock } from "@/types/chat.types"
import { renderRegisteredComponent } from "./component-registry"

interface GenericRendererProps {
  blocks: MessageBlock[]
}

const UnknownBlockFallback: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="mt-2 rounded-lg border border-amber-300 bg-amber-100/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
      No pude renderizar el bloque de UI: {label}
    </div>
  )
}

export const GenericRenderer: React.FC<GenericRendererProps> = ({ blocks }) => {
  return (
    <div className="flex flex-col gap-2">
        <h2>Este es un renderizado generico</h2>
      {blocks.map((block, index) => {
        const blockKey = block.id ?? `${block.type}-${index}`

        if (block.type === "text") {
          return (
            <p key={blockKey} className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {block.content}
            </p>
          )
        }

        const renderedComponent = renderRegisteredComponent(block.componentName, block.props)
        if (!renderedComponent) {
          return <UnknownBlockFallback key={blockKey} label={block.componentName} />
        }

        return <div key={blockKey}>{renderedComponent}</div>
      })}
    </div>
  )
}
