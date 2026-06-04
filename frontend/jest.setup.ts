/**
 * Setup global de Jest: matchers de Testing Library y stubs de APIs de audio en jsdom.
 */

import '@testing-library/jest-dom'

// HTMLMediaElement stubs (jsdom doesn't implement them)
if (typeof window !== 'undefined') {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: jest.fn().mockResolvedValue(undefined),
  })
  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: jest.fn(),
  })
  Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: jest.fn(),
  })

  // URL.createObjectURL is not implemented in jsdom
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = jest.fn()
}
