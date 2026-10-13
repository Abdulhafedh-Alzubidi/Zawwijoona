import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Auth from './Auth';
import { vi } from 'vitest';

// Mock Firebase auth methods
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}));

// Mock Firebase config
vi.mock('./firebase', () => ({
  auth: {},
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Mail: () => <div data-testid="icon-mail" />,
  Lock: () => <div data-testid="icon-lock" />,
  AlertCircle: () => <div data-testid="icon-alert" />,
  User: () => <div data-testid="icon-user" />,
  Eye: () => <div data-testid="icon-eye" />,
  EyeOff: () => <div data-testid="icon-eye-off" />,
}));
describe('Auth Component', () => {
  const mockOnLoginSuccess = vi.fn();
  const mockToggleLang = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial sign in view in English', () => {
    render(<Auth onLoginSuccess={mockOnLoginSuccess} toggleLang={mockToggleLang} isRtl={false} />);

    expect(screen.getByText('Welcome Back 👋')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('example@mail.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders initial sign in view in Arabic', () => {
    render(<Auth onLoginSuccess={mockOnLoginSuccess} toggleLang={mockToggleLang} isRtl={true} />);

    expect(screen.getByText('أهلاً بك مجدداً 👋')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'دخول' })).toBeInTheDocument();
  });

  it('toggles to sign up view and shows username field', async () => {
    render(<Auth onLoginSuccess={mockOnLoginSuccess} toggleLang={mockToggleLang} isRtl={false} />);

    const signUpLink = screen.getByText('Sign Up', { selector: 'button.text-amber-600' });
    await userEvent.click(signUpLink);

    expect(screen.getByText('Create New Account 💍')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your Beautiful Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up', exact: true })).toBeInTheDocument();
  });

  it('calls toggleLang when language switch button is clicked', async () => {
    render(<Auth onLoginSuccess={mockOnLoginSuccess} toggleLang={mockToggleLang} isRtl={false} />);

    const langButton = screen.getByText('التبديل إلى العربية');
    await userEvent.click(langButton);

    expect(mockToggleLang).toHaveBeenCalledTimes(1);
  });

  it('submits sign in form and calls signInWithEmailAndPassword', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    signInWithEmailAndPassword.mockResolvedValueOnce({});

    render(<Auth onLoginSuccess={mockOnLoginSuccess} toggleLang={mockToggleLang} isRtl={false} />);

    await userEvent.type(screen.getByPlaceholderText('example@mail.com'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');

    const submitBtn = screen.getByRole('button', { name: 'Sign In' });
    await userEvent.click(submitBtn);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('submits sign up form and calls createUserWithEmailAndPassword', async () => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '123' } });
    updateProfile.mockResolvedValueOnce();

    render(<Auth onLoginSuccess={mockOnLoginSuccess} toggleLang={mockToggleLang} isRtl={false} />);

    // Switch to Sign Up
    await userEvent.click(screen.getByText('Sign Up', { selector: 'button.text-amber-600' }));

    await userEvent.type(screen.getByPlaceholderText('Your Beautiful Name'), 'Test User');
    await userEvent.type(screen.getByPlaceholderText('example@mail.com'), 'new@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'newpassword');

    const submitBtn = screen.getByRole('button', { name: 'Sign Up' });
    await userEvent.click(submitBtn);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'new@example.com', 'newpassword');
    expect(updateProfile).toHaveBeenCalledWith({ uid: '123' }, { displayName: 'Test User' });

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error message on sign in failure', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/wrong-password' });

    render(<Auth onLoginSuccess={mockOnLoginSuccess} toggleLang={mockToggleLang} isRtl={false} />);

    await userEvent.type(screen.getByPlaceholderText('example@mail.com'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');

    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });
});
