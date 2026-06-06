import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Mock the entire supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

const mockUser = { id: '123', email: 'test@example.com' } as User;

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should start in a loading state and fetch the initial session', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: null } });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);

    // Wait for the initial useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set user if a session exists', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle sign in successfully', async () => {
    const { result } = renderHook(() => useAuth());

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ error: null });

    await act(async () => {
      await result.current.signInWithEmail('test@example.com', 'password');
    });

    // Note: The user state is updated by onAuthStateChange, which we can simulate
    const authStateChangeCallback = (supabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
    act(() => {
      authStateChangeCallback('SIGNED_IN', { user: mockUser });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle sign in failure', async () => {
    const { result } = renderHook(() => useAuth());
    const signInError = new Error('Invalid credentials');
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ error: signInError });

    await expect(
      act(async () => {
        await result.current.signInWithEmail('test@example.com', 'wrong-password');
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.user).toBeNull();
  });

  it('should handle logout', async () => {
    // Start with a logged-in user
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.isAuthenticated).toBe(true);

    // Perform logout
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
