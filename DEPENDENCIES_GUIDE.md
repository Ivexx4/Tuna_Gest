# 📦 Dependências Recomendadas

Este documento lista packages que podem ser úteis conforme desenvolveres o projeto.

## Dependências Atuais ✅

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.107.0",
    "next": "^16.2.7",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Recomendações por Fase

### FASE 2 - Autenticação

```bash
# Validação de formulários
npm install react-hook-form zod

# Notificações/Toast
npm install sonner

# Icons
npm install lucide-react
```

**Para instalar tudo:**
```bash
npm install react-hook-form zod sonner lucide-react
```

### FASE 3-4 - CRUD & UI

```bash
# Tabelas avançadas
npm install @tanstack/react-table

# Dialogs/Modals
npm install @radix-ui/react-dialog

# Dropdowns
npm install @radix-ui/react-select

# Tabs
npm install @radix-ui/react-tabs
```

### FASE 6 - Gráficos Financeiros

```bash
# Gráficos
npm install recharts
# ou
npm install chart.js react-chartjs-2
```

### FASE 7 - PDF Viewer

```bash
# Visualizar PDFs
npm install pdfjs-dist

# ou opção mais simples:
npm install react-pdf
```

### FASE 8 - PWA & Notificações

```bash
# PWA
npm install next-pwa

# Push notifications
npm install web-push

# Background tasks
npm install idb
```

### FASE 9 - Testes

```bash
# Testing library
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Jest
npm install --save-dev jest @types/jest

# E2E testing
npm install --save-dev playwright
```

### FASE 10 - Deploy & Monitoring

```bash
# Error tracking
npm install @sentry/nextjs

# Analytics
npm install @vercel/analytics

# Performance monitoring
npm install web-vitals
```

---

## Pacotes Utility Úteis

### Formatação e Parsing

```bash
# Datas
npm install date-fns
# ou
npm install dayjs

# Formatação de números/moeda
npm install dinero.js

# Slugs
npm install slugify

# UUID
npm install uuid @types/uuid
```

### Helpers

```bash
# Utilitários de array/object
npm install lodash-es

# Variáveis ambientes runtime
npm install ts-env-defaults

# Querystrings
npm install query-string
```

---

## Pacotes Recomendados (Instalar Agora)

Para desenvolvimento mais suave, recomendo instalar já:

```bash
npm install react-hook-form lucide-react sonner
```

Estes permitem-te:
- ✅ Validação robusta de formulários
- ✅ Icons profissionais
- ✅ Notificações bonitas

---

## Pacotes a Evitar (no início)

❌ Frameworks muy pesados (Redux, MobX)  
❌ Component libraries complexas (Material-UI, Chakra)  
❌ Webpack/Bundler customizados  

**Porque?** Tailwind CSS + Radix UI é suficiente e mais leve.

---

## Como Instalar

### Um package por vez (recomendado)
```bash
npm install nome-do-package
```

### Múltiplos packages
```bash
npm install package1 package2 package3
```

### Dev dependency
```bash
npm install --save-dev nome-do-package
```

---

## Verificar Vulnerabilidades

Após instalar packages, sempre verifica:

```bash
npm audit
npm audit fix  # Para auto-fix (geralmente seguro)
```

---

## Package.json Final Recomendado (FASE 3+)

```json
{
  "name": "tuna-manager",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.107.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.292.0",
    "next": "^16.2.7",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-hook-form": "^7.48.0",
    "sonner": "^1.2.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Dicas de Performance

1. **Lazy Load**: Instala apenas o que precisas agora
2. **Tree-shaking**: Next.js remove código não usado
3. **Bundle Analysis**: 
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```
4. **Monitorar tamanho**:
   ```bash
   npm list --depth=0
   ```

---

## Manutenção

### Atualizar packages
```bash
npm update
```

### Verificar deprecações
```bash
npm audit
```

### Limpar cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Recomendação Final

**Para começar:** Instala apenas Supabase + Next.js + Tailwind (já estão!)

**Após FASE 2:** Adiciona `react-hook-form`, `zod`, `sonner`, `lucide-react`

**Depois de teste:** Adiciona mais conforme necessário

**Mantra**: Keep It Simple! 🎯

---

**Última atualização**: 2026-06-05

