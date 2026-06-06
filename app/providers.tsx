'use client';

import { ThemeProvider } from '@/contexts/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
