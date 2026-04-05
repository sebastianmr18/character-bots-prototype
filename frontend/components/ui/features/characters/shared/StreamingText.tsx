"use client"

import { useEffect, useMemo, useState } from "react"

interface StreamingTextProps {
  text: string
  animate?: boolean
}

const getStepSize = (textLength: number) => {
  if (textLength > 360) return 5
  if (textLength > 220) return 4
  if (textLength > 120) return 3
  if (textLength > 60) return 2
  return 1
}

export function StreamingText({ text, animate = false }: StreamingTextProps) {
  const [visibleLength, setVisibleLength] = useState(animate ? 0 : text.length)

  const stepSize = useMemo(() => getStepSize(text.length), [text.length])
  const isAnimating = animate && visibleLength < text.length

  useEffect(() => {
    if (!animate) {
      setVisibleLength(text.length)
      return
    }

    setVisibleLength(0)

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const tick = () => {
      if (cancelled) {
        return
      }

      setVisibleLength((current) => {
        const next = Math.min(text.length, current + stepSize)

        if (next < text.length) {
          timeoutId = setTimeout(tick, 100)
        }

        return next
      })
    }

    timeoutId = setTimeout(tick, 100)

    return () => {
      cancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [animate, stepSize, text])

  return (
    <>
      {text.slice(0, visibleLength)}
      {isAnimating && <span className="ml-0.5 inline-block h-[1em] w-[0.08em] animate-pulse bg-current align-[-0.15em]" aria-hidden="true" />}
    </>
  )
}