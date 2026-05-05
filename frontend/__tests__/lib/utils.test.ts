import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out falsy conditional classes', () => {
    expect(cn('base', false && 'disabled', 'active')).toBe('base active')
  })

  it('deduplicates conflicting Tailwind utility classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('handles undefined and null gracefully', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('returns empty string for empty input', () => {
    expect(cn('')).toBe('')
  })

  it('returns empty string when called with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('merges object-style class conditions', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })
})
