import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInput } from '@/components/ui/features/characters/modes/chat/ChatInput'

const defaultProps = {
  isRecording: false,
  isConnected: true,
  isModalOpen: false,
  selectedCharacterId: 'char-1',
  availableCharacters: [{ id: 'char-1', name: 'Einstein' }],
  onSendMessage: jest.fn(),
  onToggleRecording: jest.fn(),
}

describe('ChatInput', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the text input with the character name in the placeholder', () => {
    render(<ChatInput {...defaultProps} />)
    expect(screen.getByPlaceholderText('Escribe a Einstein...')).toBeInTheDocument()
  })

  it('falls back to "el personaje" in the placeholder when selectedCharacterId is null', () => {
    render(<ChatInput {...defaultProps} selectedCharacterId={null} />)
    expect(screen.getByPlaceholderText('Escribe a el personaje...')).toBeInTheDocument()
  })

  it('renders default quick suggestions when none are provided', () => {
    render(<ChatInput {...defaultProps} />)
    expect(screen.getByText('Cuéntame sobre tu vida')).toBeInTheDocument()
    expect(screen.getByText('¿Cuál fue tu mayor logro?')).toBeInTheDocument()
  })

  it('renders custom suggestions instead of defaults when provided', () => {
    render(<ChatInput {...defaultProps} suggestions={['Pregunta 1', 'Pregunta 2']} />)
    expect(screen.getByText('Pregunta 1')).toBeInTheDocument()
    expect(screen.queryByText('Cuéntame sobre tu vida')).not.toBeInTheDocument()
  })

  it('submit button is disabled when the input is empty', () => {
    render(<ChatInput {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled()
  })

  it('submit button becomes enabled when the input has text', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)
    await user.type(screen.getByRole('textbox'), 'Hello')
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).not.toBeDisabled()
  })

  it('calls onSendMessage with the input value and clears the field on submit', async () => {
    const user = userEvent.setup()
    const onSendMessage = jest.fn()
    render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello Einstein')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(onSendMessage).toHaveBeenCalledWith('Hello Einstein')
    expect(input).toHaveValue('')
  })

  it('does not call onSendMessage when input is only whitespace', async () => {
    const user = userEvent.setup()
    const onSendMessage = jest.fn()
    render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

    await user.type(screen.getByRole('textbox'), '   ')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(onSendMessage).not.toHaveBeenCalled()
  })

  it('calls onSendMessage on Enter key press', async () => {
    const user = userEvent.setup()
    const onSendMessage = jest.fn()
    render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

    await user.type(screen.getByRole('textbox'), 'Test message{Enter}')

    expect(onSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('calls onSendMessage with suggestion text when a suggestion is clicked', async () => {
    const user = userEvent.setup()
    const onSendMessage = jest.fn()
    render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

    await user.click(screen.getByText('Cuéntame sobre tu vida'))
    expect(onSendMessage).toHaveBeenCalledWith('Cuéntame sobre tu vida')
  })

  it('disables the text input when isRecording=true', () => {
    render(<ChatInput {...defaultProps} isRecording={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('shows "Detener grabación" aria-label when recording', () => {
    render(<ChatInput {...defaultProps} isRecording={true} />)
    expect(screen.getByRole('button', { name: 'Detener grabación' })).toBeInTheDocument()
  })

  it('shows "Grabar mensaje de voz" aria-label when not recording', () => {
    render(<ChatInput {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Grabar mensaje de voz' })).toBeInTheDocument()
  })

  it('calls onToggleRecording when the mic button is clicked', async () => {
    const user = userEvent.setup()
    const onToggleRecording = jest.fn()
    render(<ChatInput {...defaultProps} onToggleRecording={onToggleRecording} />)

    await user.click(screen.getByRole('button', { name: 'Grabar mensaje de voz' }))
    expect(onToggleRecording).toHaveBeenCalled()
  })

  it('disables all controls when canSendMessages=false', () => {
    render(<ChatInput {...defaultProps} canSendMessages={false} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Grabar mensaje de voz' })).toBeDisabled()
  })
})
