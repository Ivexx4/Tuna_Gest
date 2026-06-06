// ============================================================================
// TIPOS TYPESCRIPT PARA TUNA MANAGER
// ============================================================================

// MEMBROS E HIERARQUIA
// ============================================================================

export interface HierarchyRole {
  id: number;
  tuna_id: number;
  name: string;
  display_name: string;
  level: number;
  description?: string;
  permissions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InstrumentSection {
  id: number;
  tuna_id: number;
  name: string;
  display_name: string;
  description?: string;
  color?: string;
  created_at: string;
}

export interface Member {
  id: number;
  tuna_id: number;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  role_id?: number;
  section_id?: number;
  joining_date?: string;
  status: 'active' | 'inactive' | 'alumni';
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberRoleHistory {
  id: number;
  member_id: number;
  old_role_id?: number;
  new_role_id: number;
  changed_by?: string; // UUID
  changed_at: string;
}

export interface MemberWithRelations extends Member {
  role?: HierarchyRole;
  section?: InstrumentSection;
}

// LOGÍSTICA
// ============================================================================

export interface Event {
  id: number;
  tuna_id: number;
  title: string;
  description?: string;
  event_type: 'rehearsal' | 'performance' | 'social' | 'meeting';
  location?: string;
  event_date: string;
  duration_minutes?: number;
  required_sections?: number[];
  expected_quorum?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EventAttendance {
  id: number;
  event_id: number;
  member_id: number;
  status: 'pending' | 'confirmed' | 'declined' | 'absent';
  confirmed_at?: string;
  notes?: string;
  confirmation_token?: string; // Adicionado para links de confirmação públicos
  created_at: string;
  updated_at: string;
}

export interface EventQuorumBySection {
  event_id: number;
  title: string;
  event_date: string;
  section_id?: number;
  section_name?: string;
  confirmed_count: number;
  pending_count: number;
  declined_count: number;
  absent_count: number;
  total_section_members: number;
}

// INVENTÁRIO
// ============================================================================

export interface InventoryItem {
  id: number;
  tuna_id: number;
  name: string;
  description?: string;
  item_type: 'instrument' | 'costume' | 'equipment' | 'other';
  code: string;
  purchase_date?: string;
  purchase_price?: number;
  status: 'available' | 'in_use' | 'damaged' | 'lost' | 'decommissioned';
  section_id?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryLoan {
  id: number;
  item_id: number;
  member_id: number;
  loan_date: string;
  return_date?: string;
  due_date?: string; // Adicionado para alertas de sobreprazos
  condition_on_loan?: 'excellent' | 'good' | 'fair' | 'poor';
  condition_on_return?: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  returned_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CurrentInventoryLoan {
  loan_id: number;
  item_id: number;
  item_name: string;
  item_type: string;
  code: string;
  member_id: number;
  member_name: string;
  email?: string;
  loan_date: string;
  condition_on_loan?: string;
  days_with_member: number;
}

// FINANCEIRO
// ============================================================================

export interface FinancialCategory {
  id: number;
  tuna_id: number;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  created_at: string;
}

export interface FinancialTransaction {
  id: number;
  tuna_id: number;
  category_id: number;
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  transaction_date: string;
  created_by?: string;
  attachments?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  year: number;
  month: number;
  type: 'income' | 'expense';
  category: string;
  total_income: number;
  total_expenses: number;
  balance: number;
}

// REPORTÓRIO
// ============================================================================

export interface SheetMusic {
  id: number;
  tuna_id: number;
  title: string;
  artist?: string;
  composer?: string;
  arranger?: string;
  description?: string;
  genre?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  file_url?: string;
  file_size?: number;
  pages?: number;
  tags?: string[];
  required_sections?: number[];
  added_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MusicPractice {
  id: number;
  sheet_music_id: number;
  event_id?: number;
  status: 'learning' | 'rehearsing' | 'performed' | 'mastered';
  feedback?: string;
  practiced_at?: string;
  created_at: string;
}

// AUTENTICAÇÃO & UTILIZADORES
// ============================================================================

export interface User {
  id: string; // UUID from Supabase Auth
  email: string;
  name?: string; // Display name, might be stored in public.users table or similar
  role?: string; // e.g., 'admin', 'editor', 'viewer' - custom role management
  status: 'active' | 'inactive' | 'pending'; // Custom status
  created_at: string;
  last_sign_in_at?: string;
  // Add other relevant fields from auth.users or a public.users table
}

// TUNAS (MULTI-TENANT)
// ============================================================================

export interface Tuna {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  location?: string;
  founded_year?: number;
  created_at: string;
  updated_at: string;
}

// RESPOSTA GENÉRICA DE API
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  success: boolean;
}
