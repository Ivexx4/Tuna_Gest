import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Tuna Manager',
    default: 'Tuna Manager - Gestão de Tunas Académicas',
  },
  description: "Plataforma completa para gestão de Tunas Académicas. Gere membros, eventos, inventário, finanças e partituras num só lugar.",
  keywords: ["tuna", "gestão", "académica", "membros", "partituras", "eventos"],
  authors: [{ name: "Tuna Manager Team" }],
  openGraph: {
    title: 'Tuna Manager',
    description: 'Plataforma completa para gestão de Tunas Académicas.',
    url: 'https://tunamanager.com',
    siteName: 'Tuna Manager',
    locale: 'pt_PT',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
