import { supabase } from '@/lib/supabase';
import { Member, MemberWithRelations, Event, InventoryItem, InventoryLoan, CurrentInventoryLoan, FinancialTransaction, SheetMusic, User, Tuna, HierarchyRole, InstrumentSection, MemberRoleHistory, EventQuorumBySection, EventAttendance, FinancialCategory, MusicPractice } from '@/types/database';
import { PostgrestError } from '@supabase/supabase-js';

// ============================================================================
// SERVIÇO DE MEMBROS
// ============================================================================

export const memberService = {
  /**
   * Buscar todos os membros de uma tuna com relations
   */
  async getMembers(tunaId: number): Promise<{
    data: MemberWithRelations[] | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('members')
      .select(
        `
        *,
        role:hierarchy_roles(*),
        section:instrument_sections(*)
      `
      )
      .eq('tuna_id', tunaId);
  },

  /**
   * Buscar membro por ID
   */
  async getMember(
    memberId: number
  ): Promise<{
    data: MemberWithRelations | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('members')
      .select(
        `
        *,
        role:hierarchy_roles(*),
        section:instrument_sections(*)
      `
      )
      .eq('id', memberId)
      .single();
  },

  /**
   * Criar novo membro
   */
  async createMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('members').insert([member]).select().single();
  },

  /**
   * Atualizar membro
   */
  async updateMember(
    memberId: number,
    updates: Partial<Omit<Member, 'id' | 'tuna_id' | 'created_at'>>,
    changedByUserId?: string // Adicionado para auditoria
  ) {
    // Obter o membro atual para verificar a mudança de role
    const { data: currentMember, error: fetchError } = await supabase
      .from('members')
      .select('role_id')
      .eq('id', memberId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar membro atual para auditoria:', fetchError);
      // Continuar com a atualização mesmo que não consiga buscar o role antigo
    }

    const oldRoleId = currentMember?.role_id || null;
    const newRoleId = updates.role_id !== undefined ? updates.role_id : oldRoleId;

    // Se o role mudou, registar no histórico
    if (newRoleId !== null && newRoleId !== oldRoleId) {
      await memberService.recordRoleChange(memberId, oldRoleId, newRoleId, changedByUserId);
    }

    return supabase
      .from('members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();
  },

  /**
   * Deletar membro
   */
  async deleteMember(memberId: number) {
    return supabase.from('members').delete().eq('id', memberId);
  },

  /**
   * Buscar membros por seção/naipe
   */
  async getMembersBySection(tunaId: number, sectionId: number) {
    return supabase
      .from('members')
      .select('*')
      .eq('tuna_id', tunaId)
      .eq('section_id', sectionId)
      .eq('status', 'active');
  },

  /**
   * Buscar membros por papel/role
   */
  async getMembersByRole(tunaId: number, roleId: number) {
    return supabase
      .from('members')
      .select('*')
      .eq('tuna_id', tunaId)
      .eq('role_id', roleId);
  },

  /**
   * Registar mudança de role (auditoria)
   */
  async recordRoleChange(
    memberId: number,
    oldRoleId: number | null,
    newRoleId: number,
    changedBy?: string
  ) {
    return supabase.from('member_role_history').insert([
      {
        member_id: memberId,
        old_role_id: oldRoleId,
        new_role_id: newRoleId,
        changed_by: changedBy,
      },
    ]);
  },

  /**
   * Buscar histórico de roles de um membro
   */
  async getMemberRoleHistory(memberId: number): Promise<{
    data: (MemberRoleHistory & { old_role?: HierarchyRole; new_role?: HierarchyRole })[] | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('member_role_history')
      .select(
        `
        *,
        old_role:hierarchy_roles!old_role_id(*),
        new_role:hierarchy_roles!new_role_id(*)
      `
      )
      .eq('member_id', memberId)
      .order('changed_at', { ascending: false });
  },
};

// ============================================================================
// SERVIÇO DE EVENTOS
// ============================================================================

