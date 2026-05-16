import { renderHook } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
  let mockMql: { addEventListener: jest.Mock; removeEventListener: jest.Mock; matches: boolean }

  beforeEach(() => {
    mockMql = { addEventListener: jest.fn(), removeEventListener: jest.fn(), matches: false }
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockReturnValue(mockMql),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns false for desktop viewport (>= 768px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true for mobile viewport (< 768px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('registers a "change" listener on the media query', () => {
    renderHook(() => useIsMobile())
    expect(mockMql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('removes the listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(mockMql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
