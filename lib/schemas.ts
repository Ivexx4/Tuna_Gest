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