export const eventService = {
  /**
   * Buscar todos os eventos de uma tuna
   */
  async getEvents(tunaId: number) {
    return supabase
      .from('events')
      .select('*')
      .eq('tuna_id', tunaId)
      .order('event_date', { ascending: false });
  },

  /**
   * Buscar evento por ID com presenças
   */
  async getEventWithAttendances(eventId: number) {
    return supabase
      .from('events')
      .select(
        `
        *,
        attendances:event_attendances(
          *,
          member:members(*)
        )
      `
      )
      .eq('id', eventId)
      .single();
  },

  /**
   * Criar novo evento
   */
  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>, baseUrl: string) {
    const { data, error } = await supabase.from('events').insert([event]).select().single();

    if (data) {
      // Simulate sending notifications after event creation
      await eventService.sendEventNotificationEmails(data.id, baseUrl);
    }

    return { data, error };
  },

  /**
   * Atualizar evento
   */
  async updateEvent(
    eventId: number,
    updates: Partial<Omit<Event, 'id' | 'tuna_id' | 'created_at'>>
  ) {
    return supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();
  },

  /**
   * Deletar evento
   */
  async deleteEvent(eventId: number) {
    return supabase.from('events').delete().eq('id', eventId);
  },

  /**
   * Registar ou atualizar presença. Gera confirmation_token se for nova.
   */
  async setAttendance(eventId: number, memberId: number, status: string) {
    // Supabase will automatically generate UUID for confirmation_token on insert
    return supabase
      .from('event_attendances')
      .upsert(
        {
          event_id: eventId,
          member_id: memberId,
          status,
          confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
        },
        { onConflict: 'event_id,member_id' }
      )
      .select()
      .single();
  },

  /**
   * Buscar uma presença por confirmation_token
   */
  async getAttendanceByToken(token: string): Promise<{
    data: (EventAttendance & { event: Event; member: Member }) | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('event_attendances')
      .select(
        `
        *,
        event:events(*),
        member:members(*)
      `
      )
      .eq('confirmation_token', token)
      .single();
  },

  /**
   * Atualizar o status de uma presença usando confirmation_token
   */
  async updateAttendanceByToken(token: string, status: 'confirmed' | 'declined' | 'absent'): Promise<{
    data: EventAttendance | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('event_attendances')
      .update({
        status,
        confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('confirmation_token', token)
      .select()
      .single();
  },

  /**
   * Obter quórum por seção para um evento específico
   */
  async getQuorumBySections(eventId: number) {
    return supabase
      .from('event_quorum_by_section')
      .select('*')
      .eq('event_id', eventId);
  },

  /**
   * Obter todos os resumos de quórum para uma tuna
   */
  async getAllQuorumSummaries(tunaId: number): Promise<{
    data: EventQuorumBySection[] | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('event_quorum_by_section')
      .select('*')
      // Assuming event_quorum_by_section view has a tuna_id column or can be joined
      // For now, we'll fetch all and filter by event.tuna_id in the client if needed
      // A more efficient way would be to modify the view or add RLS
  },

  /**
   * Simula o envio de emails de notificação para todos os membros da tuna
   * com um link de confirmação de presença.
   */
  async sendEventNotificationEmails(eventId: number, baseUrl: string) {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Erro ao buscar evento para notificações:', eventError);
      return;
    }

    // Assuming tuna_id is 1 for now, similar to other services
    const { data: members, error: membersError } = await memberService.getMembers(1);

    if (membersError || !members) {
      console.error('Erro ao buscar membros para notificações:', membersError);
      return;
    }

    for (const member of members) {
      if (!member.email) {
        console.warn(`Membro ${member.name} não tem email, pulando notificação.`);
        continue;
      }

      // Ensure an attendance record exists and get its confirmation_token
      const { data: attendance, error: attendanceError } = await supabase
        .from('event_attendances')
        .upsert(
          { event_id: eventId, member_id: member.id, status: 'pending' },
          { onConflict: 'event_id,member_id' }
        )
        .select('confirmation_token')
        .single();

      if (attendanceError || !attendance?.confirmation_token) {
        console.error(`Erro ao criar/buscar presença para ${member.name}:`, attendanceError);
        continue;
      }

      const confirmationLink = `${baseUrl}/confirm-attendance/${attendance.confirmation_token}`;

      console.log(`
        ========================================
        SIMULAÇÃO DE EMAIL DE NOTIFICAÇÃO DE EVENTO
        Para: ${member.email} (${member.name})
        Assunto: Novo Evento: ${event.title} - Confirme a sua Presença!
        ----------------------------------------
        Olá ${member.name},

        Temos um novo evento agendado: "${event.title}"!

        Detalhes do Evento:
        - Título: ${event.title}
        - Data: ${new Date(event.event_date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        - Local: ${event.location || 'Não especificado'}
        - Descrição: ${event.description || 'N/A'}

        Por favor, confirme a sua presença através do seguinte link:
        ${confirmationLink}

        A sua confirmação é importante para a organização do evento.

        Obrigado,
        A sua Tuna
        ========================================
      `);
    }
  },
};

