import '@testing-library/jest-dom'
import { vi, beforeEach, beforeAll, afterAll } from 'vitest'

// Mock fetch globally for all tests
global.fetch = vi.fn()

// Mock matchMedia for react-hot-toast
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Setup fetch mock before each test
beforeEach(() => {
  fetch.mockClear()
})

// Mock console methods to avoid noise in test output
const originalError = console.error
beforeAll(() => {
  console.error = vi.fn()
})

afterAll(() => {
  console.error = originalError
})

// Custom test utilities
export const mockFetchSuccess = (data) => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  })
}

export const mockFetchError = (error = 'Network error') => {
  fetch.mockRejectedValueOnce(new Error(error))
}

export const mockFetchResponse = (ok, data) => {
  fetch.mockResolvedValueOnce({
    ok,
    json: async () => data,
  })
} 