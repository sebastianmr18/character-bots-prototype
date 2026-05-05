import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AudioMessagePlayer } from '@/components/ui/features/characters/shared/AudioMessagePlayer'

const mockResolveAudioUrl = jest.fn()

describe('AudioMessagePlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockResolveAudioUrl.mockResolvedValue({
      audioUrl: 'https://example.com/audio.mp3',
      mediaType: 'audio/mpeg',
    })
  })

  it('renders a "Reproducir audio" button by default', () => {
    render(<AudioMessagePlayer messageId="1" resolveAudioUrl={mockResolveAudioUrl} />)
    expect(screen.getByRole('button', { name: 'Reproducir audio' })).toBeInTheDocument()
  })

  it('renders a hidden audio element when initialAudioUrl is provided', () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    const audio = container.querySelector('audio')
    expect(audio).toBeInTheDocument()
    expect(audio).toHaveAttribute('src', 'https://example.com/audio.mp3')
    expect(audio).toHaveClass('hidden')
  })

  it('does not render an audio element when no initialAudioUrl is given', () => {
    const { container } = render(
      <AudioMessagePlayer messageId="1" resolveAudioUrl={mockResolveAudioUrl} />,
    )
    expect(container.querySelector('audio')).not.toBeInTheDocument()
  })

  it('shows loading state while resolving the audio URL', async () => {
    // Promise that never resolves to keep the loading state visible
    mockResolveAudioUrl.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()

    render(<AudioMessagePlayer messageId="1" resolveAudioUrl={mockResolveAudioUrl} />)
    await user.click(screen.getByRole('button', { name: 'Reproducir audio' }))

    expect(screen.getByRole('button', { name: 'Cargando audio' })).toBeInTheDocument()
  })

  it('disables the button while loading', async () => {
    mockResolveAudioUrl.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()

    render(<AudioMessagePlayer messageId="1" resolveAudioUrl={mockResolveAudioUrl} />)
    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows "Audio no disponible" error when resolveAudioUrl returns null URL', async () => {
    mockResolveAudioUrl.mockResolvedValue({ audioUrl: null })
    const user = userEvent.setup()

    render(<AudioMessagePlayer messageId="1" resolveAudioUrl={mockResolveAudioUrl} />)
    await user.click(screen.getByRole('button', { name: 'Reproducir audio' }))

    await waitFor(() => {
      expect(screen.getByText('Audio no disponible')).toBeInTheDocument()
    })
  })

  it('passes the correct mediaType to the audio element', () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        mediaType="audio/ogg"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    expect(container.querySelector('audio')).toHaveAttribute('data-media-type', 'audio/ogg')
  })

  it('resets audio state when initialAudioUrl prop changes', () => {
    const { container, rerender } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/old.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    rerender(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/new.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    expect(container.querySelector('audio')).toHaveAttribute('src', 'https://example.com/new.mp3')
  })

  it('calls audio.play() when button clicked with audioUrl already set', async () => {
    const user = userEvent.setup()
    render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Reproducir audio' }))
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('calls audio.pause() when button clicked while playing', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    const audioEl = container.querySelector('audio')!
    fireEvent(audioEl, new Event('play'))
    await user.click(screen.getByRole('button', { name: 'Pausar audio' }))
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  })

  it('shows pause button when onPlay fires', () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    fireEvent(container.querySelector('audio')!, new Event('play'))
    expect(screen.getByRole('button', { name: 'Pausar audio' })).toBeInTheDocument()
  })

  it('resets to play button when onEnded fires', () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    const audioEl = container.querySelector('audio')!
    fireEvent(audioEl, new Event('play'))
    fireEvent(audioEl, new Event('ended'))
    expect(screen.getByRole('button', { name: 'Reproducir audio' })).toBeInTheDocument()
  })

  it('resets to play button when onPause fires', () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    const audioEl = container.querySelector('audio')!
    fireEvent(audioEl, new Event('play'))
    fireEvent(audioEl, new Event('pause'))
    expect(screen.getByRole('button', { name: 'Reproducir audio' })).toBeInTheDocument()
  })

  it('shows formatted duration after onLoadedMetadata fires', () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    const audioEl = container.querySelector('audio')!
    Object.defineProperty(audioEl, 'duration', { value: 125, configurable: true })
    fireEvent(audioEl, new Event('loadedmetadata'))
    expect(screen.getByText('2:05')).toBeInTheDocument()
  })

  it('updates remaining duration on onTimeUpdate', () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    const audioEl = container.querySelector('audio')!
    Object.defineProperty(audioEl, 'duration', { value: 120, configurable: true })
    fireEvent(audioEl, new Event('loadedmetadata'))
    Object.defineProperty(audioEl, 'currentTime', { value: 60, configurable: true })
    fireEvent(audioEl, new Event('timeupdate'))
    expect(screen.getByText('1:00')).toBeInTheDocument()
  })

  it('retries with forceRefresh on first audio error', async () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    fireEvent(container.querySelector('audio')!, new Event('error'))
    await waitFor(() =>
      expect(mockResolveAudioUrl).toHaveBeenCalledWith('1', true),
    )
  })

  it('shows "Audio expirado o no disponible" when resolveAudioUrl fails on retry', async () => {
    mockResolveAudioUrl.mockRejectedValueOnce(new Error('Network error'))
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    fireEvent(container.querySelector('audio')!, new Event('error'))
    await waitFor(() =>
      expect(screen.getByText('Audio expirado o no disponible')).toBeInTheDocument(),
    )
  })

  it('shows "Audio expirado o no disponible" on second error after retry', async () => {
    mockResolveAudioUrl.mockResolvedValue({
      audioUrl: 'https://example.com/refreshed.mp3',
      mediaType: 'audio/mpeg',
    })
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    fireEvent(container.querySelector('audio')!, new Event('error'))
    await waitFor(() =>
      expect(mockResolveAudioUrl).toHaveBeenCalledWith('1', true),
    )
    fireEvent(container.querySelector('audio')!, new Event('error'))
    await waitFor(() =>
      expect(screen.getByText('Audio expirado o no disponible')).toBeInTheDocument(),
    )
  })

  it('pauses and resets audio when tab becomes hidden while playing', async () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    const audioEl = container.querySelector('audio')!
    Object.defineProperty(audioEl, 'duration', { value: 60, configurable: true })
    fireEvent(audioEl, new Event('loadedmetadata'))
    fireEvent(audioEl, new Event('play'))

    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()

    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  })

  it('formats 0 seconds as "0:00"', () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    const audioEl = container.querySelector('audio')!
    Object.defineProperty(audioEl, 'duration', { value: 0, configurable: true })
    fireEvent(audioEl, new Event('loadedmetadata'))
    expect(screen.getByText('0:00')).toBeInTheDocument()
  })

  it('formats 3661 seconds as "61:01"', () => {
    const { container } = render(
      <AudioMessagePlayer
        messageId="1"
        initialAudioUrl="https://example.com/audio.mp3"
        resolveAudioUrl={mockResolveAudioUrl}
      />,
    )
    const audioEl = container.querySelector('audio')!
    Object.defineProperty(audioEl, 'duration', { value: 3661, configurable: true })
    fireEvent(audioEl, new Event('loadedmetadata'))
    expect(screen.getByText('61:01')).toBeInTheDocument()
  })
})
