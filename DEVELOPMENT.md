# 📚 Documentação Técnica - Tuna Manager

## 1. Arquitetura e Camadas

```
┌─────────────────────────────────────────┐
│     React Components (UI)                │
│  ┌──────────────────────────────────┐   │
│  │  useAuth() | useFetch() etc.     │   │◄─── Custom Hooks
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
            │
            │ (usam)
            ▼
┌─────────────────────────────────────────┐
│  Services Layer (lib/services.ts)        │
│  - memberService                         │
│  - eventService                          │
│  - inventoryService                      │
│  - financialService                      │
│  - musicService                          │
└─────────────────────────────────────────┘
            │
            │ (chamam)
            ▼
┌─────────────────────────────────────────┐
│  Supabase Client (lib/supabase.ts)       │
│  PostgreSQL API                          │
└─────────────────────────────────────────┘
            │
            │
            ▼
┌─────────────────────────────────────────┐
│  Supabase Backend                        │
│  - PostgreSQL Database                   │
│  - Authentication                        │
│  - Storage (PDFs)                        │
│  - Realtime                              │
└─────────────────────────────────────────┘
```

## 2. Hooks Disponíveis

### useAuth() - Gerir Autenticação

**Importar:**
```typescript
import { useAuth } from '@/hooks';
```

**Usar em Componente:**
```typescript
export function LoginPage() {
  const { isAuthenticated, loading, signInWithEmail } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await signInWithEmail('user@example.com', 'password');
    }}>
      {/* Form fields... */}
    </form>
  );
}
```

**Métodos Disponíveis:**
- `user: User | null` - Utilizador autenticado
- `isAuthenticated: boolean` - Boolean if logged in
- `loading: boolean` - Enquanto carrega
- `error: string | null` - Mensagem de erro
- `signInWithEmail(email, password)` - Login
- `signUpWithEmail(email, password)` - Signup
- `logout()` - Logout

---

### useFetch() - Buscar Dados

**Importar:**
```typescript
import { useFetch } from '@/hooks';
import { Member } from '@/types/database';
```

**Exemplo 1: Buscar todos os membros**
```typescript
export function MembersList() {
  const { data, loading, error, refetch } = useFetch<Member>(
    'members'
  );

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      {data.map(member => (
        <div key={member.id}>{member.name}</div>
      ))}
      <button onClick={refetch}>Recarregar</button>
    </div>
  );
}
```

**Exemplo 2: Com filtros customizados**
```typescript
export function ActiveMembersOnly() {
  const { data } = useFetch<Member>(
    'members',
    (q) => q.eq('status', 'active').order('name')
  );

  return <>{/* render members */}</>;
}
```

**Exemplo 3: Com relações (joins)**
```typescript
export function MembersWithRoles() {
  const { data } = useFetch<MemberWithRelations>(
    'members',
    (q) => q.select(`
      *,
      role:hierarchy_roles(*),
      section:instrument_sections(*)
    `)
  );

  return (
    <>
      {data.map(member => (
        <div key={member.id}>
          {member.name} - {member.role?.display_name}
        </div>
      ))}
    </>
  );
}
```

---

### useInsert() - Inserir Dados

**Exemplo:**
```typescript
export function CreateMemberForm() {
  const { execute, loading, error } = useInsert<Member>('members');

  const handleSubmit = async (formData: Member) => {
    try {
      const result = await execute(formData);
      console.log('Membro criado:', result);
      // Atualizar lista, redireccionar, etc.
    } catch (err) {
      console.error('Erro ao criar:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({/* form data */});
    }}>
      {/* Form fields... */}
      <button disabled={loading}>
        {loading ? 'Criando...' : 'Criar'}
      </button>
      {error && <span className="text-red-500">{error.message}</span>}
    </form>
  );
}
```

---

### useUpdate() - Atualizar Dados

**Exemplo:**
```typescript
export function EditMemberForm({ memberId }: { memberId: number }) {
  const { execute, loading, error } = useUpdate<Member>('members');

  const handleSubmit = async (updates: Partial<Member>) => {
    await execute({
      id: memberId,
      ...updates,
    });
  };

  return (<form onSubmit={...}>...</form>);
}
```

---

### useDelete() - Deletar Dados

**Exemplo:**
```typescript
export function DeleteMemberButton({ memberId }: { memberId: number }) {
  const { execute, loading, error } = useDelete('members');

  const handleDelete = async () => {
    if (confirm('Tem a certeza?')) {
      await execute(memberId);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Deletando...' : 'Deletar'}
    </button>
  );
}
```

---

## 3. Services (Lógica Encapsulada)

Use os serviços para operações complexas que envolvem múltiplas queries ou lógica de negócio.

### memberService

```typescript
import { memberService } from '@/lib/services';

// Buscar todos com relações
const { data: members } = await memberService.getMembers(tunaId);

// Buscar específico
const { data: member } = await memberService.getMember(memberId);

// Criar
const { data: newMember } = await memberService.createMember({
  tuna_id: tunaId,
  name: 'João Silva',
  email: 'joao@example.com',
  role_id: 1,
  section_id: 2,
  status: 'active'
});

// Atualizar
await memberService.updateMember(memberId, {
  name: 'Nova Nome',
  role_id: 3
});

// Deletar
await memberService.deleteMember(memberId);

// Por seção
const { data: guitarists } = await memberService.getMembersBySection(tunaId, guitarSectionId);

// Registar mudança de role (auditoria)
await memberService.recordRoleChange(
  memberId,
  oldRoleId,
  newRoleId,
  currentUserId
);
```

