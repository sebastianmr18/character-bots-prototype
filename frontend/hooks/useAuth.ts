'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MeProfile } from '@/types/chat.types'

export type HeaderUser = {
  email?: string
  user_metadata?: {
    full_name?: string
    name?: string
  }
}

const PROFILE_CACHE_KEY = 'me_profile_v1'

const readCachedProfile = (): MeProfile | null => {
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MeProfile
  } catch {
    return null
  }
}

const writeCachedProfile = (profile: MeProfile | null) => {
  if (profile) {
    sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
    return
  }
  sessionStorage.removeItem(PROFILE_CACHE_KEY)
}

export const useAuth = () => {
  const router = useRouter()
  const [user, setUser] = useState<HeaderUser | null>(null)
  const [profile, setProfile] = useState<MeProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    const response = await fetch('/api/me', { cache: 'no-store' })

    if (!response.ok) {
      if (response.status === 401) {
        writeCachedProfile(null)
        setProfile(null)
      }
      return null
    }

    const data = (await response.json()) as MeProfile
    writeCachedProfile(data)
    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user as HeaderUser | null)

      if (user) {
        const cachedProfile = readCachedProfile()
        if (cachedProfile) {
          setProfile(cachedProfile)
        }
        await loadProfile()
      } else {
        writeCachedProfile(null)
        setProfile(null)
      }

      setIsLoading(false)
    }

    void loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as HeaderUser) ?? null)
      if (!session?.user) {
        writeCachedProfile(null)
        setProfile(null)
        setIsLoading(false)
        return
      }

      const cachedProfile = readCachedProfile()
      if (cachedProfile) {
        setProfile(cachedProfile)
      }

      void loadProfile().finally(() => setIsLoading(false))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const logout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    writeCachedProfile(null)
    setProfile(null)
    router.push('/login')
  }, [router])

  const role = profile?.role ?? null
  const isAdmin = role === 'admin'

  return { user, profile, role, isAdmin, isLoading, logout, refreshProfile: loadProfile }
}
