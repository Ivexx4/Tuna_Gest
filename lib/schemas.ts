import { z } from 'zod';

// Schema de validação para membros
export const memberSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),

  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .optional()
    .or(z.literal('')),

  role_id: z
    .number()
    .positive('Role é obrigatório')
    .optional(),

  section_id: z
    .number()
    .positive('Seção é obrigatória')
    .optional(),

  joining_date: z
    .string()
    .optional()
    .or(z.literal('')),

  status: z.enum(['active', 'inactive', 'alumni']),

  bio: z
    .string()
    .max(500, 'Bio muito longa')
    .optional()
    .or(z.literal('')),
});

export type MemberFormData = z.infer<typeof memberSchema>;

// Schema de validação para eventos
export const eventSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(255, 'Título muito longo'),

  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),

  event_type: z.enum(['rehearsal', 'performance', 'social', 'meeting'], {
    required_error: 'Tipo de evento é obrigatório',
  }),

  location: z
    .string()
    .max(255, 'Local muito longo')
    .optional()
    .or(z.literal('')),

  event_date: z.string().min(1, 'Data e hora do evento são obrigatórios'),

  duration_minutes: z
    .number()
    .int('Duração deve ser um número inteiro')
    .positive('Duração deve ser um número positivo')
    .optional()
    .or(z.literal(NaN)), // Allow NaN for optional number inputs
  
  required_sections: z
    .array(z.number().int().positive())
    .optional(), // Array of section IDs
  
  expected_quorum: z
    .number()
    .int('Quórum esperado deve ser um número inteiro')
    .min(0, 'Quórum esperado não pode ser negativo')
    .optional()
    .or(z.literal(NaN)), // Allow NaN for optional number inputs
});

export type EventFormData = z.infer<typeof eventSchema>;

// Schema de validação para itens de inventário
export const inventorySchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),

  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),

  item_type: z.enum(['instrument', 'costume', 'equipment', 'other'], {
    required_error: 'Tipo de item é obrigatório',
  }),

  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(50, 'Código muito longo'),

  purchase_date: z
    .string()
    .optional()
    .or(z.literal('')),

  purchase_price: z
    .number()
    .positive('Preço de compra deve ser um número positivo')
    .optional()
    .or(z.literal(NaN)),

  status: z.enum(['available', 'in_use', 'damaged', 'lost', 'decommissioned']),

  section_id: z
    .number()
    .positive('ID da seção deve ser um número positivo')
    .optional()
    .or(z.literal(NaN)),

  image_url: z
    .string()
    .url('URL de imagem inválida')
    .optional()
    .or(z.literal('')),
});

export type InventoryFormData = z.infer<typeof inventorySchema>;

// Schema de validação para empréstimos de inventário (para o modal)
export const loanFormSchema = z.object({
  member_id: z.number().int().positive('Selecione um membro'),
  condition_on_loan: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  due_date: z.string().optional().or(z.literal('')), // Adicionado due_date
});

export type LoanFormDataType = z.infer<typeof loanFormSchema>;

// Schema de validação para devolução de inventário (para o modal)
export const returnFormSchema = z.object({
  condition_on_return: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
});

export type ReturnFormDataType = z.infer<typeof returnFormSchema>;