### eventService

```typescript
import { eventService } from '@/lib/services';

// Buscar eventos
const { data: events } = await eventService.getEvents(tunaId);

// Buscar com presenças
const { data: eventWithAttendances } = await eventService.getEventWithAttendances(eventId);

// Criar evento
const { data: event } = await eventService.createEvent({
  tuna_id: tunaId,
  title: 'Ensaio de Segunda',
  event_type: 'rehearsal',
  event_date: '2026-06-10T19:00:00Z',
  location: 'Auditório'
});

// Registar presença
await eventService.setAttendance(eventId, memberId, 'confirmed');

// Obter quórum por naipe
const { data: quorum } = await eventService.getQuorumBySections(eventId);
```

### inventoryService

```typescript
import { inventoryService } from '@/lib/services';

// Itens
const { data: items } = await inventoryService.getItems(tunaId);
const { data: newItem } = await inventoryService.createItem({
  tuna_id: tunaId,
  name: 'Guitarra Clássica',
  item_type: 'instrument',
  code: 'GIT-001',
  section_id: 1
});

// Empréstimos
const { data: loan } = await inventoryService.createLoan(itemId, memberId, 'excellent');
await inventoryService.returnLoan(loanId, 'good', currentUserId);

// Empréstimos atual
const { data: currentLoans } = await inventoryService.getCurrentLoans();
const { data: memberLoans } = await inventoryService.getCurrentLoans(memberId);
```

### financialService

```typescript
import { financialService } from '@/lib/services';

// Transações
const { data: transactions } = await financialService.getTransactions(tunaId);
const { data: filtered } = await financialService.getTransactions(
  tunaId,
  '2026-01-01',
  '2026-06-30'
);

// Criar transação
const { data: transaction } = await financialService.createTransaction({
  tuna_id: tunaId,
  category_id: 1,
  amount: 100,
  type: 'income',
  description: 'Subsídio de membro',
  transaction_date: '2026-06-05'
});

// Resumo
const { data: summary } = await financialService.getFinancialSummary(tunaId);
```

### musicService

```typescript
import { musicService } from '@/lib/services';

// Buscar partituras
const { data: music } = await musicService.getSheetMusic(tunaId);

// Pesquisar
const { data: results } = await musicService.searchSheetMusic(tunaId, 'fado');

// Criar partitura
const { data: newMusic } = await musicService.createSheetMusic({
  tuna_id: tunaId,
  title: 'Noites Marítimas',
  composer: 'João dos Santos',
  file_url: 'https://supabase.storage/sheet-music/...',
  difficulty_level: 'intermediate'
});

// Registar prática
await musicService.recordPractice(musicId, eventId, 'rehearsing');
```

---

## 4. Padrão: Componente Completo (CRUD)

```typescript
'use client';

import { useState } from 'react';
import { useAuth, useFetch, useInsert, useUpdate, useDelete } from '@/hooks';
import { memberService } from '@/lib/services';
import { Member } from '@/types/database';

export default function MembersPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: members, loading, refetch } = useFetch<Member>('members');
  const { execute: insertMember } = useInsert<Member>('members');
  const { execute: updateMember } = useUpdate<Member>('members');
  const { execute: deleteMember } = useDelete('members');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Member>>({});

  const handleCreate = async () => {
    await insertMember({
      tuna_id: 1,
      ...formData,
      status: 'active',
    } as Member);
    setFormData({});
    refetch();
  };

  const handleUpdate = async (id: number) => {
    await updateMember({
      id,
      ...formData,
    } as Member & { id: number });
    setEditingId(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem a certeza?')) {
      await deleteMember(id);
      refetch();
    }
  };

  if (!isAuthenticated) return <div>Não autenticado</div>;
  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gestão de Membros</h1>

      {/* Form */}
      <div className="p-4 border rounded">
        <input
          type="text"
          placeholder="Nome"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <button
          onClick={() => (editingId ? handleUpdate(editingId) : handleCreate())}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingId ? 'Atualizar' : 'Criar'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex justify-between p-3 border rounded">
            <span>{member.name}</span>
            <div className="space-x-2">
              <button onClick={() => setEditingId(member.id)}>Editar</button>
              <button onClick={() => handleDelete(member.id)}>Deletar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Próximos Passos

### Para Implementar Autenticação:
1. Criar página `/app/login` com `useAuth()`
2. Criar middleware para proteção de rotas privadas
3. Configurar redirect após login

### Para Implementar CRUD de Membros:
1. Criar componentes em `/app/members`
2. Usar `memberService` e hooks
3. Adicionar validação de formulários

### Para Notificações em Tempo Real:
```typescript
const subscription = supabase
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'events' 
    },
    (payload) => {
      console.log('Evento atualizado:', payload);
      refetch(); // Recarregar
    }
  )
  .subscribe();
```

---

## 6. Boas Práticas

✅ **DO:**
- Usar serviços para lógica complexa
- Componentizar UI reutilizável
- Tratar erros apropriadamente
- Implementar loading states
- Usar TypeScript para segurança

❌ **DON'T:**
- Expor service role key no cliente
- Fazer queries sem tipagem
- Esquecer tratamento de erros
- Não validar input do utilizador
- Fazer múltiplas queries em loop

---

**Última atualização**: 2026-06-05

