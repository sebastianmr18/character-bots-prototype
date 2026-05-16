import React, { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { ChatMessages } from '@/components/ui/features/characters/modes/chat/ChatMessages'
import type { Message, CharacterReference } from '@/types/chat.types'

jest.mock('@/components/ui/features/characters/shared/AudioMessagePlayer', () => ({
  AudioMessagePlayer: ({ messageId }: { messageId: string | number }) => (
    <div data-testid={`audio-player-${messageId}`} />
  ),
}))

jest.mock('@/components/ui/features/characters/genui/GenericRenderer', () => ({
  GenericRenderer: () => <div data-testid="generic-renderer" />,
}))

jest.mock('@/components/ui/features/characters/modes/chat/ModeSwitchSeparator', () => ({
  ModeSwitchSeparator: ({ text }: { text: string }) => (
    <div data-testid="mode-switch-separator">{text}</div>
  ),
}))

const mockResolveAudioUrl = jest.fn().mockResolvedValue({ audioUrl: null })

const defaultProps = {
  messages: [] as Message[],
  availableCharacters: [] as CharacterReference[],
  selectedCharacterId: null as string | null,
  conversationId: null as string | null,
  messagesEndRef: createRef<HTMLDivElement>(),
  resolveAudioUrl: mockResolveAudioUrl,
}

const makeMsg = (overrides: Partial<Message> = {}): Message => ({
  id: '1',
  role: 'assistant',
  content: 'Hello from AI',
  ...overrides,
})

describe('ChatMessages', () => {
  it('shows empty state when there are no messages', () => {
    render(<ChatMessages {...defaultProps} />)
    expect(screen.getByText('Comienza la conversación')).toBeInTheDocument()
  })

  it('displays the character name in the empty state', () => {
    render(<ChatMessages {...defaultProps} characterName="Einstein" />)
    expect(screen.getByText('Einstein')).toBeInTheDocument()
  })

  it('shows a truncated conversation ID in the empty state when provided', () => {
    render(<ChatMessages {...defaultProps} conversationId="abc-123-def-456" />)
    expect(screen.getByText(/abc-123/)).toBeInTheDocument()
  })

  it('renders user messages with "TÚ" avatar label', () => {
    const messages = [makeMsg({ id: '1', role: 'user', content: 'Hello AI' })]
    render(<ChatMessages {...defaultProps} messages={messages} />)
    expect(screen.getByText('Hello AI')).toBeInTheDocument()
    expect(screen.getByText('TÚ')).toBeInTheDocument()
  })

  it('renders assistant messages', () => {
    const messages = [makeMsg({ id: '1', role: 'assistant', content: 'Hello user' })]
    render(<ChatMessages {...defaultProps} messages={messages} characterName="Einstein" />)
    expect(screen.getByText('Hello user')).toBeInTheDocument()
  })

  it('uses "AI" as fallback and shows "A" avatar when no character name is available', () => {
    const messages = [makeMsg({ id: '1', role: 'assistant', content: 'Hi' })]
    render(<ChatMessages {...defaultProps} messages={messages} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows the typing indicator when isTyping=true', () => {
    const messages = [makeMsg()]
    render(<ChatMessages {...defaultProps} messages={messages} isTyping={true} characterName="Einstein" />)
    expect(screen.getByRole('status', { name: 'Escribiendo' })).toBeInTheDocument()
  })

  it('does not show the typing indicator when isTyping=false', () => {
    const messages = [makeMsg()]
    render(<ChatMessages {...defaultProps} messages={messages} isTyping={false} />)
    expect(screen.queryByRole('status', { name: 'Escribiendo' })).not.toBeInTheDocument()
  })

  it('renders AudioMessagePlayer for each assistant message', () => {
    const messages = [makeMsg({ id: '42', role: 'assistant', content: 'Hi' })]
    render(<ChatMessages {...defaultProps} messages={messages} />)
    expect(screen.getByTestId('audio-player-42')).toBeInTheDocument()
  })

  it('does not render AudioMessagePlayer for user messages', () => {
    const messages = [makeMsg({ id: '10', role: 'user', content: 'Hi' })]
    render(<ChatMessages {...defaultProps} messages={messages} />)
    expect(screen.queryByTestId('audio-player-10')).not.toBeInTheDocument()
  })

  it('renders GenericRenderer for messages that have blocks', () => {
    const messages = [
      makeMsg({
        id: '1',
        role: 'assistant',
        content: 'Hi',
        blocks: [{ type: 'component', componentName: 'InfoCard', props: {} }],
      }),
    ]
    render(<ChatMessages {...defaultProps} messages={messages} />)
    expect(screen.getByTestId('generic-renderer')).toBeInTheDocument()
  })

  it('renders a mode-switch separator for __mode_switch: system messages', () => {
    const messages = [makeMsg({ id: '1', role: 'system', content: '__mode_switch:interview' })]
    render(<ChatMessages {...defaultProps} messages={messages} />)
    const separator = screen.getByTestId('mode-switch-separator')
    expect(separator).toHaveTextContent('Cambiaste a modo Entrevista')
  })

  it('shows character name from availableCharacters when characterName prop is not given', () => {
    const messages = [makeMsg({ id: '1', role: 'assistant', content: 'Hola' })]
    render(
      <ChatMessages
        {...defaultProps}
        messages={messages}
        availableCharacters={[{ id: 'char-1', name: 'Marie Curie' }]}
        selectedCharacterId="char-1"
      />,
    )
    // Avatar initial should be 'M'
    expect(screen.getByText('M')).toBeInTheDocument()
  })
})
