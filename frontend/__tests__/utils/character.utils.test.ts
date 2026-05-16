import { colorFromName, lightColorFromName, toSlug, findCharacterBySlug } from '@/utils/character.utils'

describe('colorFromName', () => {
  it('returns a valid oklch color string', () => {
    expect(colorFromName('Simón Bolívar')).toMatch(/^oklch\(0\.40 0\.10 \d+\)$/)
  })

  it('is deterministic for the same name', () => {
    expect(colorFromName('Einstein')).toBe(colorFromName('Einstein'))
  })

  it('produces different colors for different names', () => {
    expect(colorFromName('Alice')).not.toBe(colorFromName('Bob'))
  })

  it('handles empty string without throwing', () => {
    expect(colorFromName('')).toMatch(/^oklch\(0\.40 0\.10 0\)$/)
  })
})

describe('lightColorFromName', () => {
  it('returns a valid light oklch string', () => {
    expect(lightColorFromName('Marie Curie')).toMatch(/^oklch\(0\.92 0\.03 \d+\)$/)
  })

  it('uses the same hue as colorFromName', () => {
    const darkHue = colorFromName('Tesla').match(/\d+\)$/)?.[0]?.replace(')', '')
    const lightHue = lightColorFromName('Tesla').match(/\d+\)$/)?.[0]?.replace(')', '')
    expect(darkHue).toBe(lightHue)
  })
})

describe('toSlug', () => {
  it('strips accented characters', () => {
    expect(toSlug('Simón Bolívar')).toBe('simon-bolivar')
  })

  it('converts to lowercase', () => {
    expect(toSlug('EINSTEIN')).toBe('einstein')
  })

  it('replaces spaces with hyphens', () => {
    expect(toSlug('Marie Curie')).toBe('marie-curie')
  })

  it('collapses multiple consecutive spaces', () => {
    expect(toSlug('Marie  Curie')).toBe('marie-curie')
  })

  it('trims leading and trailing whitespace', () => {
    expect(toSlug('  Einstein  ')).toBe('einstein')
  })

  it('removes special characters', () => {
    expect(toSlug('José!@#Martí')).toBe('josemarti')
  })

  it('collapses multiple consecutive hyphens', () => {
    expect(toSlug('a--b')).toBe('a-b')
  })

  it('handles empty string', () => {
    expect(toSlug('')).toBe('')
  })
})

describe('findCharacterBySlug', () => {
  const characters = [
    { id: '1', name: 'Simón Bolívar' },
    { id: '2', name: 'Marie Curie' },
    { id: '3', name: 'Albert Einstein' },
  ]

  it('finds a character by derived slug', () => {
    expect(findCharacterBySlug(characters, 'marie-curie')).toEqual({ id: '2', name: 'Marie Curie' })
  })

  it('matches slug from accent-stripped name', () => {
    expect(findCharacterBySlug(characters, 'simon-bolivar')).toEqual({ id: '1', name: 'Simón Bolívar' })
  })

  it('returns undefined when no character matches the slug', () => {
    expect(findCharacterBySlug(characters, 'unknown-person')).toBeUndefined()
  })

  it('returns undefined for an empty array', () => {
    expect(findCharacterBySlug([], 'einstein')).toBeUndefined()
  })
})
