import { renderHook, act } from '@testing-library/react'
import { useAnimatedEntryKeys } from '@/hooks/useAnimatedEntryKeys'

type Entry = { id: string; isNew: boolean }

const getKey = (e: Entry) => e.id
const shouldAnimate = (e: Entry) => e.isNew

describe('useAnimatedEntryKeys', () => {
  it('returns an empty set on initial render', () => {
    const entries: Entry[] = [{ id: '1', isNew: false }]
    const { result } = renderHook(() => useAnimatedEntryKeys(entries, getKey, shouldAnimate))
    expect(result.current.size).toBe(0)
  })

  it('does not animate entries that were already present on mount', () => {
    const entries: Entry[] = [{ id: '1', isNew: true }]
    const { result } = renderHook(() => useAnimatedEntryKeys(entries, getKey, shouldAnimate))
    expect(result.current.has('1')).toBe(false)
  })

  it('animates newly added entries that pass shouldAnimateEntry', () => {
    const initial: Entry[] = [{ id: '1', isNew: false }]
    const { result, rerender } = renderHook(
      ({ entries }) => useAnimatedEntryKeys(entries, getKey, shouldAnimate),
      { initialProps: { entries: initial } },
    )

    act(() => {
      rerender({ entries: [...initial, { id: '2', isNew: true }] })
    })

    expect(result.current.has('2')).toBe(true)
  })

  it('does not animate newly added entries that fail shouldAnimateEntry', () => {
    const initial: Entry[] = [{ id: '1', isNew: false }]
    const { result, rerender } = renderHook(
      ({ entries }) => useAnimatedEntryKeys(entries, getKey, shouldAnimate),
      { initialProps: { entries: initial } },
    )

    act(() => {
      rerender({ entries: [...initial, { id: '2', isNew: false }] })
    })

    expect(result.current.has('2')).toBe(false)
  })

  it('accumulates animated keys across multiple additions', () => {
    const initial: Entry[] = [{ id: '1', isNew: false }]
    const { result, rerender } = renderHook(
      ({ entries }) => useAnimatedEntryKeys(entries, getKey, shouldAnimate),
      { initialProps: { entries: initial } },
    )

    act(() => {
      rerender({ entries: [...initial, { id: '2', isNew: true }] })
    })
    act(() => {
      rerender({ entries: [...initial, { id: '2', isNew: true }, { id: '3', isNew: true }] })
    })

    expect(result.current.has('2')).toBe(true)
    expect(result.current.has('3')).toBe(true)
  })

  it('resets animated keys when resetKey changes', () => {
    const initial: Entry[] = [{ id: '1', isNew: false }]
    const { result, rerender } = renderHook(
      ({ entries, resetKey }: { entries: Entry[]; resetKey: string | null }) =>
        useAnimatedEntryKeys(entries, getKey, shouldAnimate, resetKey),
      { initialProps: { entries: initial, resetKey: 'conv-1' as string | null } },
    )

    act(() => {
      rerender({ entries: [...initial, { id: '2', isNew: true }], resetKey: 'conv-1' })
    })
    expect(result.current.has('2')).toBe(true)

    act(() => {
      rerender({ entries: [...initial, { id: '2', isNew: true }], resetKey: 'conv-2' })
    })
    expect(result.current.size).toBe(0)
  })
})
