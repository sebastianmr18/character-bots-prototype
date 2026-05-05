jest.mock('@/lib/supabase/client')
jest.mock('next/navigation')

import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const mockPush = jest.fn()
const mockGetUser = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockSignOut = jest.fn()

const mockSupabaseClient = {
  auth: {
    getUser: mockGetUser,
    onAuthStateChange: mockOnAuthStateChange,
    signOut: mockSignOut,
  },
}

;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })

const mockProfile = { id: 'u1', username: 'test', role: 'user', createdAt: '2024-01-01' }
const mockAdminProfile = { id: 'u2', username: 'admin', role: 'admin', createdAt: '2024-01-01' }
const mockUser = { id: 'u1', email: 'test@test.com' }

const mockSubscription = { unsubscribe: jest.fn() }

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: mockSubscription } })
    mockGetUser.mockResolvedValue({ data: { user: null } })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    })
  })

  it('starts with isLoading=true', () => {
    mockGetUser.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useAuth())
    expect(result.current.isLoading).toBe(true)
  })

  it('sets isLoading=false and user=null when no session exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  it('fetches profile when user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(global.fetch).toHaveBeenCalledWith('/api/me', expect.any(Object))
    expect(result.current.profile).toEqual(mockProfile)
  })

  it('isAdmin is false when role is "user"', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAdmin).toBe(false)
  })

  it('isAdmin is true when role is "admin"', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAdminProfile),
    })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAdmin).toBe(true)
  })

  it('uses sessionStorage cache without re-fetching initially', async () => {
    sessionStorage.setItem('me_profile_v1', JSON.stringify(mockAdminProfile))
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAdminProfile),
    })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.profile?.role).toBe('admin')
  })

  it('clears profile on 401 from /api/me', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.profile).toBeNull()
  })

  it('calls signOut and redirects on logout', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockSignOut.mockResolvedValue(undefined)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => {
      await result.current.logout()
    })
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(result.current.profile).toBeNull()
  })

  it('unsubscribes from auth state changes on unmount', () => {
    const { unmount } = renderHook(() => useAuth())
    unmount()
    expect(mockSubscription.unsubscribe).toHaveBeenCalled()
  })

  it('updates user on onAuthStateChange SIGNED_IN', async () => {
    let capturedCallback: ((event: string, session: unknown) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb
      return { data: { subscription: mockSubscription } }
    })
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      capturedCallback!('SIGNED_IN', { user: mockUser })
      await Promise.resolve()
    })

    await waitFor(() => expect(result.current.user).not.toBeNull())
  })

  it('clears user on onAuthStateChange SIGNED_OUT', async () => {
    let capturedCallback: ((event: string, session: unknown) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb
      return { data: { subscription: mockSubscription } }
    })
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      capturedCallback!('SIGNED_OUT', null)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })
})
