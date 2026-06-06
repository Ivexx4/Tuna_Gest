import { supabase } from '@/lib/supabase';
import { 
  Member, MemberWithRelations, Event, InventoryItem, InventoryLoan, 
  CurrentInventoryLoan, FinancialTransaction, SheetMusic, User, Tuna, 
  HierarchyRole, InstrumentSection, MemberRoleHistory, EventQuorumBySection, 
  EventAttendance, FinancialCategory, MusicPractice 
} from '@/types/database';
import { PostgrestError } from '@supabase/supabase-js';

// ============================================================================
// SERVIÇO DE MEMBROS
// ============================================================================

export const memberService = {
  async getMembers(tunaId: number): Promise<{ data: MemberWithRelations[] | null; error: PostgrestError | null; }> {
    return supabase.from('members').select('*, role:hierarchy_roles(*), section:instrument_sections(*)').eq('tuna_id', tunaId);
  },

  async getMember(memberId: number): Promise<{ data: MemberWithRelations | null; error: PostgrestError | null; }> {
    return supabase.from('members').select('*, role:hierarchy_roles(*), section:instrument_sections(*)').eq('id', memberId).single();
  },

  async createMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('members').insert([member]).select().single();
  },

  async updateMember(memberId: number, updates: Partial<Omit<Member, 'id' | 'tuna_id' | 'created_at'>>, changedByUserId?: string) {
    const { data: currentMember } = await supabase.from('members').select('role_id').eq('id', memberId).single();
    const oldRoleId = currentMember?.role_id || null;
    const newRoleId = updates.role_id !== undefined ? updates.role_id : oldRoleId;

    if (newRoleId !== null && newRoleId !== oldRoleId) {
      await memberService.recordRoleChange(memberId, oldRoleId, newRoleId, changedByUserId);
    }

    return supabase.from('members').update(updates).eq('id', memberId).select().single();
  },

  async deleteMember(memberId: number) {
    return supabase.from('members').delete().eq('id', memberId);
  },

  async recordRoleChange(memberId: number, oldRoleId: number | null, newRoleId: number, changedBy?: string) {
    return supabase.from('member_role_history').insert([{ member_id: memberId, old_role_id: oldRoleId, new_role_id: newRoleId, changed_by: changedBy }]);
  },

  async getMemberRoleHistory(memberId: number) {
    return supabase.from('member_role_history').select('*, old_role:hierarchy_roles!old_role_id(*), new_role:hierarchy_roles!new_role_id(*)').eq('member_id', memberId).order('changed_at', { ascending: false });
  },
};

// ============================================================================
// SERVIÇO DE EVENTOS
// ============================================================================

export const eventService = {
  async getEvents(tunaId: number) {
    return supabase.from('events').select('*').eq('tuna_id', tunaId).order('event_date', { ascending: false });
  },

  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('events').insert([event]).select().single();
  },

  async updateEvent(eventId: number, updates: Partial<Omit<Event, 'id' | 'tuna_id' | 'created_at'>>) {
    return supabase.from('events').update(updates).eq('id', eventId).select().single();
  },

  async deleteEvent(eventId: number) {
    return supabase.from('events').delete().eq('id', eventId);
  },

  // 👇 ADICIONA ESTAS DUAS FUNÇÕES ABAIXO 👇

  async getAttendanceByToken(token: string) {
    return supabase
      .from('event_attendances')
      // Faz o join com os eventos e membros para corresponder ao tipo EventAttendanceWithDetails
      .select('*, event:events(*), member:members(*)') 
      .eq('token', token)
      .single();
  },

  async updateAttendanceByToken(token: string, status: 'confirmed' | 'declined' | 'absent') {
    return supabase
      .from('event_attendances')
      .update({ status })
      .eq('token', token)
      .select()
      .single();
  }
};

// ============================================================================
// SERVIÇO DE INVENTÁRIO
// ============================================================================

export const inventoryService = {
  async getItems(tunaId: number) {
    return supabase.from('inventory_items').select('*').eq('tuna_id', tunaId);
  },

  async createItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('inventory_items').insert([item]).select().single();
  },

  async updateItem(itemId: number, updates: Partial<Omit<InventoryItem, 'id' | 'tuna_id' | 'created_at'>>) {
    return supabase.from('inventory_items').update(updates).eq('id', itemId).select().single();
  },

  async uploadImage(file: File, itemId: number, tunaId: number) {
    const filePath = `inventory_images/${tunaId}/${itemId}/${Math.random()}`;
    const { error } = await supabase.storage.from('tuna-manager-bucket').upload(filePath, file);
    if (error) return { data: null, error };
    return { data: { publicUrl: supabase.storage.from('tuna-manager-bucket').getPublicUrl(filePath).data.publicUrl }, error: null };
  },

  async getOverdueLoans(tunaId: number) {
    const { data, error } = await supabase
      .from('inventory_loans')
      .select('*, item:inventory_items(*), member:members(*)')
      .is('return_date', null)
      .not('due_date', 'is', null)
      .lt('due_date', new Date().toISOString());

    const filteredData = data ? data.filter(loan => (loan.item as any).tuna_id === tunaId) : null;
    return { data: filteredData, error };
  },
};

// ============================================================================
// SERVIÇO FINANCEIRO
// ============================================================================

export const financialService = {
  async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('financial_transactions').insert([transaction]).select().single();
  },

  async uploadAttachment(file: File, tunaId: number, folder: string) {
    const filePath = `${folder}/${tunaId}/${Date.now()}`;
    const { error } = await supabase.storage.from('tuna-manager-bucket').upload(filePath, file);
    if (error) return { data: null, error };
    return { data: { publicUrl: supabase.storage.from('tuna-manager-bucket').getPublicUrl(filePath).data.publicUrl }, error: null };
  },
};

// ============================================================================
// SERVIÇO DE PARTITURAS
// ============================================================================

export const musicService = {
  async recordPractice(sheetMusicId: number, eventId: number | null, status: string, feedback?: string) {
    return supabase.from('music_practices').insert([{ sheet_music_id: sheetMusicId, event_id: eventId, status, feedback, practiced_at: new Date().toISOString() }]).select().single();
  },
};

// ============================================================================
// SERVIÇO DE UTILIZADORES
// ============================================================================

export const userService = {
  async getUsers() {
    return supabase.from('users').select('*');
  },

  async createUser(userData: any) {
    return supabase.from('users').insert([userData]).select().single();
  },

  async updateUser(userId: string, updates: any) {
    return supabase.from('users').update(updates).eq('id', userId).select().single();
  },

  async deleteUser(userId: string) {
    return supabase.from('users').delete().eq('id', userId);
  },
};
