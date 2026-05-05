import { getErrorMessage } from '@/utils/api.utils'

const makeResponse = (status: number, body: unknown): Response =>
  ({
    status,
    json: () => Promise.resolve(body),
  }) as unknown as Response

const makeBrokenJsonResponse = (status: number): Response =>
  ({
    status,
    json: () => Promise.reject(new SyntaxError('Invalid JSON')),
  }) as unknown as Response

describe('getErrorMessage', () => {
  it('returns the error field from JSON body', async () => {
    expect(await getErrorMessage(makeResponse(400, { error: 'Bad Request' }))).toBe('Bad Request')
  })

  it('returns the details field when error is absent', async () => {
    expect(await getErrorMessage(makeResponse(422, { details: 'Validation failed' }))).toBe('Validation failed')
  })

  it('prefers error over details when both are present', async () => {
    expect(await getErrorMessage(makeResponse(400, { error: 'Primary', details: 'Secondary' }))).toBe('Primary')
  })

  it('falls back to HTTP status when JSON has no useful fields', async () => {
    expect(await getErrorMessage(makeResponse(500, { other: 'value' }))).toBe('HTTP 500')
  })

  it('falls back to HTTP status when error is empty string', async () => {
    expect(await getErrorMessage(makeResponse(400, { error: '' }))).toBe('HTTP 400')
  })

  it('falls back to HTTP status when error is whitespace-only', async () => {
    expect(await getErrorMessage(makeResponse(400, { error: '   ' }))).toBe('HTTP 400')
  })

  it('falls back to HTTP status when JSON parse fails', async () => {
    expect(await getErrorMessage(makeBrokenJsonResponse(503))).toBe('HTTP 503')
  })

  it('falls back to HTTP status for null body', async () => {
    expect(await getErrorMessage(makeResponse(404, null))).toBe('HTTP 404')
  })
})
