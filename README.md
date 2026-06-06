# Tuna Manager - MVP Documentation

## 🎵 Sobre o Projeto

**Tuna Manager** é uma plataforma SaaS moderna para gestão logística, financeira e patrimonial de Tunas Académicas (associações culturais universitárias).

### Stack Tecnológico

- **Frontend**: Next.js 14+ com TypeScript
- **UI**: Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Armazenamento**: Supabase Storage (PDFs de partituras)
- **Tempo Real**: Supabase Realtime

## 📋 Requisitos do Sistema

- Node.js 18+ 
- npm ou yarn
- Conta Supabase (gratuita em https://supabase.com)

## 🚀 Guia de Instalação e Setup

### 1. Instalação Inicial

A estrutura base já foi criada. Para continuar:

```bash
cd tuna-manager
npm install
# ou
yarn install
```

### 2. Setup do Supabase

#### 2.1 Criar uma conta e projeto Supabase

1. Acede a https://supabase.com e cria uma conta
2. Cria um novo projeto (ex: "tuna-manager-dev")
3. Aguarda a inicialização do projeto
4. Na dashboard, vai a **Project Settings** > **API**

#### 2.2 Copiar credenciais

3. Copia a **Project URL** e a **ANON KEY**
4. Edita o ficheiro `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-key-here
```

#### 2.3 Executar o Schema SQL

1. Na dashboard do Supabase, vai a **SQL Editor**
2. Clica em "New Query"
3. Copia o conteúdo de `database/schema.sql`
4. Cola na query e executa
5. Aguarda a confirmação de sucesso

### 3. Desenvolvimento Local

```bash
npm run dev
# Abre http://localhost:3000
```

## 📁 Estrutura do Projeto

```
tuna-manager/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/               # API Routes
├── components/            # Componentes React reutilizáveis
├── lib/                   # Utilitários e configuração
│   └── supabase.ts       # Cliente Supabase
├── types/                 # Tipos TypeScript
│   └── database.ts       # Tipos das entidades
├── database/             # Scripts e schemas SQL
│   └── schema.sql        # Schema completo da BD
├── public/               # Ficheiros estáticos
├── .env.local           # Variáveis de ambiente (não fazer commit)
└── package.json         # Dependências

```

## 🗂️ Arquitetura da Base de Dados

O schema foi desenhado para suportar:

### 1. **Módulo de Membros e Hierarquia**
- `tunas` - Múltiplas tunas na mesma plataforma
- `hierarchy_roles` - Cargos customizáveis (Caloiro, Veterano, etc.)
- `instrument_sections` - Naipes (Guitarra, Acordeão, Cavaquinho, etc.)
- `members` - Membros asociados
- `member_role_history` - Auditoria de mudanças

### 2. **Módulo de Logística (Escalonamento)**
- `events` - Ensaios, atuações, encontros
- `event_attendances` - Confirmação de presenças
- `event_quorum_by_section` - Vista para monitorar quorem por naipe

### 3. **Módulo de Inventário**
- `inventory_items` - Instrumentos, trajes, equipamento
- `inventory_loans` - Histórico e posse atual de itens
- `current_inventory_loans` - Vista das posse atual

### 4. **Módulo Financeiro**
- `financial_categories` - Categorias de receitas e despesas
- `financial_transactions` - Registo de fluxos de caixa
- `financial_summary` - Vista de resumo por período

### 5. **Módulo de Reportório**
- `sheet_music` - Metadados de partituras/músicas
- `music_practices` - Histórico de prácticas e performances

### 6. **Row Level Security (RLS)**
- Configurado mas desativado por padrão
- Ativar depois de configurar políticas de autenticação

## 🔐 Segurança

### Variáveis de Ambiente Sensíveis
- **NEVER** faz commit do `.env.local`
- Usa `.env.local.example` como template
- Em produção, configura as env vars no host (Vercel, etc.)

### Row Level Security (RLS)
O schema possui RLS habilitado para todas as tabelas principais. Configuraremos as políticas na próxima fase:

```sql
-- Exemplo de política RLS (a ser implementada)
CREATE POLICY "Users can view own tuna data"
ON members FOR SELECT
USING (tuna_id IN (
  SELECT tuna_id FROM members WHERE user_id = auth.uid()
));
```

## 📱 PWA (Progressive Web App)

Para ativar modo offline e acesso mobile:

1. Cria `public/manifest.json`
2. Instala `next-pwa`:
   ```bash
   npm install next-pwa
   ```
3. Configura em `next.config.js`

## 🧪 Próximos Passos

### Fase 1 (Setup) - ✅ COMPLETA
- [x] Criar projeto Next.js
- [x] Instalar Tailwind CSS
- [x] Configurar Supabase
- [x] Criar schema SQL completo
- [x] Definir tipos TypeScript

### Fase 2 (Autenticação)
- [ ] Setup Supabase Auth
- [ ] Página de login/signup
- [ ] Proteção de rotas (middleware)
- [ ] Gestão de sessões

### Fase 3 (CRUD de Membros)
- [ ] Criar componentes de listagem
- [ ] Formulário de novo membro
- [ ] Edição de membros
- [ ] Gestão de roles

### Fase 4 (Eventos e Presença)
- [ ] Interface de eventos
- [ ] Sistema de confirmação de presença
- [ ] Dashboard de quórum

...e assim sucessivamente com os outros módulos.

## 📚 Recursos Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 💬 Perguntas Frequentes

**P: Como adiciono um novo módulo?**
R: Seguindo o padrão:
1. Define o schema SQL
2. Cria os tipos TypeScript
3. Implementa a camada de API
4. Cria os componentes UI

**P: Como executo queries complexas?**
R: Usa as vistas SQL pré-definidas ou cria chamadas RPC no Supabase.

**P: Onde fico com os ficheiros das partituras?**
R: Supabase Storage - cria um bucket chamado `sheet-music` e guarda os PDFs lá.

## 📖 Licença

Este projeto é proprietário e confidencial.

---

**Status**: MVP em desenvolvimento
**Última atualização**: 2026-06-05
