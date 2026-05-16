jest.mock('@/hooks/useCharacters')

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnowledgeBaseUploadCard } from '@/components/ui/features/uploads/KnowledgeBaseUploadCard'
import { useCharacters } from '@/hooks/useCharacters'

const mockHandleCharacterChange = jest.fn()

const defaultUseCharactersMock = {
  availableCharacters: [
    { id: 'char-1', name: 'Einstein', description: '', role: '', biography: '' },
    { id: 'char-2', name: 'Newton', description: '', role: '', biography: '' },
  ],
  selectedCharacterId: 'char-1',
  handleCharacterChange: mockHandleCharacterChange,
  isLoading: false,
}

const makeFile = (name: string, type: string, size = 1024) =>
  new File(['x'.repeat(size)], name, { type })

const uploadFile = (file: File) => {
  const input = screen.getByLabelText('Archivo') as HTMLInputElement
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  fireEvent.change(input)
}

describe('KnowledgeBaseUploadCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCharacters as jest.Mock).mockReturnValue(defaultUseCharactersMock)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          message: 'Uploaded',
          characterId: 'char-1',
          collectionName: 'col-1',
          fileName: 'doc.pdf',
          mimeType: 'application/pdf',
          chunksIndexed: 10,
          indexedAt: new Date().toISOString(),
        }),
    })
  })

  it('renders character selector', () => {
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    expect(screen.getByLabelText('Personaje')).toBeInTheDocument()
  })

  it('renders file input', () => {
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    expect(screen.getByLabelText('Archivo')).toBeInTheDocument()
  })

  it('upload button is disabled when no file is selected', () => {
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    expect(screen.getByRole('button', { name: /subir archivo/i })).toBeDisabled()
  })

  it('shows error for unsupported file extension', async () => {
    const user = userEvent.setup()
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    uploadFile(makeFile('document.exe', 'application/octet-stream'))
    await user.click(screen.getByRole('button', { name: /subir archivo/i }))
    expect(await screen.findByText('Solo se permiten archivos .txt, .md o .pdf.')).toBeInTheDocument()
  })

  it('shows error for unsupported MIME type', async () => {
    const user = userEvent.setup()
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    uploadFile(makeFile('document.pdf', 'application/zip'))
    await user.click(screen.getByRole('button', { name: /subir archivo/i }))
    expect(await screen.findByText('El tipo MIME del archivo no es valido para este upload.')).toBeInTheDocument()
  })

  it('shows error for empty file', async () => {
    const user = userEvent.setup()
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    uploadFile(makeFile('doc.txt', 'text/plain', 0))
    await user.click(screen.getByRole('button', { name: /subir archivo/i }))
    expect(await screen.findByText('El archivo esta vacio.')).toBeInTheDocument()
  })

  it('shows error for file exceeding 10MB limit', async () => {
    const user = userEvent.setup()
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    uploadFile(makeFile('big.pdf', 'application/pdf', 10 * 1024 * 1024 + 1))
    await user.click(screen.getByRole('button', { name: /subir archivo/i }))
    expect(await screen.findByText(/supera el limite/i)).toBeInTheDocument()
  })

  it('uploads a valid file and shows success result card', async () => {
    const user = userEvent.setup()
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    uploadFile(makeFile('doc.pdf', 'application/pdf', 2048))
    await user.click(screen.getByRole('button', { name: /subir archivo/i }))
    await waitFor(() =>
      expect(screen.getByText('Upload completado')).toBeInTheDocument(),
    )
    expect(screen.getByText('Archivo: doc.pdf')).toBeInTheDocument()
  })

  it('shows 403 Forbidden error message on admin check failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403 })
    const user = userEvent.setup()
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    uploadFile(makeFile('doc.pdf', 'application/pdf', 2048))
    await user.click(screen.getByRole('button', { name: /subir archivo/i }))
    await waitFor(() =>
      expect(screen.getByText('Forbidden: admin role required.')).toBeInTheDocument(),
    )
  })

  it('shows generic error on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    uploadFile(makeFile('doc.txt', 'text/plain', 512))
    await user.click(screen.getByRole('button', { name: /subir archivo/i }))
    await waitFor(() =>
      expect(screen.getByText('Network error')).toBeInTheDocument(),
    )
  })

  it('disables upload button while uploading', async () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    uploadFile(makeFile('doc.pdf', 'application/pdf', 2048))
    await user.click(screen.getByRole('button', { name: /subir archivo/i }))
    expect(await screen.findByText(/subiendo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /subiendo/i })).toBeDisabled()
  })

  it('shows selected file info after file selection', () => {
    render(<KnowledgeBaseUploadCard refreshKey={0} />)
    uploadFile(makeFile('my-doc.pdf', 'application/pdf', 2048))
    expect(screen.getByText('my-doc.pdf')).toBeInTheDocument()
  })
})
