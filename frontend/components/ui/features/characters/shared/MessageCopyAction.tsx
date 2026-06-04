/**
 * Message Copy Action: componente o módulo Message Copy Action.
 */
"use client"


/**
 * Componente o módulo Message Copy Action.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface MessageCopyActionProps {
  text: string
  className?: string
}

const COPIED_FEEDBACK_MS = 2000

const copyWithFallback = (text: string): boolean => {
  if (typeof document === "undefined") return false

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.left = "-9999px"

  document.body.appendChild(textarea)
  textarea.select()

  let copied = false
  try {
    copied = document.execCommand("copy")
  } finally {
    document.body.removeChild(textarea)
  }

  return copied
}

export function MessageCopyAction({ text, className }: MessageCopyActionProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const resetTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      let copied = false

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        copied = true
      } else {
        copied = copyWithFallback(text)
      }

      if (!copied) return

      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current)
      }

      setIsCopied(true)
      setIsTooltipOpen(true)

      resetTimeoutRef.current = window.setTimeout(() => {
        setIsCopied(false)
        setIsTooltipOpen(false)
      }, COPIED_FEEDBACK_MS)
    } catch (error) {
      console.error("[MessageCopyAction] Error copying text:", error)
    }
  }, [text])

  return (
    <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={className}
          onClick={handleCopy}
          aria-label="Copiar mensaje"
        >
          <Copy className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {isCopied ? "Copiado" : "Copiar"}
      </TooltipContent>
    </Tooltip>
  )
}