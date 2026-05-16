jest.mock('@/utils/message.utils', () => ({
  normalizeBackendCharacter: jest.fn((char: unknown) => char),
  normalizeBackendCharacters: jest.fn((chars: unknown[]) => chars),
  normalizeBackendMessages: jest.fn((msgs: unknown[]) => msgs),
  mergeMessageCollection: jest.fn((prev: unknown[], next: unknown[]) => [...prev, ...next]),
  hasAssistantAudio: jest.fn(() => false),
}))

import { renderHook, waitFor } from '@testing-library/react'
import { useConversation } from '@/hooks/useConversationId'

const mockCharacter = {
  id: 'char-1',
  name: 'Einstein',
  description: 'Physicist',
  role: 'Scientist',
  biography: 'Born 1879',
}
const mockMessages = [
  { id: 1, role: 'user', content: 'Hello' },
  { id: 2, role: 'assistant', content: 'Hi there' },
]
const mockConversationResponse = {
  id: 'conv-1',
  mode: 'single',
  character: mockCharacter,
  messages: mockMessages,
}

describe('useConversation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockConversationResponse),
    })
  })

  it('immediately resolves with empty state when conversationId is null', async () => {
    const { result } = renderHook(() => useConversation(null))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.messages).toEqual([])
    expect(result.current.selectedCharacterId).toBeNull()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('starts in loading state when conversationId is provided', () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useConversation('conv-1'))
    expect(result.current.isLoading).toBe(true)
  })

  it('loads conversation data and sets character and messages', async () => {
    const { result } = renderHook(() => useConversation('conv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(global.fetch).toHaveBeenCalledWith('/api/conversations/conv-1')
    expect(result.current.selectedCharacterId).toBe('char-1')
    expect(result.current.characterName).toBe('Einstein')
    expect(result.current.messages).toHaveLength(2)
  })

  it('sets conversationMode from response', async () => {
    const { result } = renderHook(() => useConversation('conv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.conversationMode).toBe('single')
  })

  it('normalizes debate mode to "debate"', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ ...mockConversationResponse, mode: 'debate' }),
    })
    const { result } = renderHook(() => useConversation('conv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.conversationMode).toBe('debate')
  })

  it('normalizes non-debate mode to "single"', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ ...mockConversationResponse, mode: 'interview' }),
    })
    const { result } = renderHook(() => useConversation('conv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.conversationMode).toBe('single')
  })

  it('clears data when expectedMode does not match', async () => {
    const { result } = renderHook(() =>
      useConversation('conv-1', { expectedMode: 'debate' }),
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedCharacterId).toBeNull()
    expect(result.current.messages).toHaveLength(0)
  })

  it('isModeCompatible is true when expectedMode matches', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ ...mockConversationResponse, mode: 'debate' }),
    })
    const { result } = renderHook(() =>
      useConversation('conv-1', { expectedMode: 'debate' }),
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isModeCompatible).toBe(true)
  })

  it('isModeCompatible is true when no expectedMode is set', async () => {
    const { result } = renderHook(() => useConversation('conv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isModeCompatible).toBe(true)
  })

  it('handles HTTP error gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 })
    const { result } = renderHook(() => useConversation('conv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedCharacterId).toBeNull()
    expect(result.current.messages).toHaveLength(0)
  })

  it('handles network error gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network fail'))
    const { result } = renderHook(() => useConversation('conv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedCharacterId).toBeNull()
  })

  it('refetches when conversationId changes', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockConversationResponse),
    })
    global.fetch = fetchMock

    const { rerender } = renderHook(
      ({ id }) => useConversation(id),
      { initialProps: { id: 'conv-1' as string | null } },
    )
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    rerender({ id: 'conv-2' })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(fetchMock).toHaveBeenLastCalledWith('/api/conversations/conv-2')
  })

  it('exposes characterBiography from selected character', async () => {
    const { result } = renderHook(() => useConversation('conv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.characterBiography).toBe('Born 1879')
  })

  it('exposes availableCharacters with id and name', async () => {
    const { result } = renderHook(() => useConversation('conv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.availableCharacters).toEqual([
      { id: 'char-1', name: 'Einstein' },
    ])
  })
})
