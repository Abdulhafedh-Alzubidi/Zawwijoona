import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Mock console.error to avoid cluttering the test output
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

const ThrowError = () => {
  throw new Error('Test Error!');
};

describe('ErrorBoundary', () => {
  it('renders children correctly when there are no errors', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child component throws an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Assert the fallback UI is rendered
    expect(screen.getByText('حدث خطأ أثناء تحميل التطبيق')).toBeInTheDocument();
    expect(screen.getByText('Error: Test Error!')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText('تحديث ومسح الذاكرة المؤقتة')).toBeInTheDocument();
    expect(screen.getByText('الرئيسية')).toBeInTheDocument();
  });

  it('handles reload button click', async () => {
    // Mock navigator.serviceWorker and caches
    const mockUnregister = vi.fn();
    const mockDelete = vi.fn();

    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: {
        getRegistrations: vi.fn().mockResolvedValue([{ unregister: mockUnregister }])
      },
      writable: true
    });

    Object.defineProperty(global, 'caches', {
      value: {
        keys: vi.fn().mockResolvedValue(['cache1']),
        delete: mockDelete
      },
      writable: true
    });

    const mockReload = vi.fn();
    vi.stubGlobal('location', {
      reload: mockReload,
      href: ''
    });

    // Mock localStorage and sessionStorage
    const storageClearSpy = vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('تحديث ومسح الذاكرة المؤقتة').closest('button');
    fireEvent.click(reloadButton);

    // Let async operations resolve
    await new Promise(process.nextTick);

    expect(mockUnregister).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith('cache1');
    expect(storageClearSpy).toHaveBeenCalledTimes(2); // once for local, once for session
    expect(mockReload).toHaveBeenCalled();

    storageClearSpy.mockRestore();
  });
});
