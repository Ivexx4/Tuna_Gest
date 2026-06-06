# 🎯 Checklist de Implementação

Use este documento para acompanhar o progresso do desenvolvimento.

## FASE 1: Setup ✅ COMPLETA

- [x] Criar projeto Next.js
- [x] Instalar Tailwind CSS
- [x] Instalar Supabase client
- [x] Configurar variáveis de ambiente
- [x] Criação do schema SQL completo
- [x] Criar tipos TypeScript
- [x] Criar hooks reutilizáveis (useAuth, useFetch, etc)
- [x] Criar serviços (memberService, eventService, etc)
- [x] Documentação técnica

**Próximo**: Começar FASE 2

---

## FASE 2: Autenticação & Setup Base ✅ COMPLETA

### 2.1 Setup Supabase Auth
- [x] Criar página de login (`/app/auth/login`)
  - [x] Formulário de Email/Password
  - [x] Link signUp
  - [x] Validação de formulário
  - [x] Mensagens de erro
  
- [x] Criar página de signup (`/app/auth/signup`)
  - [x] Formulário com email, password, confirmPassword
  - [x] Validação
  - [x] Redireção após signup bem-sucedido
  
- [x] Criar middleware de proteção
  - [x] Arquivo `/middleware.ts`
  - [x] Rediretir para login se não autenticado
  - [x] Permitir rotas públicas
  
- [x] Criar layout de autenticação
  - [x] Componente Header com user info
  - [x] Botão de logout
  - [x] Avatar do utilizador

### 2.2 Páginas Base
- [x] Dashboard principal (`/app/dashboard`)
  - [x] Estatísticas resumidas
  - [x] Links para módulos
  - [x] Atividade recente
  
- [x] Landing page (`/`)
  - [x] Hero section com CTA
  - [x] Features showcase
  - [x] Redirecionamento automático
  
- [x] Página de configurações (`/settings`)
  - [x] Perfil do utilizador
  - [x] Preferências
  - [x] Zona de risco

**Tempo estimado**: ~2 horas ✅ COMPLETO
**Próximo**: FASE 3

---

## FASE 3: Módulo de Membros

### 3.1 Páginas
- [x] Lista de membros (`/app/members`)
  - [x] Tabela com all members
  - [x] Filtrar por seção
  - [x] Filtrar por role
  - [x] Pesquisa por nome
  - [x] Botões editar/deletar
  
- [x] Novo membro (`/app/members/new`)
  - [x] Formulário completo
  - [x] Validação
  - [x] Associar role e seção
  
- [x] Editar membro (`/app/members/[id]/edit`)
  - [x] Pré-encher dados
  - [x] Possibilidade de mudar role (com auditoria)
  - [ ] Histórico de mudanças
  
- [x] Perfil membro (`/app/members/[id]`)
  - [x] Visão geral
  - [x] Histórico de eventos
  - [x] Itens emprestados
  - [x] Histórico de roles

### 3.2 Componentes
- [x] Tabela de membros reutilizável
- [x] Formulário de membro
- [x] Card de membro
- [x] Filtros

### 3.3 Funcionalidades
- [x] CRUD completo de membros
- [x] Associar role (com histórico)
- [x] Associar seção/naipe
- [x] Marcar como alumni/inactive
- [ ] Importar membros (CSV - opcional)

**Tempo estimado**: 2-3 dias
**Próximo**: FASE 4

---

## FASE 4: Módulo de Logística (Eventos) ✅ COMPLETA

### 4.1 Páginas
- [x] Lista de eventos (`/app/events`)
  - [x] Tabela com próximos eventos
  - [x] Filtrar por tipo
  - [x] Ver quórum por seção
  
- [x] Novo evento (`/app/events/new`)
  - [x] Formulário (título, data, tipo, local, etc)
  - [x] Selecionar seções obrigatórias
  - [x] Definir quórum esperado
  
- [x] Detalhe evento (`/app/events/[id]`)
  - [x] Informações do evento
  - [x] Lista de membros com status
  - [x] Quórum por seção (visual)
  - [x] Confirmações em tempo real (Realtime)
  
