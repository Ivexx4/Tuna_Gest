import '@testing-library/jest-dom';
import React from 'react';

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.key';

// Mock react-pdf/pdfjs-dist to avoid ES module syntax errors in Jest
jest.mock('react-pdf', () => ({
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
  },
  Document: ({ children }: any) => <div>{children}</div>,
  Page: () => <div>PDF Page Mock</div>,
}));

// Mock ResizeObserver which is not available in jsdom
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver as any;
