jest.mock('socket.io-client')
jest.mock('@/lib/supabase/client')
jest.mock('@/hooks/useAudioContext')
jest.mock('@/constants/chat.constants', () => ({ LIVE_WS_URL: 'http://test-ws/live' }))

import { renderHook, act, waitFor } from '@testing-library/react'
import io from 'socket.io-client'
import { createClient } from '@/lib/supabase/client'
import { useAudioContext } from '@/hooks/useAudioContext'
import { ConnectionStatus } from '@/types/live.types'
import { useBackendLive } from '@/hooks/useBackendLive'

type Handler = (...args: unknown[]) => void

const socketHandlers = new Map<string, Handler[]>()

const mockEmit = jest.fn()
const mockDisconnect = jest.fn()
const mockSocket = {
  on: jest.fn((event: string, handler: Handler) => {
    if (!socketHandlers.has(event)) socketHandlers.set(event, [])
    socketHandlers.get(event)!.push(handler)
  }),
  emit: mockEmit,
  disconnect: mockDisconnect,
  connected: true,
}

const triggerSocketEvent = (event: string, ...args: unknown[]) => {
  socketHandlers.get(event)?.forEach((h) => h(...args))
}

const mockGetSession = jest.fn()
const mockInitInputAudio = jest.fn()
const mockInitOutputAudio = jest.fn()

const mockInputSourceConnect = jest.fn()
const mockInputSourceDisconnect = jest.fn()
const mockInputSourceNode = {
  connect: mockInputSourceConnect,
  disconnect: mockInputSourceDisconnect,
}

const mockCreateMediaStreamSource = jest.fn(() => mockInputSourceNode)
const mockInputContext = {
  createMediaStreamSource: mockCreateMediaStreamSource,
}

const mockCopyToChannel = jest.fn()
const mockCreatedAudioBuffer = {
  duration: 0.25,
  copyToChannel: mockCopyToChannel,
}

const mockSourceConnect = jest.fn()
const mockSourceStart = jest.fn()
const mockSourceStop = jest.fn()
const mockBufferSource = {
  buffer: null as unknown,
  connect: mockSourceConnect,
  start: mockSourceStart,
  stop: mockSourceStop,
  onended: null as (() => void) | null,
}

const mockCreateBuffer = jest.fn(() => mockCreatedAudioBuffer)
const mockCreateBufferSource = jest.fn(() => mockBufferSource)
const mockOutputContext = {
  currentTime: 1,
  destination: {},
  createBuffer: mockCreateBuffer,
  createBufferSource: mockCreateBufferSource,
}

const mockTrackStop = jest.fn()
const mockGetUserMedia = jest.fn(async () => ({
  getTracks: () => [{ stop: mockTrackStop }],
}))

const mockWorkletConnect = jest.fn()
const mockWorkletDisconnect = jest.fn()
const mockWorkletNode = {
  port: { onmessage: null as ((event: MessageEvent<ArrayBuffer>) => void) | null },
  connect: mockWorkletConnect,
  disconnect: mockWorkletDisconnect,
}

