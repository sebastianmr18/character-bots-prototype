jest.mock('socket.io-client')
jest.mock('@/lib/supabase/client')
jest.mock('@/hooks/useMessagePolling')
jest.mock('@/constants/chat.constants', () => ({ WS_URL: 'http://test-ws/ws/chat/' }))

import { renderHook, act, waitFor } from '@testing-library/react'
import { io } from 'socket.io-client'
import { createClient } from '@/lib/supabase/client'
import { useMessagePolling } from '@/hooks/useMessagePolling'
import { useWebSocketChat } from '@/hooks/useWebSocket'

type Handler = (...args: unknown[]) => void

const socketHandlers = new Map<string, Handler[]>()
const mockEmit = jest.fn()
const mockDisconnect = jest.fn()
const mockConnect = jest.fn()
const mockSocket = {
  on: jest.fn((event: string, handler: Handler) => {
    if (!socketHandlers.has(event)) socketHandlers.set(event, [])
    socketHandlers.get(event)!.push(handler)
  }),
  emit: mockEmit,
  disconnect: mockDisconnect,
  connect: mockConnect,
  auth: {} as Record<string, string>,
}

const triggerSocketEvent = (event: string, ...args: unknown[]) => {
  socketHandlers.get(event)?.forEach((h) => h(...args))
}

const mockGetSession = jest.fn()
const mockRefreshSession = jest.fn()
;(createClient as jest.Mock).mockReturnValue({
  auth: { getSession: mockGetSession, refreshSession: mockRefreshSession },
})

const mockStartPolling = jest.fn()
const mockStopPolling = jest.fn()
;(useMessagePolling as jest.Mock).mockReturnValue({
  startPolling: mockStartPolling,
  stopPolling: mockStopPolling,
})

;(io as jest.Mock).mockReturnValue(mockSocket)

const defaultProps = {
  conversationId: 'conv-1',
  selectedCharacterId: 'char-1',
  onStatusChange: jest.fn(),
  onMessagesUpdate: jest.fn(),
  onTranscriptionResult: jest.fn(),
  onNoSpeech: jest.fn(),
  onSuggestionsReceived: jest.fn(),
}

describe('useWebSocketChat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    socketHandlers.clear()
    ;(io as jest.Mock).mockReturnValue(mockSocket)
    mockSocket.on.mockImplementation((event: string, handler: Handler) => {
      if (!socketHandlers.has(event)) socketHandlers.set(event, [])
      socketHandlers.get(event)!.push(handler)
    })
    ;(useMessagePolling as jest.Mock).mockReturnValue({
      startPolling: mockStartPolling,
      stopPolling: mockStopPolling,
    })
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'token-abc' } } })
    mockRefreshSession.mockResolvedValue({ data: { session: { access_token: 'refreshed-token' } } })
  })

  it('does not init socket when conversationId is null', () => {
    renderHook(() =>
      useWebSocketChat({ ...defaultProps, conversationId: null }),
    )
    expect(io).not.toHaveBeenCalled()
  })

  it('does not init socket when selectedCharacterId is null', () => {
    renderHook(() =>
      useWebSocketChat({ ...defaultProps, selectedCharacterId: null }),
    )
    expect(io).not.toHaveBeenCalled()
  })

  it('initializes socket and emits join_chat on connect', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => triggerSocketEvent('connect'))
    expect(mockEmit).toHaveBeenCalledWith('join_chat', 'conv-1')
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('Conectado')
  })

  it('updates status on system_message event', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => triggerSocketEvent('system_message', { content: 'Listo para chatear' }))
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('Listo para chatear')
  })

  it('sets isTyping=true on bot_typing event', async () => {
    const { result } = renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => triggerSocketEvent('bot_typing'))
    expect(result.current.isTyping).toBe(true)
  })

  it('calls onMessagesUpdate and sets isTyping=false on ai_message', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => triggerSocketEvent('bot_typing'))
    act(() =>
      triggerSocketEvent('ai_message', {
        id: 1,
        role: 'assistant',
        content: 'Hello',
        audioUrl: 'https://audio.test/1.mp3',
      }),
    )
    expect(defaultProps.onMessagesUpdate).toHaveBeenCalled()
  })

  it('starts polling when ai_message has no audioUrl', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() =>
      triggerSocketEvent('ai_message', { id: 1, role: 'assistant', content: 'Hello' }),
    )
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('Generando audio...')
  })

  it('calls onSuggestionsReceived on suggestions event', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() =>
      triggerSocketEvent('suggestions', { suggestions: ['option A', 'option B'] }),
    )
    expect(defaultProps.onSuggestionsReceived).toHaveBeenCalledWith(['option A', 'option B'])
  })

  it('ignores suggestions event when suggestions is not an array', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => triggerSocketEvent('suggestions', { suggestions: null }))
    expect(defaultProps.onSuggestionsReceived).not.toHaveBeenCalled()
  })

  it('calls onTranscriptionResult on transcription event', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => triggerSocketEvent('transcription', { text: 'Hello world' }))
    expect(defaultProps.onTranscriptionResult).toHaveBeenCalledWith('Hello world')
  })

  it('deduplicates identical transcription events within 1500ms', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => {
      triggerSocketEvent('transcription', { text: 'same text' })
      triggerSocketEvent('transcription', { text: 'same text' })
    })
    expect(defaultProps.onTranscriptionResult).toHaveBeenCalledTimes(1)
  })

  it('calls onNoSpeech on no_speech event', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => triggerSocketEvent('no_speech'))
    expect(defaultProps.onNoSpeech).toHaveBeenCalled()
  })

  it('updates status and sets isConnected=false on disconnect', async () => {
    const { result } = renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => triggerSocketEvent('connect'))
    expect(result.current.isConnected).toBe(true)

    act(() => triggerSocketEvent('disconnect'))
    expect(result.current.isConnected).toBe(false)
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('Desconectado')
  })

  it('sendMessage emits send_text and starts polling when connected', async () => {
    const { result } = renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())
    act(() => triggerSocketEvent('connect'))

    act(() => result.current.sendMessage('Hola'))
    expect(mockEmit).toHaveBeenCalledWith('send_text', {
      conversationId: 'conv-1',
      text: 'Hola',
      mode: 'interview',
    })
    expect(mockStartPolling).toHaveBeenCalled()
  })

  it('sendMessage does nothing when not connected', async () => {
    const { result } = renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    act(() => result.current.sendMessage('Hola'))
    expect(mockEmit).not.toHaveBeenCalledWith('send_text', expect.anything())
  })

  it('sendMessage ignores empty or whitespace-only text', async () => {
    const { result } = renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())
    act(() => triggerSocketEvent('connect'))

    act(() => result.current.sendMessage('   '))
    expect(mockEmit).not.toHaveBeenCalledWith('send_text', expect.anything())
  })

  it('sendAudioMessage emits send_audio when connected', async () => {
    const { result } = renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())
    act(() => triggerSocketEvent('connect'))

    act(() => result.current.sendAudioMessage('base64audiodata'))
    expect(mockEmit).toHaveBeenCalledWith('send_audio', expect.objectContaining({
      conversationId: 'conv-1',
      audioBase64: 'base64audiodata',
    }))
  })

  it('disconnects socket on unmount', async () => {
    const { unmount } = renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('retries connection on unauthorized connect_error', async () => {
    renderHook(() => useWebSocketChat(defaultProps))
    await waitFor(() => expect(io).toHaveBeenCalled())

    await act(async () => {
      triggerSocketEvent('connect_error', { message: 'Unauthorized' })
      await Promise.resolve()
    })

    expect(mockRefreshSession).toHaveBeenCalled()
  })
})
