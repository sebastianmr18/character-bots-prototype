import { renderHook, act } from '@testing-library/react'
import { getMediaRecorder, useVoiceRecording } from '@/hooks/useVoiceRecording'

class FakeMediaRecorder {
  static isTypeSupported = jest.fn(() => true)

  public ondataavailable: ((event: BlobEvent) => void) | null = null
  public onstop: (() => void) | null = null
  public state: 'inactive' | 'recording' = 'inactive'
  public stream: MediaStream

  constructor(stream: MediaStream) {
    this.stream = stream
  }

  start() {
    this.state = 'recording'
  }

  stop() {
    this.state = 'inactive'
    this.onstop?.()
  }
}

describe('useVoiceRecording', () => {
  const mockTrackStop = jest.fn()
  const mockStream = {
    getTracks: () => [{ stop: mockTrackStop }],
  } as unknown as MediaStream

  const mockGetUserMedia = jest.fn(async () => mockStream)

  beforeEach(() => {
    jest.clearAllMocks()

    Object.defineProperty(global, 'MediaRecorder', {
      configurable: true,
      writable: true,
      value: FakeMediaRecorder,
    })

    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: mockGetUserMedia },
    })

    Object.defineProperty(global, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: jest.fn(() => 1),
    })

    Object.defineProperty(global, 'cancelAnimationFrame', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    })

    class MockFileReader {
      public result: string | ArrayBuffer | null = null
      public onload: (() => void) | null = null

      readAsDataURL() {
        this.result = 'data:audio/webm;base64,ZmFrZS1hdWRpbw=='
        this.onload?.()
      }
    }

    Object.defineProperty(global, 'FileReader', {
      configurable: true,
      writable: true,
      value: MockFileReader,
    })
  })

  it('throws when browser does not support required media type', () => {
    ;(MediaRecorder.isTypeSupported as jest.Mock).mockReturnValueOnce(false)

    expect(() => getMediaRecorder(mockStream)).toThrow(
      'El formato audio/webm;codecs=opus no está soportado en este navegador.',
    )
  })

  it('starts recording and updates recording state', async () => {
    const { result } = renderHook(() => useVoiceRecording())

    let started = false
    await act(async () => {
      started = await result.current.startRecording()
    })

    expect(started).toBe(true)
    expect(result.current.isRecording).toBe(true)
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })
  })

  it('returns base64 audio payload on stopRecording', async () => {
    const { result } = renderHook(() => useVoiceRecording())

    await act(async () => {
      await result.current.startRecording()
    })

    let audio = ''
    await act(async () => {
      audio = await result.current.stopRecording()
    })

    expect(audio).toBe('ZmFrZS1hdWRpbw==')
    expect(result.current.isRecording).toBe(false)
  })

  it('sets user-facing error when microphone access fails', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('permission denied'))
    const { result } = renderHook(() => useVoiceRecording())

    let started = true
    await act(async () => {
      started = await result.current.startRecording()
    })

    expect(started).toBe(false)
    expect(result.current.errorMessage).toContain('Necesitas dar permiso al micrófono')

    act(() => {
      result.current.clearError()
    })
    expect(result.current.errorMessage).toBeNull()
  })

  it('stops tracks and recorder on unmount cleanup', async () => {
    const { result, unmount } = renderHook(() => useVoiceRecording())

    await act(async () => {
      await result.current.startRecording()
    })

    unmount()
    expect(mockTrackStop).toHaveBeenCalled()
  })
})
