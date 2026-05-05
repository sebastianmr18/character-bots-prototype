import { renderHook, act } from '@testing-library/react'
import type { Message } from '@/types/chat.types'
import { useAudioResolver } from '@/hooks/useAudioResolver'

jest.mock('@/utils/message.utils', () => ({
  normalizeBackendMessages: jest.fn((messages) => messages),
}))

describe('useAudioResolver', () => {
  const baseMessages: Message[] = [
    { id: 1, role: 'assistant', content: 'hola', audioUrl: 'https://local/audio.mp3', mediaType: 'audio/mpeg' },
    { id: 2, role: 'user', content: 'pregunta' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('returns nulls immediately when conversationId is missing', async () => {
    const setMessages = jest.fn()
    const { result } = renderHook(() => useAudioResolver(null, baseMessages, setMessages))

    let resolved
    await act(async () => {
      resolved = await result.current(1)
    })

    expect(resolved).toEqual({ audioUrl: null, mediaType: null })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns cached local audio when available and no forceRefresh', async () => {
    const setMessages = jest.fn()
    const { result } = renderHook(() => useAudioResolver('conv-1', baseMessages, setMessages))

    let resolved
    await act(async () => {
      resolved = await result.current(1)
    })

    expect(resolved).toEqual({
      audioUrl: 'https://local/audio.mp3',
      mediaType: 'audio/mpeg',
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fetches conversation and updates messages when forced', async () => {
    const setMessages = jest.fn((updater: (prev: Message[]) => Message[]) => updater(baseMessages))
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messages: [
          { id: 1, role: 'assistant', content: 'hola', audioUrl: 'https://remote/new.mp3', mediaType: 'audio/webm' },
        ],
      }),
    })

    const { result } = renderHook(() => useAudioResolver('conv-1', baseMessages, setMessages))

    let resolved
    await act(async () => {
      resolved = await result.current(1, true)
    })

    expect(fetch).toHaveBeenCalledWith('/api/conversations/conv-1', { cache: 'no-store' })
    expect(setMessages).toHaveBeenCalled()
    expect(resolved).toEqual({
      audioUrl: 'https://remote/new.mp3',
      mediaType: 'audio/webm',
    })
  })

  it('returns nulls when backend responds with non-ok status', async () => {
    const setMessages = jest.fn()
    ;(fetch as jest.Mock).mockResolvedValueOnce({ ok: false })
    const { result } = renderHook(() => useAudioResolver('conv-1', baseMessages, setMessages))

    let resolved
    await act(async () => {
      resolved = await result.current(2, true)
    })

    expect(resolved).toEqual({ audioUrl: null, mediaType: null })
    expect(setMessages).not.toHaveBeenCalled()
  })

  it('returns nulls when fetch throws', async () => {
    const setMessages = jest.fn()
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'))
    const { result } = renderHook(() => useAudioResolver('conv-1', baseMessages, setMessages))

    let resolved
    await act(async () => {
      resolved = await result.current(2, true)
    })

    expect(resolved).toEqual({ audioUrl: null, mediaType: null })
  })
})
