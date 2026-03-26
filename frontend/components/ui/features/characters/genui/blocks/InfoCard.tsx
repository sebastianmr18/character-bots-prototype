import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface InfoCardItem {
  label: string
  value: string
}

export interface InfoCardProps {
  title: string
  description?: string
  items?: InfoCardItem[]
}

const isInfoCardItem = (item: unknown): item is InfoCardItem => {
  if (!item || typeof item !== "object") return false

  const { label, value } = item as Record<string, unknown>
  return typeof label === "string" && typeof value === "string"
}

export const parseInfoCardProps = (props: unknown): InfoCardProps | null => {
  if (!props || typeof props !== "object") return null

  const { title, description, items } = props as Record<string, unknown>
  if (typeof title !== "string" || title.trim().length === 0) return null

  const parsedItems = Array.isArray(items) ? items.filter(isInfoCardItem) : undefined

  return {
    title,
    description: typeof description === "string" ? description : undefined,
    items: parsedItems,
  }
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, description, items }) => {
  return (
    <Card className="mt-2 gap-4 border-blue-200 bg-blue-50/60 py-4 dark:border-blue-900 dark:bg-blue-950/30">
      <CardHeader className="gap-1 px-4">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>

      {items && items.length > 0 ? (
        <CardContent className="px-4">
          <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            {items.map((item) => (
              <div key={`${item.label}-${item.value}`} className="rounded-md bg-white/80 p-2 dark:bg-gray-900/40">
                <dt className="text-gray-500 dark:text-gray-400">{item.label}</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">{item.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      ) : null}
    </Card>
  )
}
