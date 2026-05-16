import { base64ToObjectUrl } from '@/utils/live-audio.utils'

describe('base64ToObjectUrl', () => {
  let createObjectURLSpy: jest.Mock

  beforeEach(() => {
    createObjectURLSpy = jest.fn().mockReturnValue('blob:mock-audio-url')
    URL.createObjectURL = createObjectURLSpy
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns an object URL', () => {
    expect(base64ToObjectUrl('aGVsbG8=')).toBe('blob:mock-audio-url')
  })

  it('passes a Blob to URL.createObjectURL', () => {
    base64ToObjectUrl('aGVsbG8=')
    expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob))
  })

  it('uses audio/mpeg as the default media type', () => {
    base64ToObjectUrl('aGVsbG8=')
    const blob: Blob = createObjectURLSpy.mock.calls[0][0]
    expect(blob.type).toBe('audio/mpeg')
  })

  it('accepts a custom media type', () => {
    base64ToObjectUrl('aGVsbG8=', 'audio/ogg')
    const blob: Blob = createObjectURLSpy.mock.calls[0][0]
    expect(blob.type).toBe('audio/ogg')
  })

  it('strips whitespace from the base64 string before decoding', () => {
    // Should not throw even with embedded whitespace
    expect(() => base64ToObjectUrl('aGVs bG8=')).not.toThrow()
  })
})
