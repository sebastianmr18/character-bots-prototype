import { render, screen } from '@testing-library/react'
import { StatusIndicator } from '@/components/ui/features/characters/shared/StatusIndicator'

describe('StatusIndicator', () => {
  it('renders the status text', () => {
    render(<StatusIndicator status="Conectado" />)
    expect(screen.getByText('Conectado')).toBeInTheDocument()
  })

  it('applies green background for "Conectado"', () => {
    const { container } = render(<StatusIndicator status="Conectado" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('applies green background for "Listo"', () => {
    const { container } = render(<StatusIndicator status="Listo" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('applies red background for "Desconectado"', () => {
    const { container } = render(<StatusIndicator status="Desconectado" />)
    expect(container.firstChild).toHaveClass('bg-red-100')
  })

  it('applies red background for "Error"', () => {
    const { container } = render(<StatusIndicator status="Error" />)
    expect(container.firstChild).toHaveClass('bg-red-100')
  })

  it('applies blue background for an unknown status', () => {
    const { container } = render(<StatusIndicator status="Estado desconocido" />)
    expect(container.firstChild).toHaveClass('bg-blue-100')
  })

  it('shows "●" icon for connected status', () => {
    render(<StatusIndicator status="Conectado" />)
    expect(screen.getByText('●')).toBeInTheDocument()
  })

  it('shows "!" icon for "Error"', () => {
    render(<StatusIndicator status="Error" />)
    expect(screen.getByText('!')).toBeInTheDocument()
  })

  it('shows "!" icon for "No autenticado"', () => {
    render(<StatusIndicator status="No autenticado" />)
    expect(screen.getByText('!')).toBeInTheDocument()
  })
})
