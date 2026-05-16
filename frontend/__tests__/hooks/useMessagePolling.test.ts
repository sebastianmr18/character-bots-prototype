import { renderHook, waitFor, act } from '@testing-library/react'
import { useMessagePolling } from '@/hooks/useMessagePolling'

const makeBackendMessage = (overrides = {}) => ({
  id: '1',
  role: 'assistant',
  content: 'Hello',
  audioUrl: null,
  audioPath: null,
  audioStorageId: null,
  ...overrides,
})

describe('useMessagePolling', () => {
  let onMessagesUpdate: jest.Mock
  let onStatusChange: jest.Mock

  beforeEach(() => {
    jest.useFakeTimers()
    onMessagesUpdate = jest.fn()
    onStatusChange = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('fetches conversation messages immediately on startPolling', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [makeBackendMessage()] }),
    } as Response)

    const { result } = renderHook(() =>
      useMessagePolling('conv-1', onMessagesUpdate, onStatusChange),
    )

    act(() => result.current.startPolling())
    await waitFor(() => expect(onMessagesUpdate).toHaveBeenCalled())

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/conversations/conv-1',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('calls onStatusChange("Listo") and stops polling when assistant has audio', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ messages: [makeBackendMessage({ audioUrl: 'https://audio.com/1.mp3' })] }),
    } as Response)

    const { result } = renderHook(() =>
      useMessagePolling('conv-1', onMessagesUpdate, onStatusChange),
    )

    act(() => result.current.startPolling())
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('Listo'))
  })

  it('calls onStatusChange("Generando audio...") when assistant has no audio yet', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [makeBackendMessage()] }),
    } as Response)

    const { result } = renderHook(() =>
      useMessagePolling('conv-1', onMessagesUpdate, onStatusChange),
    )

    act(() => result.current.startPolling())
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('Generando audio...'))
  })

  it('stopPolling prevents further interval fetches', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [] }),
    } as Response)
    global.fetch = fetchMock

    const { result } = renderHook(() =>
      useMessagePolling('conv-1', onMessagesUpdate, onStatusChange),
    )

    act(() => result.current.startPolling())
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    act(() => result.current.stopPolling())

    const callCountAfterStop = fetchMock.mock.calls.length
    act(() => jest.advanceTimersByTime(10_000))
    expect(fetchMock.mock.calls.length).toBe(callCountAfterStop)
  })

  it('does not fetch when conversationId is null', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock

    const { result } = renderHook(() =>
      useMessagePolling(null, onMessagesUpdate, onStatusChange),
    )

    act(() => result.current.startPolling())
    await act(async () => { await Promise.resolve() })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('stops polling after 15 iterations', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [] }),
    } as Response)
    global.fetch = fetchMock

    const { result } = renderHook(() =>
      useMessagePolling('conv-1', onMessagesUpdate, onStatusChange),
    )

    act(() => result.current.startPolling())
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    await act(async () => {
      jest.advanceTimersByTime(2000 * 15)
      await Promise.resolve()
    })

    const callCount = fetchMock.mock.calls.length
    act(() => jest.advanceTimersByTime(10_000))
    expect(fetchMock.mock.calls.length).toBe(callCount)
  })

  it('silently handles AbortError without logging', async () => {
    const abortError = new DOMException('Aborted', 'AbortError')
    global.fetch = jest.fn().mockRejectedValue(abortError)
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() =>
      useMessagePolling('conv-1', onMessagesUpdate, onStatusChange),
    )

    act(() => result.current.startPolling())
    await act(async () => { await Promise.resolve() })

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('calls onStatusChange("Generando audio...") when no latestAssistant message found', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: '1', role: 'user', content: 'Hi' }] }),
    } as Response)

    const { result } = renderHook(() =>
      useMessagePolling('conv-1', onMessagesUpdate, onStatusChange),
    )

    act(() => result.current.startPolling())
    await act(async () => { await Promise.resolve() })

    expect(onStatusChange).not.toHaveBeenCalledWith('Generando audio...')
    expect(onStatusChange).not.toHaveBeenCalledWith('Listo')
  })
})
