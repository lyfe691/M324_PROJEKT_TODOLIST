import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from '../App'

// Simple mock helpers for cleaner tests
const mockSuccessResponse = (data) => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  })
}

const mockErrorResponse = () => {
  fetch.mockRejectedValueOnce(new Error('API Error'))
}

const mockPostResponse = (ok = true) => {
  fetch.mockResolvedValueOnce({
    ok,
    json: async () => ({}),
  })
}

describe('Todo App Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetch.mockReset()
  })

  it('renders app title and empty state', async () => {
    mockSuccessResponse([])
    render(<App />)
    
    expect(screen.getByText('ToDo Liste')).toBeInTheDocument()
    expect(screen.getByText('Neues Todo anlegen')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Was möchten Sie erledigen?')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('0 Tasks')).toBeInTheDocument()
    })
  })

  it('displays tasks when loaded', async () => {
    const tasks = [
      { taskdescription: 'Buy groceries', createdAt: '2024-01-01T10:00:00Z' },
      { taskdescription: 'Walk the dog', createdAt: '2024-01-01T11:00:00Z' }
    ]
    
    mockSuccessResponse(tasks)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
      expect(screen.getByText('Walk the dog')).toBeInTheDocument()
      expect(screen.getByText('2 Tasks')).toBeInTheDocument()
    })
  })

  it('shows correct task structure', async () => {
    const tasks = [
      { taskdescription: 'Test Task', createdAt: '2024-01-01T10:00:00Z' }
    ]
    
    mockSuccessResponse(tasks)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText(/erstellt am:/)).toBeInTheDocument()
      expect(screen.getByTitle('Mark as complete')).toHaveTextContent('✓')
    })
  })

  it('handles empty input correctly', async () => {
    mockSuccessResponse([])
    render(<App />)
    
    await waitFor(() => {
      const addButton = screen.getByText('Hinzufügen')
      expect(addButton).toBeDisabled()
    })
  })

  it('enables button when input has text', async () => {
    mockSuccessResponse([])
    const user = userEvent.setup()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('0 Tasks')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Was möchten Sie erledigen?')
    const addButton = screen.getByText('Hinzufügen')

    await user.type(input, 'New task')
    expect(addButton).not.toBeDisabled()
  })

  it('can add a task (API call verification)', async () => {
    const user = userEvent.setup()
    
    // Initial load
    mockSuccessResponse([])
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('0 Tasks')).toBeInTheDocument()
    })

    // Mock task creation
    mockPostResponse(true)
    // Mock updated list
    mockSuccessResponse([
      { taskdescription: 'New task', createdAt: '2024-01-01T10:00:00Z' }
    ])

    const input = screen.getByPlaceholderText('Was möchten Sie erledigen?')
    const addButton = screen.getByText('Hinzufügen')

    await user.type(input, 'New task')
    await user.click(addButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"taskdescription":"New task"')
      })
    })
  })

  it('can delete a task (API call verification)', async () => {
    const user = userEvent.setup()
    const tasks = [
      { taskdescription: 'Task to delete', createdAt: '2024-01-01T10:00:00Z' }
    ]
    
    mockSuccessResponse(tasks)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Task to delete')).toBeInTheDocument()
    })

    // Mock successful deletion
    mockPostResponse(true)
    
    const deleteButton = screen.getByTitle('Mark as complete')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskdescription: 'Task to delete' })
      })
    })

    // Task should be removed from UI immediately
    expect(screen.queryByText('Task to delete')).not.toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    mockErrorResponse()
    render(<App />)

    // Should show empty state even on error
    await waitFor(() => {
      expect(screen.getByText('Noch keine Aufgaben vorhanden. Fügen Sie Ihre erste Aufgabe hinzu!')).toBeInTheDocument()
    })
  })
}) 