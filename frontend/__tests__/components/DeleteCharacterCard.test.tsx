jest.mock('@/hooks/useCharacters')

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteCharacterCard } from '@/components/ui/features/uploads/DeleteCharacterCard'
import { useCharacters } from '@/hooks/useCharacters'

const mockHandleCharacterChange = jest.fn()
const mockOnCharacterDeleted = jest.fn()

const defaultUseCharactersMock = {
  availableCharacters: [
    { id: 'char-1', name: 'Einstein', description: '', role: '', biography: '' },
    { id: 'char-2', name: 'Newton', description: '', role: '', biography: '' },
  ],
  selectedCharacterId: 'char-1',
  handleCharacterChange: mockHandleCharacterChange,
  isLoading: false,
}

describe('DeleteCharacterCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCharacters as jest.Mock).mockReturnValue(defaultUseCharactersMock)
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 })
  })

  it('renders character selector', () => {
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    expect(screen.getByLabelText('Personaje')).toBeInTheDocument()
  })

  it('shows "Confirmar eliminacion" dialog trigger button', () => {
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    expect(screen.getByRole('button', { name: /eliminar personaje/i })).toBeInTheDocument()
  })

  it('delete button is disabled when no character is selected', () => {
    ;(useCharacters as jest.Mock).mockReturnValue({
      ...defaultUseCharactersMock,
      selectedCharacterId: null,
      availableCharacters: [],
    })
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    expect(screen.getByRole('button', { name: /eliminar personaje/i })).toBeDisabled()
  })

  it('opens dialog when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    expect(await screen.findByText('Confirmar eliminacion permanente')).toBeInTheDocument()
  })

  it('confirm button is disabled when name input is empty', async () => {
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    const confirmButton = await screen.findByRole('button', { name: /eliminar definitivamente/i })
    expect(confirmButton).toBeDisabled()
  })

  it('confirm button is disabled when name does not match', async () => {
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    await user.type(screen.getByLabelText(/escribe el nombre del personaje/i), 'Wrong Name')
    expect(screen.getByRole('button', { name: /eliminar definitivamente/i })).toBeDisabled()
  })

  it('confirm button is enabled when name matches exactly', async () => {
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    await user.type(screen.getByLabelText(/escribe el nombre del personaje/i), 'Einstein')
    expect(screen.getByRole('button', { name: /eliminar definitivamente/i })).not.toBeDisabled()
  })

  it('calls DELETE API and onCharacterDeleted on successful deletion', async () => {
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    await user.type(screen.getByLabelText(/escribe el nombre del personaje/i), 'Einstein')
    await user.click(screen.getByRole('button', { name: /eliminar definitivamente/i }))

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/characters/char-1',
        expect.objectContaining({ method: 'DELETE' }),
      ),
    )
    await waitFor(() => expect(mockOnCharacterDeleted).toHaveBeenCalled())
  })

  it('shows success message after deletion', async () => {
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    await user.type(screen.getByLabelText(/escribe el nombre del personaje/i), 'Einstein')
    await user.click(screen.getByRole('button', { name: /eliminar definitivamente/i }))

    await waitFor(() =>
      expect(screen.getByText(/Se elimino a Einstein correctamente/i)).toBeInTheDocument(),
    )
  })

  it('shows 403 Forbidden error message', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403 })
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    await user.type(screen.getByLabelText(/escribe el nombre del personaje/i), 'Einstein')
    await user.click(screen.getByRole('button', { name: /eliminar definitivamente/i }))

    await waitFor(() =>
      expect(screen.getByText('Forbidden: admin role required.')).toBeInTheDocument(),
    )
  })

  it('shows 404 error message', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 })
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    await user.type(screen.getByLabelText(/escribe el nombre del personaje/i), 'Einstein')
    await user.click(screen.getByRole('button', { name: /eliminar definitivamente/i }))

    await waitFor(() =>
      expect(screen.getByText('El personaje no existe o ya fue eliminado.')).toBeInTheDocument(),
    )
  })

  it('shows 401 Unauthorized error message', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 })
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    await user.type(screen.getByLabelText(/escribe el nombre del personaje/i), 'Einstein')
    await user.click(screen.getByRole('button', { name: /eliminar definitivamente/i }))

    await waitFor(() =>
      expect(screen.getByText('Unauthorized')).toBeInTheDocument(),
    )
  })

  it('closes dialog and resets name input when cancelled', async () => {
    const user = userEvent.setup()
    render(<DeleteCharacterCard refreshKey={0} onCharacterDeleted={mockOnCharacterDeleted} />)
    await user.click(screen.getByRole('button', { name: /eliminar personaje/i }))
    await user.type(screen.getByLabelText(/escribe el nombre del personaje/i), 'Einstein')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByText('Confirmar eliminacion permanente')).not.toBeInTheDocument()
  })
})