// ============================================================================
// SERVIÇO DE INVENTÁRIO
// ============================================================================

export const inventoryService = {
  /**
   * Buscar todos os itens de inventário
   */
  async getItems(tunaId: number) {
    return supabase
      .from('inventory_items')
      .select('*')
      .eq('tuna_id', tunaId);
  },

  /**
   * Buscar item por ID
   */
  async getItem(
    itemId: number
  ): Promise<{
    data: InventoryItem | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .single();
  },

  /**
   * Criar novo item
   */
  async createItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('inventory_items').insert([item]).select().single();
  },

  /**
   * Atualizar item
   */
  async updateItem(
    itemId: number,
    updates: Partial<Omit<InventoryItem, 'id' | 'tuna_id' | 'created_at'>>
  ) {
    return supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
  },

  /**
   * Deletar item
   */
  async deleteItem(itemId: number) {
    return supabase.from('inventory_items').delete().eq('id', itemId);
  },

  /**
   * Upload de imagem para o Supabase Storage
   */
  async uploadImage(file: File, itemId: number, tunaId: number): Promise<{
    data: { publicUrl: string } | null;
    error: PostgrestError | null;
  }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${tunaId}/${itemId}/${Math.random()}.${fileExt}`;
    const filePath = `inventory_images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('tuna-manager-bucket') // Assuming a bucket named 'tuna-manager-bucket'
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return { data: null, error: error as unknown as PostgrestError };
    }

    const { data: publicUrlData } = supabase.storage
      .from('tuna-manager-bucket')
      .getPublicUrl(filePath);

    return { data: { publicUrl: publicUrlData.publicUrl }, error: null };
  },

  /**
   * Registar empréstimo de item
   */
  async createLoan(itemId: number, memberId: number, condition?: string, dueDate?: string) {
    return supabase
      .from('inventory_loans')
      .insert([
        {
          item_id: itemId,
          member_id: memberId,
          condition_on_loan: condition,
          due_date: dueDate, // Save due_date
        },
      ])
      .select()
      .single();
  },

  /**
   * Registar devolução de item
   */
  async returnLoan(
    loanId: number,
    condition?: string,
    returnedBy?: string
  ) {
    return supabase
      .from('inventory_loans')
      .update({
        return_date: new Date().toISOString(),
        condition_on_return: condition,
        returned_by: returnedBy,
      })
      .eq('id', loanId)
      .select()
      .single();
  },

  /**
   * Buscar empréstimos atuais (itens não devolvidos)
   */
  async getCurrentLoans(memberId?: number): Promise<{
    data: (CurrentInventoryLoan & { due_date?: string })[] | null; // Extend type to include due_date
    error: PostgrestError | null;
  }> {
    let query = supabase.from('current_inventory_loans').select('*');

    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    return query;
  },

  /**
   * Buscar todos os empréstimos de um item, incluindo o membro
   */
  async getLoansByItemId(itemId: number): Promise<{
    data: (InventoryLoan & { member: Member })[] | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('inventory_loans')
      .select(
        `
        *,
        member:members(*)
      `
      )
      .eq('item_id', itemId)
      .order('loan_date', { ascending: false });
  },

  /**
   * Buscar empréstimos em atraso
   */
  async getOverdueLoans(tunaId: number): Promise<{
    data: (InventoryLoan & { item: InventoryItem; member: Member })[] | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await supabase
      .from('inventory_loans')
      .select(
        `
        *,
        item:inventory_items(*),
        member:members(*)
      `
      )
      .is('return_date', null) // Only active loans
      .not('due_date', 'is', null) // Only loans with a due date
      .lt('due_date', new Date().toISOString()) // Due date is in the past
      // Assuming inventory_items has tuna_id and we can filter by it
      // For now, we'll fetch all and filter by item.tuna_id in the client if needed
      // A more efficient way would be to modify the view or add RLS
      .order('due_date', { ascending: true });

    // Client-side filter by tuna_id if the view doesn't support it directly
    const filteredData = data?.filter(loan => loan.item.tuna_id === tunaId);

    return { data: filteredData, error };
  },
};

