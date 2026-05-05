import { render, screen } from '@testing-library/react'
import { TypingIndicator } from '@/components/ui/features/characters/modes/chat/TypingIndicator'

describe('TypingIndicator', () => {
  it('renders with role="status"', () => {
    render(<TypingIndicator />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has aria-label "Escribiendo"', () => {
    render(<TypingIndicator />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Escribiendo')
  })

  it('renders three animated dots', () => {
    const { container } = render(<TypingIndicator />)
    const dots = container.querySelectorAll('span.rounded-full')
    expect(dots).toHaveLength(3)
  })
})