- [x] Confirmação de presença
  - [x] Página pública para membros confirmarem
  - [x] Opções: Confirmado, Declinar, Ausente
  - [x] Histórico de presences

### 4.2 Componentes
- [x] Card de evento
- [x] Tabela de attendances
- [x] Visualizador de quórum (chart)
- [x] Botões de confirmação

### 4.3 Funcionalidades
- [x] Criar eventos
- [x] Notificações de eventos novos (Email via Supabase)
- [x] Membros confirmarem presença
- [x] Calcular quórum por seção
- [x] Relatório de absentismo

**Tempo estimado**: 2-3 dias
**Próximo**: FASE 5

---

## FASE 5: Módulo de Inventário ✅ COMPLETA

### 5.1 Páginas
- [x] Lista inventário (`/app/inventory`)
  - [x] Tabela de itens
  - [x] Filtrar por tipo
  - [x] Filtrar por status
  - [x] Filtrar por seção
  
- [x] Novo item (`/app/inventory/new`)
  - [x] Formulário (nome, código, tipo, preço, etc)
  - [x] Upload de imagem
  
- [x] Detalhe item (`/app/inventory/[id]`)
  - [x] Informações do item
  - [x] Histórico de empréstimos
  - [x] Quem tem agora
  - [x] Botão emprestar/devolver
  
- [x] Historiador de empréstimos (`/app/inventory/loans`)
  - [x] Ver quem tem cada item
  - [x] Devolver itens
  - [x] Registar condição

### 5.2 Componentes
- [x] Card de item
- [x] Tabela de loans
- [x] Histórico de empréstimo
- [x] Modal de empréstimo/devolução

### 5.3 Funcionalidades
- [x] CRUD de itens
- [x] Registar empréstimos
- [x] Devolver itens
- [x] Rastreamento de posse
- [x] Relatório de itens em uso
- [x] Alertas de sobreprazos (empréstimos antigos)

**Tempo estimado**: 2 dias
**Próximo**: FASE 6

---

## FASE 6: Módulo Financeiro ✅ COMPLETA

### 6.1 Páginas
- [x] Transações (`/app/financial/transactions`)
  - [x] Tabela de transações
  - [x] Filtrar por período
  - [x] Filtrar por categoria
  - [x] Calcular saldo
  
- [x] Nova transação (`/app/financial/transactions/new`)
  - [x] Formulário (categoria, valor, tipo, data, etc)
  - [x] Upload de comprovante (opcional)
  
- [x] Detalhe transação (`/app/financial/transactions/[id]`)
  - [x] Informações da transação
  
- [x] Editar transação (`/app/financial/transactions/[id]/edit`)
  - [x] Pré-encher dados
  
- [x] Relatórios (`/app/financial/reports`)
  - [x] Gráfico de receitas vs despesas
  - [x] Resumo por mês
  - [x] Resumo por categoria
  - [x] Saldo total
  
- [x] Categorias (`/app/financial/categories`)
  - [x] Criar/editar categorias
  - [x] Associar a transações

### 6.2 Componentes
- [x] Tabela de transações
- [x] Gráficos (Chart.js ou Recharts)
- [x] Card de resumo
- [x] Formulário de transação

### 6.3 Funcionalidades
- [x] CRUD de transações
- [x] Resumo financeiro por período
- [x] Gráficos de visualização
- [x] Exportar para Excel (CSV)
- [~] Múltiplas moedas (Removido - projeto focado no Euro)

**Tempo estimado**: 2-3 dias
**Próximo**: FASE 7

---

## FASE 7: Módulo de Partituras ✅ COMPLETA

### 7.1 Páginas
- [x] Biblioteca (`/app/music`)
  - [x] Lista de partituras
  - [x] Pesquisa por título/artista
  - [x] Filtrar por dificuldade
  - [x] Filtrar por tags
  