describe('useBackendLive', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    socketHandlers.clear()

    ;(io as unknown as jest.Mock).mockReturnValue(mockSocket)
    ;(createClient as jest.Mock).mockReturnValue({
      auth: { getSession: mockGetSession },
    })

    ;(useAudioContext as jest.Mock).mockImplementation((sampleRate: number) => {
      if (sampleRate === 16000) {
        return { contextRef: { current: mockInputContext }, init: mockInitInputAudio }
      }
      return { contextRef: { current: mockOutputContext }, init: mockInitOutputAudio }
    })

    Object.defineProperty(global, 'AudioWorkletNode', {
      configurable: true,
      writable: true,
      value: jest.fn(() => mockWorkletNode),
    })

    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: mockGetUserMedia },
    })

    Object.defineProperty(global, 'atob', {
      configurable: true,
      value: jest.fn(() => String.fromCharCode(0, 127, 255, 64)),
    })

    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'token-abc' } } })
    mockInitInputAudio.mockResolvedValue(undefined)
    mockInitOutputAudio.mockResolvedValue(undefined)
  })

  it('sets ERROR when there is no access token', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } })
    const { result } = renderHook(() => useBackendLive('system', 'char-1'))

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.status).toBe(ConnectionStatus.ERROR)
    expect(io).not.toHaveBeenCalled()
  })

  it('connects, starts live session, and captures audio after ready', async () => {
    const { result } = renderHook(() => useBackendLive('system', 'char-1'))

    await act(async () => {
      await result.current.connect()
    })

    await waitFor(() => expect(io).toHaveBeenCalledWith('http://test-ws/live', expect.any(Object)))
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })

    act(() => {
      triggerSocketEvent('connect')
    })
    expect(mockEmit).toHaveBeenCalledWith('live:start', {
      characterId: 'char-1',
      systemInstruction: 'system',
    })

    act(() => {
      triggerSocketEvent('live:ready')
    })
    expect(result.current.status).toBe(ConnectionStatus.CONNECTED)

    act(() => {
      mockWorkletNode.port.onmessage?.({ data: new ArrayBuffer(8) } as MessageEvent<ArrayBuffer>)
    })
    expect(mockEmit).toHaveBeenCalledWith('live:audio', expect.any(ArrayBuffer))
  })

  it('toggles mute and prevents microphone chunks while muted', async () => {
    const { result } = renderHook(() => useBackendLive('system', 'char-1'))

    await act(async () => {
      await result.current.connect()
    })

    act(() => {
      triggerSocketEvent('live:ready')
    })

    act(() => {
      result.current.setIsMuted(true)
    })
    expect(result.current.isMuted).toBe(true)
    expect(mockEmit).toHaveBeenCalledWith('live:mute', { muted: true })

    const emitCountBefore = mockEmit.mock.calls.length
    act(() => {
      mockWorkletNode.port.onmessage?.({ data: new ArrayBuffer(8) } as MessageEvent<ArrayBuffer>)
    })
    expect(mockEmit.mock.calls.length).toBe(emitCountBefore)
  })

  it('stores final transcriptions and ignores partial ones', async () => {
    const { result } = renderHook(() => useBackendLive('system', 'char-1'))

    await act(async () => {
      await result.current.connect()
    })

    act(() => {
      triggerSocketEvent('live:transcription', { role: 'user', text: 'partial', isFinal: false })
      triggerSocketEvent('live:transcription', { role: 'model', text: 'final text', isFinal: true })
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0]).toEqual(
      expect.objectContaining({ role: 'model', text: 'final text' }),
    )
  })

  it('schedules output audio chunks and handles interrupted playback', async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useBackendLive('system', 'char-1'))

    await act(async () => {
      await result.current.connect()
    })

    act(() => {
      triggerSocketEvent('live:audio', { audio: 'AAAA' })
    })
    expect(mockCreateBuffer).toHaveBeenCalled()
    expect(mockCreateBufferSource).toHaveBeenCalled()
    expect(mockSourceStart).toHaveBeenCalled()

    act(() => {
      triggerSocketEvent('live:interrupted')
    })
    expect(mockSourceStop).toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(500)
      triggerSocketEvent('live:audio', { audio: 'BBBB' })
    })
    expect(mockSourceStart).toHaveBeenCalledTimes(2)

    act(() => {
      result.current.disconnect()
    })
    jest.useRealTimers()
  })

  it('sets ERROR when live:error event is received', async () => {
    const { result } = renderHook(() => useBackendLive('system', 'char-1'))

    await act(async () => {
      await result.current.connect()
    })

    act(() => {
      triggerSocketEvent('live:error', {
        code: 'UPSTREAM_ERROR',
        message: 'Failure',
        retryable: false,
      })
    })

    expect(result.current.status).toBe(ConnectionStatus.ERROR)
  })

  it('disconnect emits live:stop and cleans media resources', async () => {
    const { result } = renderHook(() => useBackendLive('system', 'char-1'))

    await act(async () => {
      await result.current.connect()
    })

    act(() => {
      triggerSocketEvent('live:ready')
      result.current.disconnect()
    })

    expect(mockEmit).toHaveBeenCalledWith('live:stop')
    expect(mockDisconnect).toHaveBeenCalled()
    expect(mockTrackStop).toHaveBeenCalled()
    expect(result.current.status).toBe(ConnectionStatus.DISCONNECTED)
  })
})
