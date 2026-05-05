/**
 * @jest-environment node
 */
import { proxyToBackend } from '@/lib/api/backend-proxy'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/api/admin-authorization')

import { createClient } from '@/lib/supabase/server'
import { hasAdminRole } from '@/lib/api/admin-authorization'

const mockGetSession = jest.fn()
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockHasAdminRole = hasAdminRole as jest.MockedFunction<typeof hasAdminRole>

const mockFetchResponse = (
  status: number,
  body: string,
  contentType = 'application/json',
) => ({
  status,
  ok: status >= 200 && status < 300,
  text: () => Promise.resolve(body),
  headers: { get: (_: string) => contentType },
})

describe('proxyToBackend', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, BACKEND_URL: 'http://backend.test' }
    mockCreateClient.mockResolvedValue({
      auth: { getSession: mockGetSession },
    } as never)
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null,
    })
    mockHasAdminRole.mockResolvedValue(false)
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse(200, '{"ok":true}'),
    )
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns 401 when session is missing', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    const response = await proxyToBackend({ method: 'GET', backendPath: '/test' })
    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({ error: 'Unauthorized' })
  })

  it('returns 401 when getSession returns an error', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: new Error('session error') })
    const response = await proxyToBackend({ method: 'GET', backendPath: '/test' })
    expect(response.status).toBe(401)
  })

  it('returns 500 when BACKEND_URL is not configured', async () => {
    delete process.env.BACKEND_URL
    const response = await proxyToBackend({ method: 'GET', backendPath: '/test' })
    expect(response.status).toBe(500)
    expect(await response.json()).toMatchObject({ error: 'BACKEND_URL is not configured' })
  })

  it('forwards Authorization header to backend', async () => {
    await proxyToBackend({ method: 'GET', backendPath: '/test' })
    expect(global.fetch).toHaveBeenCalledWith(
      'http://backend.test/test',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    )
  })

  it('returns parsed JSON on 200 response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(200, '{"data":"hello"}'),
    )
    const response = await proxyToBackend({ method: 'GET', backendPath: '/test' })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: 'hello' })
  })

  it('returns 204 on No Content response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(204, ''),
    )
    const response = await proxyToBackend({ method: 'DELETE', backendPath: '/test/1' })
    expect(response.status).toBe(204)
  })

  it('includes Content-Type when requestBody is provided', async () => {
    await proxyToBackend({ method: 'POST', backendPath: '/test', requestBody: '{"x":1}' })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: '{"x":1}',
      }),
    )
  })

  it('returns 403 when requireAdmin is true and user is not admin', async () => {
    mockHasAdminRole.mockResolvedValue(false)
    const response = await proxyToBackend({ method: 'DELETE', backendPath: '/admin', requireAdmin: true })
    expect(response.status).toBe(403)
    expect(await response.json()).toMatchObject({ error: 'Forbidden: admin role required.' })
  })

  it('proxies when requireAdmin is true and user is admin', async () => {
    mockHasAdminRole.mockResolvedValue(true)
    const response = await proxyToBackend({ method: 'DELETE', backendPath: '/admin', requireAdmin: true })
    expect(response.status).toBe(200)
  })

  it('forwards JSON error body from backend on non-OK response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(404, '{"error":"Not found"}'),
    )
    const response = await proxyToBackend({ method: 'GET', backendPath: '/missing' })
    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({ error: 'Not found' })
  })

  it('wraps plain text error in JSON when backend returns non-JSON error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(500, 'Internal Server Error', 'text/plain'),
    )
    const response = await proxyToBackend({ method: 'GET', backendPath: '/crash' })
    expect(response.status).toBe(500)
    expect(await response.json()).toMatchObject({ error: 'Internal Server Error' })
  })

  it('returns plain text response when backend returns non-JSON success', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(200, 'plain text response', 'text/plain'),
    )
    const response = await proxyToBackend({ method: 'GET', backendPath: '/text' })
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('plain text response')
  })

  it('returns 500 on unhandled thrown error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
    const response = await proxyToBackend({ method: 'GET', backendPath: '/test' })
    expect(response.status).toBe(500)
    expect(await response.json()).toMatchObject({ error: 'Service unavailable' })
  })
})
