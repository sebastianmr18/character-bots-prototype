jest.mock('@/utils/message.utils', () => ({
  normalizeBackendCharacters: jest.fn((chars: unknown[]) => chars),
  normalizeBackendCharacter: jest.fn((char: unknown) => char),
  normalizeBackendMessages: jest.fn((msgs: unknown[]) => msgs),
  mergeMessageCollection: jest.fn((prev: unknown[], next: unknown[]) => [...prev, ...next]),
  hasAssistantAudio: jest.fn(() => false),
}))

import { renderHook, act, waitFor } from '@testing-library/react'
import { useCharacters } from '@/hooks/useCharacters'

const mockCharacters = [
  { id: 'char-1', name: 'Einstein', description: 'Physicist', role: 'Scientist', biography: 'Born 1879' },
  { id: 'char-2', name: 'Newton', description: 'Mathematician', role: 'Scientist', biography: 'Born 1642' },
]

describe('useCharacters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCharacters),
    })
  })

  it('starts with isLoading=true', () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useCharacters())
    expect(result.current.isLoading).toBe(true)
  })

  it('loads characters and sets isLoading=false', async () => {
    const { result } = renderHook(() => useCharacters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.availableCharacters).toHaveLength(2)
  })

  it('selects first character by default', async () => {
    const { result } = renderHook(() => useCharacters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedCharacterId).toBe('char-1')
  })

  it('restores selection from localStorage', async () => {
    localStorage.setItem('selected_character_id', 'char-2')
    const { result } = renderHook(() => useCharacters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedCharacterId).toBe('char-2')
  })

  it('ignores localStorage value if character no longer exists', async () => {
    localStorage.setItem('selected_character_id', 'deleted-char')
    const { result } = renderHook(() => useCharacters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedCharacterId).toBe('char-1')
  })

  it('uses preselectedCharacterId when it matches a loaded character', async () => {
    const { result } = renderHook(() => useCharacters('char-2'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedCharacterId).toBe('char-2')
  })

  it('ignores preselectedCharacterId when it does not match any character', async () => {
    const { result } = renderHook(() => useCharacters('nonexistent'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedCharacterId).toBe('char-1')
  })

  it('persists selection to localStorage', async () => {
    const { result } = renderHook(() => useCharacters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(localStorage.getItem('selected_character_id')).toBe('char-1')
  })

  it('uses custom storageKey when provided', async () => {
    const { result } = renderHook(() =>
      useCharacters(undefined, { storageKey: 'custom_key' }),
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(localStorage.getItem('custom_key')).toBe('char-1')
    expect(localStorage.getItem('selected_character_id')).toBeNull()
  })

  it('uses default storage key when storageKey is null', async () => {
    const { result } = renderHook(() =>
      useCharacters(undefined, { storageKey: null }),
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(localStorage.getItem('selected_character_id')).toBe('char-1')
  })

  it('handleCharacterChange updates selectedCharacterId and localStorage', async () => {
    const { result } = renderHook(() => useCharacters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleCharacterChange('char-2'))
    expect(result.current.selectedCharacterId).toBe('char-2')
    expect(localStorage.getItem('selected_character_id')).toBe('char-2')
  })

  it('sets selectedCharacterId=null when characters list is empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })
    const { result } = renderHook(() => useCharacters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedCharacterId).toBeNull()
  })

  it('handles fetch error gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 })
    const { result } = renderHook(() => useCharacters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.availableCharacters).toHaveLength(0)
    expect(result.current.selectedCharacterId).toBeNull()
  })

  it('refetches when refreshKey changes', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCharacters),
    })
    global.fetch = fetchMock

    const { rerender } = renderHook(
      ({ refreshKey }) => useCharacters(undefined, { refreshKey }),
      { initialProps: { refreshKey: 0 } },
    )
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    rerender({ refreshKey: 1 })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })
})
