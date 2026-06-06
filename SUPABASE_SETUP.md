# 🚀 GUIA DE SETUP - Supabase

Este guia detalha como configurar o Supabase para o Tuna Manager.

## PASSO 1: Criar Projeto Supabase

### 1.1 Criar Conta
1. Vai a https://supabase.com
2. Clica "Sign Up"
3. Usa email ou GitHub para criar conta
4. Confirma o email

### 1.2 Criar Novo Projeto
1. Clica "New Project"
2. Preenche:
   - **Organization**: Cria uma (ex: "Tuna Manager")
   - **Project Name**: `tuna-manager-dev`
   - **Database Password**: Guarda numa Password Manager! (ex: 1Password, Bitwarden)
   - **Region**: Escolhe o mais próximo (Europa: `eu-central-1` ou `eu-west-1`)
3. Clica "Create new project"
4. **Aguarda 3-5 minutos** para a inicialização

## PASSO 2: Copiar Credenciais

### 2.1 Obter URLs e Chaves

1. Projeto criado, na dashboard:
2. Vai a **Project Settings** (engrenagem, canto inferior esquerdo)
3. Clica **API**
4. Verás:
   - **Project URL**: `https://abcdefghij.supabase.co` (copiar)
   - **Anon key**: Começa com `eyJh...` (copiar)
   - **Service Role key**: Começa com `eyJh...` MAIOR (copiar com cuidado)

### 2.2 Atualizar .env.local

```bash
# Na raiz do projeto (tuna-manager/)
cp .env.local.example .env.local
```

Abre `.env.local` e preenche:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh... (o mais longo)
```

## PASSO 3: Executar Schema SQL

### 3.1 Via SQL Editor (Recomendado)

1. Na dashboard Supabase
2. Clica **SQL Editor** (ícone do lado esquerdo)
3. Clica **New Query**
4. Abre o ficheiro `database/schema.sql`
5. Copia **TODO** o conteúdo
6. Cola na query do Supabase
7. Clica **RUN**
8. Aguarda confirmação: "✓ Query successful"

### 3.2 Verificar Tabelas

Após executar o schema:

1. Vai a **Table Editor** (sidebar esquerdo)
2. Deverás ver as tabelas:
   - tunas
   - hierarchy_roles
   - instrument_sections
   - members
   - member_role_history
   - events
   - event_attendances
   - inventory_items
   - inventory_loans
   - financial_categories
   - financial_transactions
   - sheet_music
   - music_practices

## PASSO 4: Configurar Storage (Para Partituras)

### 4.1 Criar Bucket

1. Na dashboard, vai a **Storage** (sidebar)
2. Clica **Create bucket**
3. Nome: `sheet-music`
4. Deixar "Public bucket" DESMARCADO (privado por segurança)
5. Clica **Create**

### 4.2 Configurar Permissões (RLS)

1. Clica no bucket `sheet-music`
2. Clica **Policies**
3. Clica **New policy**

Para leitura (users autenticado):
```sql
-- Permitir leitura de ficheiros para users autenticados
create policy "Allow authenticated users to read" on storage.objects
for select
using (auth.role() = 'authenticated' AND bucket_id = 'sheet-music');
```

Para upload (users autenticado):
```sql
-- Permitir upload para users autenticados
create policy "Allow authenticated users to upload" on storage.objects
for insert
with check (auth.role() = 'authenticated' AND bucket_id = 'sheet-music');
```

## PASSO 5: Configurar Autenticação

### 5.1 Habilitar Auth Providers

1. Na dashboard, vai a **Authentication** (sidebar)
2. Clica **Providers**
3. Habilita os que queres:
   - **Email** (recomendado)
   - **GitHub** (para desenvolvimento)
   - **Google** (opcional)

### 5.2 Configurar Email

1. **Authentication** > **Email**
2. Deixar padrão (usar SMTP do Supabase por enquanto)
3. Testar: Uma vez com signup, receberás email de confirmação

### 5.3 Configurar Redirect URLs (Importante!)

1. **Authentication** > **URL Configuration**
2. Em **Redirect URLs**, adiciona:
   ```
   http://localhost:3000/**
   https://seu-dominio.com/**
   ```

## PASSO 6: Habilitar Realtime (Notificações em Tempo Real)

### 6.1 Configurar Realtime

1. Na dashboard, vai a **Database** > **Replication**
2. Clica na tabela que queres com realtime:
   - events
   - event_attendances
   - financial_transactions
3. Marca a checkbox para habilitar

## PASSO 7: Testar Conexão

### 7.1 Verificar Variáveis

```bash
cd tuna-manager
cat .env.local  # Verifica que tem os valores
```

### 7.2 Teste de Conexão

Cria um ficheiro `test-supabase.ts` na pasta `lib`:

```typescript
import { supabase } from './supabase';

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('tunas')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Erro:', error.message);
      return;
    }

    console.log('✓ Conexão bem-sucedida!');
    console.log('Tunas encontradas:', data?.length || 0);
  } catch (err) {
    console.error('Erro de conexão:', err);
  }
}

