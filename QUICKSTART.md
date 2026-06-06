# 🚀 Quick Start - Comece em 5 Minutos

## Passo 1: Clone e Instale (2 min)

```bash
# Já feito! Projeto está em:
# C:\Users\ivoro\OneDrive\Ambiente de Trabalho\untitled1\tuna-manager

cd tuna-manager

# Instale dependências (se não estiverem já instaladas)
npm install
```

## Passo 2: Configurar Supabase (2 min)

1. Cria uma conta em https://supabase.com
2. Cria novo projeto (guarda o password em segurança!)
3. Vai a **Project Settings** > **API**
4. Copia `Project URL` e `Anon Key`
5. Edita `.env.local`:

```bash
# .env.local (substitui com as tuas credenciais)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Passo 3: Executar Schema (1 min)

1. Dashboard Supabase > **SQL Editor**
2. Nova Query
3. Copia todo o conteúdo de `database/schema.sql`
4. Executa
5. Aguarda confirmação ✓

## Passo 4: Rodar Projeto (bonus!)

```bash
npm run dev
# Abre http://localhost:3000
```

---

## 📁 Ficheiros Importantes

```
tuna-manager/
├── README.md                      ← Documentação completa
├── SUPABASE_SETUP.md             ← Setup detalhado do Supabase
├── DEVELOPMENT.md                 ← Como usar hooks e serviços
├── IMPLEMENTATION_CHECKLIST.md    ← Plano de desenvolvimento
├── database/schema.sql            ← Schema SQL do Supabase
├── .env.local                     ← Variáveis de ambiente (não fazer commit!)
├── .env.local.example             ← Template
├── app/                           ← Próximas páginas
├── components/                    ← Componentes React
├── lib/
│   ├── supabase.ts               ← Configuração Supabase
│   └── services.ts               ← Serviços (CRUD etc)
├── types/
│   └── database.ts               ← Tipos TypeScript
└── hooks/                         ← Custom hooks
    ├── useAuth.ts                ← Autenticação
    ├── useDatabase.ts            ← CRUD genérico
    └── index.ts                  ← Exports
```

---

## 🎯 Próximos Passos Recomendados

### Para Começar de Verdade (não vai levar mais de 30 min):

1. **Configuração Completa do Supabase** (15 min)
   - Seguir `SUPABASE_SETUP.md` em detalhe
   - Criar um bucket para partituras
   - Habilitar Realtime

2. **Criar Primeira Página de Login** (15 min)
   - Criar `app/auth/login/page.tsx`
   - Usar `useAuth()` hook
   - Testar signup/login

3. **Dashboard Simples** (15 min)
   - Criar `app/dashboard/page.tsx`
   - Listar dados básicos
   - Botão de logout

---

## 💡 Dicas Importantes

✅ **DO:**
- Comece pequeno: Login + Dashboard antes de CRUD completo
- Use hooks e serviços: Evita duplicação de código
- Teste no Supabase SQL Editor
- Leia DEVELOPMENT.md para ver exemplos

❌ **DON'T:**
- Não faça commit de `.env.local` (usa `.env.local.example`)
- Não exponha `SUPABASE_SERVICE_ROLE_KEY` no cliente
- Não ignore erros (sempre treat errors!)

---

## 📚 Recursos Variados

- **Documentação**: Abre `README.md`
- **Desenvolvimento**: Abre `DEVELOPMENT.md`
- **Setup Supabase**: Abre `SUPABASE_SETUP.md`
- **Checklist**: Abre `IMPLEMENTATION_CHECKLIST.md`

---

## 🏃 Atalhos Úteis

```bash
# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Start produção (após build)
npm start

# Gerar tipos do Supabase (futuro)
npx supabase gen types typescript
```

---

## 🆘 Troubleshooting

**Erro: "Cannot find module '@supabase/supabase-js'"**
```bash
npm install @supabase/supabase-js
```

**Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"**
- Verifica `.env.local` está preenchido
- Reinicia o servidor: `npm run dev`

**Erro: "Connection refused"**
- Projeto Supabase ainda a inicializar? Aguarda 5 min
- Verifica URL do Supabase está correta

---

## ✨ O que Foi Preparado para Ti

1. ✅ Projeto Next.js +Tailwind CSS
2. ✅ Integração Supabase completa
3. ✅ Schema SQL de 7 módulos
4. ✅ Tipos TypeScript prontos
5. ✅ Hooks reutilizáveis (useAuth, useFetch, etc)
6. ✅ Serviços pré-implementados
7. ✅ Documentação detalhada
8. ✅ Checklist de desenvolvimento

**Estás 100% pronto para começar a desenvolver! 🎉**

---

**Tempo total de setup**: ~5 minutos
**Tempo para primeira página funcional**: ~30 minutos
**Status**: Pronto para mergulhar! 🚀

---

Dúvidas? Consulta:
- `README.md` - Overview completo
- `SUPABASE_SETUP.md` - Setup passo a passo
- `DEVELOPMENT.md` - Exemplos de código

