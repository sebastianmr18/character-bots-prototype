import { renderHook, waitFor } from '@testing-library/react'
import { useCharacterById } from '@/hooks/useCharacterById'
import type { Character } from '@/types/chat.types'

const mockCharacter: Character = {
  id: 'char-1',
  name: 'Einstein',
  description: 'Physicist',
  role: 'scientist',
  biography: 'Born 1879',
}

describe('useCharacterById', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCharacter),
    } as Response)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useCharacterById('char-1'))
    expect(result.current.isLoading).toBe(true)
  })

  it('immediately resolves with no character when characterId is null', async () => {
    const { result } = renderHook(() => useCharacterById(null))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.character).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('fetches and normalizes the character on success', async () => {
    const { result } = renderHook(() => useCharacterById('char-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.character?.name).toBe('Einstein')
    expect(result.current.error).toBeNull()
    expect(global.fetch).toHaveBeenCalledWith('/api/characters/char-1')
  })

  it('sets an error message on HTTP error (non-ok response)', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 } as Response)
    const { result } = renderHook(() => useCharacterById('char-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.character).toBeNull()
    expect(result.current.error).toContain('404')
  })

  it('sets an error message on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useCharacterById('char-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.character).toBeNull()
    expect(result.current.error).toBe('Network error')
  })

  it('refetches when characterId changes', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCharacter),
    } as Response)
    global.fetch = fetchMock
    const { rerender } = renderHook(({ id }) => useCharacterById(id), {
      initialProps: { id: 'char-1' },
    })

    rerender({ id: 'char-2' })
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/characters/char-2')
    })
  })
})