- [x] Upload (`/app/music/new`)
  - [x] Formulário (título, compositor, artista, etc)
  - [x] Upload de PDF
  - [x] Selecionar seções requeridas
  - [x] Tags/categorias
  
- [x] Detalhe partitura (`/app/music/[id]`)
  - [x] Metadados
  - [x] Histórico de prácticas
  - [x] Download
  
- [x] Repertório (`/app/music/repertoire`)
  - [x] Partituras por status (learning, rehearsing, mastered)
  - [x] Kanban board ou tabela
  - [x] Mover entre estados

### 7.2 Componentes
- [x] Card de partitura
- [x] Viewer de PDF
- [x] Tabela de repertório
- [x] Filtros de pesquisa

### 7.3 Funcionalidades
- [x] Upload de PDFs to Supabase Storage
- [x] Pesquisa full-text
- [x] Registar prácticas
- [x] Associar seções requeridas
- [x] Sistema de tags

**Tempo estimado**: 2 dias ✅ COMPLETO
**Próximo**: FASE 8

---

## FASE 8: PWA & Funcionalidades Avançadas 🌗 EM PROGRESSO

### 8.1 Progressive Web App
- [ ] Instalar next-pwa (Necessita de instalação manual: `npm install @ducanh2912/next-pwa`)
- [x] Criar manifest.json
- [ ] Offiine support
- [ ] Cache estático
- [ ] Home screen installer

### 8.2 Notificações Realtime
- [ ] Configurar Supabase Realtime
- [ ] Push notifications (Web)
- [ ] Email notifications (opcional)
- [ ] SMS notifications (opcional)

### 8.3 Dark Mode
- [x] Implementar dark theme
- [x] Toggle no header
- [x] Persist preference

### 8.4 Exportação & Reports
- [x] Exportar membros (CSV)
- [x] Exportar transações (CSV)
- [ ] Gerar relatórios mensais
- [ ] Emailing de relatórios

**Tempo estimado**: 2-3 dias
**Próximo**: FASE 9

---

## FASE 9: Testes e Otimização 🌗 EM PROGRESSO

- [ ] Testes unitários (Jest)
- [ ] Testes de integração
- [ ] Performance testing
- [ ] SEO optimization
- [x] Audit de segurança
- [ ] Optimization de imagens
- [ ] Cache strategy review

**Tempo estimado**: 2-3 dias

---

## FASE 10: Deploy & Produção

- [ ] Setup CI/CD (GitHub Actions)
- [ ] Deploy para staging
- [ ] Setup do domínio
- [ ] SSL certificate
- [ ] Analytics (Vercel ou Google Analytics)
- [ ] Monitoring (Sentry)
- [ ] Backups do Supabase
- [ ] Deploy para produção

**Tempo estimado**: 1 dia

---

## 📊 Timeline Estimada

| Fase | Descrição | Tempo |
|------|-----------|-------|
| 1 | Setup | ✅ COMPLETA |
| 2 | Auth & Base | 2 dias |
| 3 | Membros | 3 dias |
| 4 | Eventos | 3 dias |
| 5 | Inventário | 2 dias |
| 6 | Financeiro | ✅ COMPLETA |
| 7 | Partituras | ✅ COMPLETA |
| 8 | PWA & Realtime | 🌗 EM PROGRESSO |
| 9 | Testes | 3 dias |
| 10 | Deploy | 1 dia |
| **TOTAL** | | **~27 dias** |

---

## 🚀 Como Usar Este Checklist

1. **Marcar progresso**: Marcar `[x]` quando concluír cada item
2. **Prioridades**: Focar em FASE 2-4 para MVP mínimo viável
3. **Paralelização**: Equipa pode trabalhar em diferentes módulos
4. **Feedback**: Enviar regularmente para stakeholders

---

## 📝 Notas

- Cada módulo é independente e pode ser desenvolvido em paralelo
- Algumas tarefas podem ser otimizadas (ex: usando bibliotecas UI)
- Priorize a FASE 2-3 para ter MVP funcional rapidamente

**Status Atual**: A executar FASE 9
**Última atualização**: 2026-06-06