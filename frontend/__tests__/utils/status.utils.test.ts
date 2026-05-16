import { getStatusDisplay } from '@/utils/status.utils'

describe('getStatusDisplay', () => {
  it.each(['Conectado', 'Listo'])('returns green theme for "%s"', (status) => {
    const result = getStatusDisplay(status)
    expect(result.color).toContain('green')
    expect(result.bg).toContain('green')
    expect(result.icon).toBe('●')
  })

  it.each(['Desconectado', 'Error de conexión'])('returns red theme for "%s"', (status) => {
    const result = getStatusDisplay(status)
    expect(result.color).toContain('red')
    expect(result.bg).toContain('red')
    expect(result.icon).toBe('●')
  })

  it.each(['No autenticado', 'Error'])('returns red theme with "!" icon for "%s"', (status) => {
    const result = getStatusDisplay(status)
    expect(result.color).toContain('red')
    expect(result.icon).toBe('!')
  })

  it('returns orange theme for "Grabando voz..."', () => {
    const result = getStatusDisplay('Grabando voz...')
    expect(result.color).toContain('orange')
    expect(result.bg).toContain('orange')
    expect(result.icon).toBe('●')
  })

  it.each(['Reautenticando...', 'Esperando confirmación...', 'Cerrando ronda...'])(
    'returns amber theme for "%s"',
    (status) => {
      const result = getStatusDisplay(status)
      expect(result.color).toContain('amber')
      expect(result.bg).toContain('amber')
    },
  )

  it('returns blue theme for an unknown status', () => {
    const result = getStatusDisplay('Estado desconocido')
    expect(result.color).toContain('blue')
    expect(result.bg).toContain('blue')
    expect(result.icon).toBe('●')
  })
})
