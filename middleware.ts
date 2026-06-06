import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Se é rota pública, deixa passar
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Para outras rotas, verifica se tem sessão
  // Nota: Em produção, isto seria verificado com JWT/session real
  // Por enquanto, deixa a verificação para o lado do cliente

  return NextResponse.next();
}

// Aplica middleware a estas rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

