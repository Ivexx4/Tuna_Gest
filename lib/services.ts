import { supabase } from '@/lib/supabase';
import { 
  Member, MemberWithRelations, Event, InventoryItem, InventoryLoan, 
  CurrentInventoryLoan, FinancialTransaction, SheetMusic, User, Tuna, 
  HierarchyRole, InstrumentSection, MemberRoleHistory, EventQuorumBySection, 
  EventAttendance, FinancialCategory, MusicPractice 
} from '@/types/database';
import { PostgrestError } from '@supabase/supabase-js';

// ============================================================================
// SERVIÇO DE TUNAS
// ============================================================================
export const tunaService = {
  async getTuna(tunaId: number) {
    return supabase.from('tunas').select('*').eq('id', tunaId).single();
  },
  async updateTuna(tunaId: number, updates: any) {
    return supabase.from('tunas').update(updates).eq('id', tunaId).select().single();
  },
  async getTunas() {
    return supabase.from('tunas').select('*');
  },
  async createTuna(tuna: any) {
    return supabase.from('tunas').insert([tuna]).select().single();
  }
};

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
// SERVIÇO DE CARGOS HIERÁRQUICOS (HIERARCHY ROLES)
// ============================================================================
export const hierarchyRoleService = {
  async getRoles() {
    return supabase.from('hierarchy_roles').select('*').order('level', { ascending: true });
  },
  async getRole(roleId: number) {
    return supabase.from('hierarchy_roles').select('*').eq('id', roleId).single();
  },
  async createRole(role: Omit<HierarchyRole, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('hierarchy_roles').insert([role]).select().single();
  },
  async updateRole(roleId: number, updates: Partial<Omit<HierarchyRole, 'id' | 'created_at'>>) {
    return supabase.from('hierarchy_roles').update(updates).eq('id', roleId).select().single();
  },
  async deleteRole(roleId: number) {
    return supabase.from('hierarchy_roles').delete().eq('id', roleId);
  }
};

// ============================================================================
// SERVIÇO DE SECÇÕES / NAIPES (INSTRUMENT SECTIONS)
// ============================================================================
export const instrumentSectionService = {
  async getSections() { return supabase.from('instrument_sections').select('*'); },
  async getSection(id: number) { return supabase.from('instrument_sections').select('*').eq('id', id).single(); },
  async createSection(data: any) { return supabase.from('instrument_sections').insert([data]).select().single(); },
  async updateSection(id: number, data: any) { return supabase.from('instrument_sections').update(data).eq('id', id).select().single(); },
  async deleteSection(id: number) { return supabase.from('instrument_sections').delete().eq('id', id); }
};