// Schema de validação para transações financeiras
export const financialTransactionSchema = z.object({
  category_id: z
    .number()
    .int('ID da categoria deve ser um número inteiro')
    .positive('ID da categoria deve ser um número positivo')
    .optional()
    .or(z.literal(NaN)),

  amount: z
    .number()
    .positive('Valor deve ser um número positivo'),

  type: z.enum(['income', 'expense'], {
    required_error: 'Tipo de transação é obrigatório',
  }),

  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),

  transaction_date: z.string().min(1, 'Data da transação é obrigatória'),

  created_by: z
    .string()
    .max(255, 'Nome muito longo')
    .optional()
    .or(z.literal('')),

  // ADICIONAR ESTA LINHA:
  attachments: z.array(z.string()).optional(),
});
// Schema de validação para partituras
export const sheetMusicSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(255, 'Título muito longo'),

  artist: z
    .string()
    .max(255, 'Nome do artista muito longo')
    .optional()
    .or(z.literal('')),

  composer: z
    .string()
    .max(255, 'Nome do compositor muito longo')
    .optional()
    .or(z.literal('')),

  arranger: z
    .string()
    .max(255, 'Nome do arranjador muito longo')
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),

  genre: z
    .string()
    .max(100, 'Género muito longo')
    .optional()
    .or(z.literal('')),

  difficulty_level: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .optional(),

  file_url: z
    .string()
    .url('URL do ficheiro inválida')
    .optional()
    .or(z.literal('')),

  file_size: z
    .number()
    .int('Tamanho do ficheiro deve ser um número inteiro')
    .positive('Tamanho do ficheiro deve ser um número positivo')
    .optional()
    .or(z.literal(NaN)),

  pages: z
    .number()
    .int('Número de páginas deve ser um número inteiro')
    .positive('Número de páginas deve ser um número positivo')
    .optional()
    .or(z.literal(NaN)),

  added_by: z
    .string()
    .max(255, 'Nome muito longo')
    .optional()
    .or(z.literal('')),
    
  tags: z
    .array(z.string())
    .optional(), // Adicionado tags
    
  required_sections: z
    .array(z.number().int().positive())
    .optional(), // Adicionado required_sections
});

export type SheetMusicFormData = z.infer<typeof sheetMusicSchema>;

// Schema de validação para utilizadores
export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().max(255, 'Nome muito longo').optional().or(z.literal('')),
  role: z.enum(['admin', 'editor', 'viewer'], {
    required_error: 'Role é obrigatório',
  }),
  status: z.enum(['active', 'inactive', 'pending'], {
    required_error: 'Status é obrigatório',
  }),
});

export type UserFormData = z.infer<typeof userSchema>;

// Schema de validação para informações da Tuna
export const tunaSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),
  slug: z
    .string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .max(255, 'Slug muito longo')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),
  logo_url: z
    .string()
    .url('URL do logotipo inválida')
    .optional()
    .or(z.literal('')),
  website_url: z
    .string()
    .url('URL do website inválida')
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .max(255, 'Localização muito longa')
    .optional()
    .or(z.literal('')),
  founded_year: z
    .number()
    .int('Ano de fundação deve ser um número inteiro')
    .positive('Ano de fundação deve ser um número positivo')
    .min(1000, 'Ano de fundação inválido')
    .max(new Date().getFullYear(), 'Ano de fundação não pode ser no futuro')
    .optional()
    .or(z.literal(NaN)),
});

export type TunaFormData = z.infer<typeof tunaSchema>;

// Schema de validação para cargos de hierarquia
export const hierarchyRoleSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),
  display_name: z
    .string()
    .min(3, 'Nome de exibição deve ter pelo menos 3 caracteres')
    .max(255, 'Nome de exibição muito longo'),
  level: z
    .number()
    .int('Nível deve ser um número inteiro')
    .min(0, 'Nível não pode ser negativo'),
  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),
  // permissions: z.record(z.string(), z.boolean()).optional(), // Future: detailed permissions
});

export type HierarchyRoleFormData = z.infer<typeof hierarchyRoleSchema>;

// Schema de validação para seções de instrumentos
export const instrumentSectionSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),
  display_name: z
    .string()
    .min(3, 'Nome de exibição deve ter pelo menos 3 caracteres')
    .max(255, 'Nome de exibição muito longo'),
  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve ser um código hexadecimal válido (ex: #RRGGBB)')
    .optional()
    .or(z.literal('')),
});

export type InstrumentSectionFormData = z.infer<typeof instrumentSectionSchema>;