testConnection();
```

Executa:
```bash
npx ts-node lib/test-supabase.ts
```

## PASSO 8: Dados de Teste (Opcional)

Para testar com dados reais, executa este SQL no Supabase:

```sql
-- Inserir uma Tuna
INSERT INTO tunas (name, slug, location) VALUES 
('FAN-Farra', 'fan-farra', 'Universidade X');

-- Inserir Roles
INSERT INTO hierarchy_roles (tuna_id, name, display_name, level) VALUES
((SELECT id FROM tunas WHERE slug = 'fan-farra'), 'caloiro', 'Caloiro', 0),
((SELECT id FROM tunas WHERE slug = 'fan-farra'), 'veterano', 'Veterano', 1),
((SELECT id FROM tunas WHERE slug = 'fan-farra'), 'director', 'Diretor', 2);

-- Inserir Sections
INSERT INTO instrument_sections (tuna_id, name, display_name, color) VALUES
((SELECT id FROM tunas WHERE slug = 'fan-farra'), 'guitarra', 'Guitarra', '#FF6B6B'),
((SELECT id FROM tunas WHERE slug = 'fan-farra'), 'acordeao', 'Acordeão', '#4ECDC4'),
((SELECT id FROM tunas WHERE slug = 'fan-farra'), 'cavaquinho', 'Cavaquinho', '#FFE66D');
```

## TROUBLESHOOTING

### Erro: "NEXT_PUBLIC_SUPABASE_URL is undefined"
- Solução: Verifica `.env.local` está preenchido corretamente
- O servidor local pode precisar ser reiniciado após mudar env vars

### Erro: "PostgreSQL connection failed"
- Solução: Verifica se o projeto Supabase está totalmente inicializado (pode levar 5 min)

### Erro: "Invalid credentials"
- Solução: Verifica se copiastes corretamente as chaves (sem espaços extras)

### Erro: "Cross-Origin Request Blocked (CORS)"
- Solução: Na URL Configuration, adiciona o teu domínio nos Redirect URLs

## ✅ Checklist Final

- [ ] Conta Supabase criada
- [ ] Projeto criado e inicializado
- [ ] Credenciais copiadas em `.env.local`
- [ ] Schema SQL executado
- [ ] Todas as tabelas visíveis no Table Editor
- [ ] Storage bucket `sheet-music` criado
- [ ] Auth providers habilitados
- [ ] Realtime habilitado para tabelas principais
- [ ] Teste de conexão bem-sucedido

## 🎉 Pronto!

O Supabase está configurado e pronto para desenvolver!

Próximo passo: Criar a interface de autenticação e CRUD.

---

**Dúvidas?** Consulta [Supabase Docs](https://supabase.com/docs) ou o README.md