// ============================================================================
// SERVIÇO DE EVENTOS
// ============================================================================
export const eventService = {
  async getEvents(tunaId: number) {
    return supabase.from('events').select('*').eq('tuna_id', tunaId).order('event_date', { ascending: false });
  },
  
  // 👇 Adicionada a função simples para obter apenas um evento
  async getEvent(eventId: number) {
    return supabase.from('events').select('*').eq('id', eventId).single();
  },

  // 👇 Adicionada a função que a página de edição estava a pedir!
  async getEventWithAttendances(eventId: number) {
    // Traz o evento juntamente com as presenças e os dados de cada membro associado
    return supabase.from('events').select('*, event_attendances(*, member:members(*))').eq('id', eventId).single();
  },

  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>, baseUrl?: string) {
    return supabase.from('events').insert([event]).select().single();
  },
  
  async updateEvent(eventId: number, updates: Partial<Omit<Event, 'id' | 'tuna_id' | 'created_at'>>) {
    return supabase.from('events').update(updates).eq('id', eventId).select().single();
  },
  
  async deleteEvent(eventId: number) {
    return supabase.from('events').delete().eq('id', eventId);
  },
  
  async getAttendanceByToken(token: string) {
    return supabase.from('event_attendances').select('*, event:events(*), member:members(*)').eq('token', token).single();
  },
  
  async updateAttendanceByToken(token: string, status: 'confirmed' | 'declined' | 'absent') {
    return supabase.from('event_attendances').update({ status }).eq('token', token).select().single();
  }
};
// ============================================================================
// SERVIÇO DE INVENTÁRIO
// ============================================================================
export const inventoryService = {
  async getItems(tunaId: number) {
    return supabase.from('inventory_items').select('*').eq('tuna_id', tunaId);
  },
  async getItem(itemId: number) {
    return supabase.from('inventory_items').select('*').eq('id', itemId).single();
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
  async getCurrentLoans(tunaId?: number) {
    const { data, error } = await supabase
      .from('inventory_loans')
      .select('*, item:inventory_items(*), member:members(*)')
      .is('return_date', null); // Filtra apenas itens que ainda não foram devolvidos
    
    // Se o tunaId for passado, filtra os resultados para essa tuna específica
    const filteredData = tunaId !== undefined && data 
      ? data.filter(loan => (loan.item as any)?.tuna_id === tunaId) 
      : data;
      
    return { data: filteredData, error };
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
// ============================================================================
// SERVIÇO FINANCEIRO E DE CATEGORIAS
// ============================================================================
export const financialService = {
  // --- TRANSAÇÕES ---
  async getTransactions(tunaId: number) { 
    return supabase.from('financial_transactions').select('*').eq('tuna_id', tunaId).order('date', { ascending: false }); 
  },
  async getTransaction(id: number) { return supabase.from('financial_transactions').select('*').eq('id', id).single(); },
  async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>) { return supabase.from('financial_transactions').insert([transaction]).select().single(); },
  async updateTransaction(id: number, updates: any) { return supabase.from('financial_transactions').update(updates).eq('id', id).select().single(); },
  async deleteTransaction(id: number) { return supabase.from('financial_transactions').delete().eq('id', id); },
  async uploadAttachment(file: File, tunaId: number, folder: string) {
    const filePath = `${folder}/${tunaId}/${Date.now()}`;
    const { error } = await supabase.storage.from('tuna-manager-bucket').upload(filePath, file);
    if (error) return { data: null, error };
    return { data: { publicUrl: supabase.storage.from('tuna-manager-bucket').getPublicUrl(filePath).data.publicUrl }, error: null };
  },
  async getCategories() { return supabase.from('financial_categories').select('*'); },
  async getCategory(id: number) { return supabase.from('financial_categories').select('*').eq('id', id).single(); },
  async createCategory(data: any) { return supabase.from('financial_categories').insert([data]).select().single(); },
  async updateCategory(id: number, data: any) { return supabase.from('financial_categories').update(data).eq('id', id).select().single(); },
  async deleteCategory(id: number) { return supabase.from('financial_categories').delete().eq('id', id); }
};

// ============================================================================
// SERVIÇO DE PARTITURAS / MÚSICA
// ============================================================================
export const musicService = {
  // 👇 Aqui está a função que o Dashboard estava a pedir
  async getSheetMusic(tunaId: number) { return supabase.from('sheet_music').select('*').eq('tuna_id', tunaId); },
  
  // Mantemos as outras intactas para não quebrar o resto da app
  async getMusics(tunaId: number) { return supabase.from('sheet_music').select('*').eq('tuna_id', tunaId); },
  async getMusic(id: number) { return supabase.from('sheet_music').select('*').eq('id', id).single(); },
  async createMusic(data: any) { return supabase.from('sheet_music').insert([data]).select().single(); },
  async updateMusic(id: number, data: any) { return supabase.from('sheet_music').update(data).eq('id', id).select().single(); },
  async deleteMusic(id: number) { return supabase.from('sheet_music').delete().eq('id', id); },
  async recordPractice(sheetMusicId: number, eventId: number | null, status: string, feedback?: string) {
    return supabase.from('music_practices').insert([{ sheet_music_id: sheetMusicId, event_id: eventId, status, feedback, practiced_at: new Date().toISOString() }]).select().single();
  },
};

// ============================================================================
// SERVIÇO DE UTILIZADORES
// ============================================================================
export const userService = {
  async getUsers() { return supabase.from('users').select('*'); },
  async createUser(userData: any) { return supabase.from('users').insert([userData]).select().single(); },
  async updateUser(userId: string, updates: any) { return supabase.from('users').update(updates).eq('id', userId).select().single(); },
  async deleteUser(userId: string) { return supabase.from('users').delete().eq('id', userId); },
};
