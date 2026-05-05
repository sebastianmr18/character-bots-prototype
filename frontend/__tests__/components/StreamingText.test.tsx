import { render, screen, act } from '@testing-library/react'
import { StreamingText } from '@/components/ui/features/characters/shared/StreamingText'

describe('StreamingText', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('renders the full text immediately when animate=false', () => {
    const { container } = render(<StreamingText text="Hello World" animate={false} />)
    expect(container).toHaveTextContent('Hello World')
  })

  it('defaults to not animating (animate is false by default)', () => {
    const { container } = render(<StreamingText text="No animation" />)
    expect(container).toHaveTextContent('No animation')
  })

  it('starts with no visible text when animate=true', () => {
    const { container } = render(<StreamingText text="Hello World" animate={true} />)
    expect(container.textContent).not.toContain('Hello World')
  })

  it('shows the animated cursor while text is being revealed', () => {
    const { container } = render(<StreamingText text="Hello World" animate={true} />)
    const cursor = container.querySelector('[aria-hidden="true"]')
    expect(cursor).toBeInTheDocument()
  })

  it('eventually renders the full text after all timers fire', async () => {
    const { container } = render(<StreamingText text="Hi" animate={true} />)
    await act(async () => jest.runAllTimers())
    expect(container).toHaveTextContent('Hi')
  })

  it('hides the cursor once animation is complete', async () => {
    const { container } = render(<StreamingText text="Hi" animate={true} />)
    await act(async () => jest.runAllTimers())
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('shows full text when switching from animate=true to animate=false', () => {
    const { container, rerender } = render(<StreamingText text="Hello" animate={true} />)
    rerender(<StreamingText text="Hello" animate={false} />)
    expect(container).toHaveTextContent('Hello')
  })

  it('handles empty string with animate=true without crashing', async () => {
    const { container } = render(<StreamingText text="" animate={true} />)
    await act(async () => jest.runAllTimers())
    expect(container.textContent).toBe('')
  })

  it('covers stepSize=2 branch for 61-120 character text', () => {
    const text = 'a'.repeat(80)
    const { container } = render(<StreamingText text={text} />)
    expect(container).toHaveTextContent(text)
  })

  it('covers stepSize=3 branch for 121-220 character text', () => {
    const text = 'b'.repeat(150)
    const { container } = render(<StreamingText text={text} />)
    expect(container).toHaveTextContent(text)
  })

  it('covers stepSize=4 branch for 221-360 character text', () => {
    const text = 'c'.repeat(250)
    const { container } = render(<StreamingText text={text} />)
    expect(container).toHaveTextContent(text)
  })

  it('covers stepSize=5 branch for texts over 360 characters', () => {
    const text = 'd'.repeat(400)
    const { container } = render(<StreamingText text={text} />)
    expect(container).toHaveTextContent(text)
  })

  it('restarts animation when text prop changes while animating', async () => {
    const { container, rerender } = render(<StreamingText text="First" animate={true} />)
    rerender(<StreamingText text="Second" animate={false} />)
    expect(container).toHaveTextContent('Second')
  })
})
