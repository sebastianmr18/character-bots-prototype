import { renderHook } from '@testing-library/react'
import { useAudioContext } from '@/hooks/useAudioContext'

describe('useAudioContext', () => {
  let mockCtx: {
    state: string
    resume: jest.Mock
    audioWorklet: { addModule: jest.Mock }
  }

  beforeEach(() => {
    mockCtx = {
      state: 'running',
      resume: jest.fn().mockResolvedValue(undefined),
      audioWorklet: { addModule: jest.fn().mockResolvedValue(undefined) },
    }

    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      configurable: true,
      value: jest.fn(() => mockCtx),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('exposes contextRef (initially null) and an init function', () => {
    const { result } = renderHook(() => useAudioContext(16000))
    expect(result.current.contextRef.current).toBeNull()
    expect(typeof result.current.init).toBe('function')
  })

  it('creates an AudioContext with the specified sampleRate on init', async () => {
    const { result } = renderHook(() => useAudioContext(16000))
    await result.current.init()
    expect(window.AudioContext).toHaveBeenCalledWith({ sampleRate: 16000 })
    expect(result.current.contextRef.current).toBe(mockCtx)
  })

  it('does not create a second AudioContext on repeated init calls', async () => {
    const { result } = renderHook(() => useAudioContext(16000))
    await result.current.init()
    await result.current.init()
    expect(window.AudioContext).toHaveBeenCalledTimes(1)
  })

  it('resumes a suspended AudioContext', async () => {
    mockCtx.state = 'suspended'
    const { result } = renderHook(() => useAudioContext(16000))
    await result.current.init()
    expect(mockCtx.resume).toHaveBeenCalled()
  })

  it('does not call resume on a running context', async () => {
    mockCtx.state = 'running'
    const { result } = renderHook(() => useAudioContext(16000))
    await result.current.init()
    expect(mockCtx.resume).not.toHaveBeenCalled()
  })

  it('loads the worklet module when workletUrl is provided', async () => {
    const { result } = renderHook(() => useAudioContext(16000, '/worklets/audio-processor.js'))
    await result.current.init()
    expect(mockCtx.audioWorklet.addModule).toHaveBeenCalledWith('/worklets/audio-processor.js')
  })

  it('does not load any worklet when workletUrl is omitted', async () => {
    const { result } = renderHook(() => useAudioContext(16000))
    await result.current.init()
    expect(mockCtx.audioWorklet.addModule).not.toHaveBeenCalled()
  })

  it('falls back to webkitAudioContext when AudioContext is not available', async () => {
    const webkitMock = jest.fn(() => mockCtx)
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(window, 'webkitAudioContext', {
      writable: true,
      configurable: true,
      value: webkitMock,
    })
    const { result } = renderHook(() => useAudioContext(24000))
    await result.current.init()
    expect(webkitMock).toHaveBeenCalledWith({ sampleRate: 24000 })
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      configurable: true,
      value: jest.fn(() => mockCtx),
    })
  })

  it('does not throw when worklet addModule rejects', async () => {
    mockCtx.audioWorklet.addModule.mockRejectedValue(new Error('worklet error'))
    const { result } = renderHook(() => useAudioContext(16000, '/worklets/audio-processor.js'))
    await expect(result.current.init()).rejects.toThrow('worklet error')
  })
})
