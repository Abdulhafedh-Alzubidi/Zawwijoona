import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as firebaseAuth from 'firebase/auth';

// Mock dependencies
vi.mock('./firebase', () => ({
  auth: {},
  db: {}
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false, data: () => ({}) }),
}));

vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />
}));

vi.mock('./Auth', () => ({
  default: () => <div data-testid="auth-component">Auth Component</div>
}));

vi.mock('./components/WeddingModeSelector', () => ({
  default: () => <div data-testid="wedding-mode-selector">Wedding Mode Selector</div>
}));

vi.mock('./components/MassWeddingSetupScreen', () => ({
  default: () => <div data-testid="mass-wedding-setup">Mass Wedding Setup</div>
}));

vi.mock('./components/MassWeddingDashboard', () => ({
  default: () => <div data-testid="mass-wedding-dashboard">Mass Wedding Dashboard</div>
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage to reset any local state
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
      // Do nothing to simulate loading
      return vi.fn();
    });

    render(<App />);
    expect(screen.getByText(/Loading...|جاري التحميل.../)).toBeInTheDocument();
  });

  it('renders Auth component when user is not authenticated', async () => {
    firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null); // Not authenticated
      return vi.fn();
    });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('auth-component')).toBeInTheDocument();
    });
  });

  it('renders WeddingModeSelector when user is authenticated but no mode is selected', async () => {
    firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
      callback({ uid: '123', email: 'test@example.com' }); // Authenticated
      return vi.fn();
    });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('wedding-mode-selector')).toBeInTheDocument();
    });
  });
});
