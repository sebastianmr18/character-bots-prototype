"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Rastrea claves de entradas que deben animarse al aparecer por primera vez en una lista.
 *
 * @param entries - Elementos actuales.
 * @param getEntryKey - Función que devuelve clave estable por entrada.
 * @param shouldAnimateEntry - Filtra qué entradas nuevas animan.
 * @param resetKey - Al cambiar, reinicia el conjunto de claves ya animadas.
 * @returns Conjunto de claves pendientes de animación de entrada.
 */
export const useAnimatedEntryKeys = <T,>(
  entries: T[],
  getEntryKey: (entry: T) => string,
  shouldAnimateEntry: (entry: T) => boolean,
  resetKey?: string | null,
) => {
  const [animatedKeys, setAnimatedKeys] = useState<Set<string>>(() => new Set())
  const previousKeysRef = useRef<Set<string>>(new Set())
  const hasInitializedRef = useRef(false)
  const lastResetKeyRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    if (hasInitializedRef.current && lastResetKeyRef.current === resetKey) {
      return
    }

    hasInitializedRef.current = true
    lastResetKeyRef.current = resetKey
    previousKeysRef.current = new Set(entries.map(getEntryKey))
    setAnimatedKeys(new Set())
  }, [entries, getEntryKey, resetKey])

  useEffect(() => {
    const nextKeys = new Set(entries.map(getEntryKey))

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      previousKeysRef.current = nextKeys
      return
    }

    const newKeys = entries
      .filter((entry) => {
        const entryKey = getEntryKey(entry)
        return !previousKeysRef.current.has(entryKey) && shouldAnimateEntry(entry)
      })
      .map(getEntryKey)

    if (newKeys.length > 0) {
      setAnimatedKeys((prev) => {
        const next = new Set(prev)
        newKeys.forEach((key) => next.add(key))
        return next
      })
    }

    previousKeysRef.current = nextKeys
  }, [entries, getEntryKey, shouldAnimateEntry])

  return animatedKeys
}