// ============================================================================
// SERVIÇO FINANCEIRO
// ============================================================================

export const financialService = {
  /**
   * Buscar transações por período
   */
  async getTransactions(tunaId: number, fromDate?: string, toDate?: string) {
    let query = supabase
      .from('financial_transactions')
      .select('*')
      .eq('tuna_id', tunaId)
      .order('transaction_date', { ascending: false });

    if (fromDate) {
      query = query.gte('transaction_date', fromDate);
    }
    if (toDate) {
      query = query.lte('transaction_date', toDate);
    }

    return query;
  },

  /**
   * Buscar transação por ID
   */
  async getTransaction(
    transactionId: number
  ): Promise<{
    data: FinancialTransaction | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
  },

  /**
   * Criar transação
   */
  async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('financial_transactions').insert([transaction]).select().single();
  },

  /**
   * Atualizar transação
   */
  async updateTransaction(
    transactionId: number,
    updates: Partial<Omit<FinancialTransaction, 'id' | 'tuna_id' | 'created_at'>>
  ) {
    return supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();
  },

  /**
   * Deletar transação
   */
  async deleteTransaction(transactionId: number) {
    return supabase.from('financial_transactions').delete().eq('id', transactionId);
  },

  /**
   * Upload de comprovante para o Supabase Storage
   */
  async uploadAttachment(file: File, tunaId: number, folder: string): Promise<{
    data: { publicUrl: string } | null;
    error: PostgrestError | null;
  }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${tunaId}/${Date.now()}.${fileExt}`; // Unique filename
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('tuna-manager-bucket') // Assuming a bucket named 'tuna-manager-bucket'
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Erro ao fazer upload do comprovante:', error);
      return { data: null, error: error as unknown as PostgrestError };
    }

    const { data: publicUrlData } = supabase.storage
      .from('tuna-manager-bucket')
      .getPublicUrl(filePath);

    return { data: { publicUrl: publicUrlData.publicUrl }, error: null };
  },

  /**
   * Obter resumo financeiro
   */
  async getFinancialSummary(tunaId: number) {
    return supabase
      .from('financial_summary')
      .select('*')
      .eq('tuna_id', tunaId);
  },

  /**
   * Buscar categorias financeiras
   */
  async getCategories(tunaId: number): Promise<{
    data: FinancialCategory[] | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('financial_categories')
      .select('*')
      .eq('tuna_id', tunaId)
      .order('name', { ascending: true });
  },

  /**
   * Criar nova categoria financeira
   */
  async createCategory(category: Omit<FinancialCategory, 'id' | 'created_at'>) {
    return supabase.from('financial_categories').insert([category]).select().single();
  },

  /**
   * Atualizar categoria financeira
   */
  async updateCategory(
    categoryId: number,
    updates: Partial<Omit<FinancialCategory, 'id' | 'tuna_id' | 'created_at'>>
  ) {
    return supabase
      .from('financial_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();
  },

  /**
   * Deletar categoria financeira
   */
  async deleteCategory(categoryId: number) {
    return supabase.from('financial_categories').delete().eq('id', categoryId);
  },
};

// ============================================================================
// SERVIÇO DE PARTITURAS
// ============================================================================

export const musicService = {
  /**
   * Buscar partituras de uma tuna
   */
  async getSheetMusic(tunaId: number) {
    return supabase
      .from('sheet_music')
      .select('*')
      .eq('tuna_id', tunaId)
      .order('created_at', { ascending: false });
  },

  /**
   * Buscar partitura por ID
   */
  async getSheetMusicById(
    musicId: number
  ): Promise<{
    data: SheetMusic | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('sheet_music')
      .select('*')
      .eq('id', musicId)
      .single();
  },

  /**
   * Buscar por searchterm (título, artista, compositor)
   * Agora usando pesquisa full-text nativa do Supabase (PostgreSQL text search)
   */
  async searchSheetMusic(tunaId: number, searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return this.getSheetMusic(tunaId);
    }
    
    // Using Postgres Full Text Search
    // Note: This requires proper indexing on the columns for best performance
    // If FTS is not configured, fallback to standard ilike
    return supabase
      .from('sheet_music')
      .select('*')
      .eq('tuna_id', tunaId)
      // Attempt to search across multiple columns (title, artist, composer)
      // This syntax constructs a simple query. For more advanced queries, consider setting up a specific text search vector column
      .or(`title.ilike.%${searchTerm}%,artist.ilike.%${searchTerm}%,composer.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
  },

  /**
   * Criar nova partitura
   */
  async createSheetMusic(music: Omit<SheetMusic, 'id' | 'created_at' | 'updated_at'>) {
    return supabase
      .from('sheet_music')
      .insert([music])
      .select()
      .single();
  },

  /**
   * Atualizar partitura
   */
  async updateSheetMusic(
    musicId: number,
    updates: Partial<Omit<SheetMusic, 'id' | 'tuna_id' | 'created_at'>>
  ) {
    return supabase
      .from('sheet_music')
      .update(updates)
      .eq('id', musicId)
      .select()
      .single();
  },

  /**
   * Deletar partitura
   */
  async deleteSheetMusic(musicId: number) {
    return supabase.from('sheet_music').delete().eq('id', musicId);
  },

  /**
   * Upload de PDF para o Supabase Storage
   */
  async uploadPdf(file: File, tunaId: number, folder: string): Promise<{
    data: { publicUrl: string } | null;
    error: PostgrestError | null;
  }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${tunaId}/${Date.now()}.${fileExt}`; // Unique filename
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('tuna-manager-bucket') // Assuming a bucket named 'tuna-manager-bucket'
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      return { data: null, error: error as unknown as PostgrestError };
    }

    const { data: publicUrlData } = supabase.storage
      .from('tuna-manager-bucket')
      .getPublicUrl(filePath);

    return { data: { publicUrl: publicUrlData.publicUrl }, error: null };
  },

  /**
   * Buscar histórico de práticas de uma partitura
   */
  async getMusicPractices(sheetMusicId: number): Promise<{
    data: (MusicPractice & { event?: Event })[] | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('music_practices')
      .select(`
        *,
        event:events(*)
      `)
      .eq('sheet_music_id', sheetMusicId)
      .order('practiced_at', { ascending: false });
  },

  /**
   * Registar prática/performance
   */
  async recordPractice(
    sheetMusicId: number,
    eventId: number | null,
    status: string,
    feedback?: string
  ) {
    return supabase
      .from('music_practices')
      .insert([
        {
          sheet_music_id: sheetMusicId,
          event_id: eventId,
          status,
          feedback,
          practiced_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
  },
};

// ============================================================================
// SERVIÇO DE UTILIZADORES
// ============================================================================

export const userService = {
  /**
   * Buscar todos os utilizadores (do Supabase Auth, ou de uma tabela pública)
   */
  async getUsers(): Promise<{
    data: User[] | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await supabase.from('users').select('*');
    return { data: data as User[], error };
  },

  /**
   * Buscar utilizador por ID
   */
  async getUserById(
    userId: string
  ): Promise<{
    data: User | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data: data as User, error };
  },

  /**
   * Criar novo utilizador (registo manual na tabela pública)
   */
  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Atualizar utilizador
   */
  async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'created_at'>>
  ) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data: data as User, error };
  },

  /**
   * Deletar utilizador
   */
  async deleteUser(userId: string) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    return { error };
  },

  /**
   * Buscar roles/perfis de utilizador (exemplo)
   */
  async getUserRoles() {
    return supabase.from('user_roles').select('*');
  },
};

// ============================================================================
// SERVIÇO DE TUNAS
// ============================================================================

export const tunaService = {
  /**
   * Buscar informações de uma tuna por ID
   */
  async getTuna(
    tunaId: number
  ): Promise<{
    data: Tuna | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('tunas')
      .select('*')
      .eq('id', tunaId)
      .single();
  },

  /**
   * Atualizar informações de uma tuna
   */
  async updateTuna(
    tunaId: number,
    updates: Partial<Omit<Tuna, 'id' | 'created_at'>>
  ) {
    return supabase
      .from('tunas')
      .update(updates)
      .eq('id', tunaId)
      .select()
      .single();
  },
};

// ============================================================================
// SERVIÇO DE ROLES DE HIERARQUIA
// ============================================================================

export const hierarchyRoleService = {
  /**
   * Buscar todos os roles de hierarquia de uma tuna
   */
  async getRoles(tunaId: number): Promise<{
    data: HierarchyRole[] | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('hierarchy_roles')
      .select('*')
      .eq('tuna_id', tunaId)
      .order('level', { ascending: true });
  },

  /**
   * Buscar role de hierarquia por ID
   */
  async getRole(
    roleId: number
  ): Promise<{
    data: HierarchyRole | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('hierarchy_roles')
      .select('*')
      .eq('id', roleId)
      .single();
  },

  /**
   * Criar novo role de hierarquia
   */
  async createRole(role: Omit<HierarchyRole, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('hierarchy_roles').insert([role]).select().single();
  },

  /**
   * Atualizar role de hierarquia
   */
  async updateRole(
    roleId: number,
    updates: Partial<Omit<HierarchyRole, 'id' | 'tuna_id' | 'created_at'>>
  ) {
    return supabase
      .from('hierarchy_roles')
      .update(updates)
      .eq('id', roleId)
      .select()
      .single();
  },

  /**
   * Deletar role de hierarquia
   */
  async deleteRole(roleId: number) {
    return supabase.from('hierarchy_roles').delete().eq('id', roleId);
  },
};

// ============================================================================
// SERVIÇO DE SEÇÕES DE INSTRUMENTOS
// ============================================================================

export const instrumentSectionService = {
  /**
   * Buscar todas as seções de instrumentos de uma tuna
   */
  async getSections(tunaId: number): Promise<{
    data: InstrumentSection[] | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('instrument_sections')
      .select('*')
      .eq('tuna_id', tunaId)
      .order('name', { ascending: true });
  },

  /**
   * Buscar seção de instrumento por ID
   */
  async getSection(
    sectionId: number
  ): Promise<{
    data: InstrumentSection | null;
    error: PostgrestError | null;
  }> {
    return supabase
      .from('instrument_sections')
      .select('*')
      .eq('id', sectionId)
      .single();
  },

  /**
   * Criar nova seção de instrumento
   */
  async createSection(section: Omit<InstrumentSection, 'id' | 'created_at'>) {
    return supabase.from('instrument_sections').insert([section]).select().single();
  },

  /**
   * Atualizar seção de instrumento
   */
  async updateSection(
    sectionId: number,
    updates: Partial<Omit<InstrumentSection, 'id' | 'tuna_id' | 'created_at'>>
  ) {
    return supabase
      .from('instrument_sections')
      .update(updates)
      .eq('id', sectionId)
      .select()
      .single();
  },

  /**
   * Deletar seção de instrumento
   */
  async deleteSection(sectionId: number) {
    return supabase.from('instrument_sections').delete().eq('id', sectionId);
  },
};
