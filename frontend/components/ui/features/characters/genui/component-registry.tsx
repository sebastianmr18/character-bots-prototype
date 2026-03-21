import type React from "react"
import type { UIComponentName } from "@/types/chat.types"
import { InfoCard, parseInfoCardProps } from "./InfoCard"

type Renderer = (props: unknown) => React.ReactNode

const renderInfoCard: Renderer = (props) => {
  const parsedProps = parseInfoCardProps(props)
  if (!parsedProps) {
    return null
  }

  return <InfoCard {...parsedProps} />
}

const registry: Record<UIComponentName, Renderer> = {
  InfoCard: renderInfoCard,
}

export const renderRegisteredComponent = (componentName: string, props: unknown): React.ReactNode | null => {
  const renderer = registry[componentName as UIComponentName]
  if (!renderer) {
    return null
  }

  return renderer(props)
}
