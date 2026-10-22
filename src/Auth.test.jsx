import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Auth from './Auth';

// Mock the firebase auth module
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}));

// Mock the firebase module itself
vi.mock('./firebase', () => ({
  auth: {},
}));

import { signInWithEmailAndPassword } from 'firebase/auth';

describe('Auth Component Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = (isRtl = false) => {
    const onLoginSuccess = vi.fn();
    const toggleLang = vi.fn();
    render(<Auth onLoginSuccess={onLoginSuccess} toggleLang={toggleLang} isRtl={isRtl} />);
    return { onLoginSuccess, toggleLang };
  };

  const submitForm = async () => {
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText('example@mail.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Sign In|دخول/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
  };

  it('displays "email already in use" error (English)', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    setup(false);

    // Switch to Sign Up mode (since email already in use typically happens on sign up, but we can test the error path regardless)
    // Actually the code handles it in the catch block for both, let's just trigger it.
    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('This email is already in use!')).toBeInTheDocument();
    });
  });

  it('displays "email already in use" error (Arabic)', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    setup(true);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('هذا الإيميل مسجل مسبقاً!')).toBeInTheDocument();
    });
  });

  it('displays "wrong password" error (English)', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/wrong-password' });
    setup(false);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('displays "user not found" error (English)', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/user-not-found' });
    setup(false);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('displays "wrong password/user not found" error (Arabic)', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/wrong-password' });
    setup(true);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('الإيميل أو كلمة المرور غير صحيحة')).toBeInTheDocument();
    });
  });

  it('displays "weak password" error (English)', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/weak-password' });
    setup(false);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('Weak password, must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('displays "weak password" error (Arabic)', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/weak-password' });
    setup(true);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('كلمة المرور ضعيفة، يجب أن تكون 6 أحرف على الأقل')).toBeInTheDocument();
    });
  });

  it('displays generic error for unknown codes (English)', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/unknown-error' });
    setup(false);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('An error occurred, please try again')).toBeInTheDocument();
    });
  });

  it('displays generic error for unknown codes (Arabic)', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/unknown-error' });
    setup(true);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('حدث خطأ، يرجى المحاولة مرة أخرى')).toBeInTheDocument();
    });
  });
});