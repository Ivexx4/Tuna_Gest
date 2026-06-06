'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Se está autenticado, redireciona para dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🎵</span>
            <span className="text-white font-bold text-xl">Tuna Manager</span>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/auth/login"
              className="text-white hover:text-gray-200 font-semibold transition"
            >
              Entrar
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition"
            >
              Registar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Gestão Completa de Tunas Académicas
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto mb-8">
            Organize membros, eventos, inventário, finanças e partituras de forma simples e intuitiva.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg transition"
            >
              Começar Agora →
            </Link>
            <Link
              href="/auth/login"
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-bold text-lg transition backdrop-blur-md"
            >
              Entrar
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '👥',
              title: 'Gestão de Membros',
              desc: 'Organize membros com roles e seções customizáveis',
            },
            {
              icon: '📅',
              title: 'Eventos & Presença',
              desc: 'Crie eventos e confirme presenças com cálculo de quórum',
            },
            {
              icon: '🎸',
              title: 'Inventário',
              desc: 'Rastreie instrumentos, trajes e equipamento',
            },
            {
              icon: '💰',
              title: 'Financeiro',
              desc: 'Gerencie transações e visualize relatórios',
            },
            {
              icon: '🎼',
              title: 'Partituras',
              desc: 'Biblioteca de músicas com histórico de prácticas',
            },
            {
              icon: '🔐',
              title: 'Segurança',
              desc: 'Autenticação segura com Supabase',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white hover:bg-white/20 transition"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-100">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 bg-white/10 backdrop-blur-md rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-gray-100 mb-6 max-w-xl mx-auto">
            Cria a tua conta agora e comece a gerir a tua Tuna em minutos.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition"
          >
            Registar Agora
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-200">
          <p>© 2026 Tuna Manager - Gestão de Tunas Académicas</p>
        </div>
      </footer>
    </div>
  );
}
