-- ============================================================================
-- TUNA MANAGER - Schema de Base de Dados
-- MVP para gestão logística, financeira e patrimonial de Tunas Académicas
-- ============================================================================

-- 1. MÓDULO DE MEMBROS E HIERARQUIA
-- ============================================================================

-- Tabela de papéis/cargos hierárquicos
CREATE TABLE IF NOT EXISTS hierarchy_roles (
    id BIGSERIAL PRIMARY KEY,
    tuna_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    level INT NOT NULL DEFAULT 0,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tuna_id, name)
);

-- Tabela de naipes de instrumentos
CREATE TABLE IF NOT EXISTS instrument_sections (
    id BIGSERIAL PRIMARY KEY,
    tuna_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tuna_id, name)
);

-- Tabela de membros
CREATE TABLE IF NOT EXISTS members (
    id BIGSERIAL PRIMARY KEY,
    tuna_id BIGINT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role_id BIGINT REFERENCES hierarchy_roles(id) ON DELETE SET NULL,
    section_id BIGINT REFERENCES instrument_sections(id) ON DELETE SET NULL,
    joining_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, alumni
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de mudanças de role
CREATE TABLE IF NOT EXISTS member_role_history (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    old_role_id BIGINT REFERENCES hierarchy_roles(id),
    new_role_id BIGINT NOT NULL REFERENCES hierarchy_roles(id),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. MÓDULO DE LOGÍSTICA (ESCALONAMENTO)
-- ============================================================================

-- Tabela de eventos (ensaios, atuações, etc.)
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    tuna_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'rehearsal', 'performance', 'social', 'meeting'
    location VARCHAR(255),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT,
    required_sections JSONB DEFAULT '[]', -- array de section_ids obrigatórias
    expected_quorum INT, -- número mínimo de membros por naipe
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de presenças e confirmações
CREATE TABLE IF NOT EXISTS event_attendances (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, declined, absent
    confirmed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    confirmation_token UUID UNIQUE DEFAULT gen_random_uuid(), -- Adicionado para links de confirmação públicos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, member_id)
);

-- Vista para cálculo de quórum por naipe
CREATE VIEW event_quorum_by_section AS
SELECT
    e.id as event_id,
    e.title,
    e.event_date,
    s.id as section_id,
    s.display_name as section_name,
    COUNT(CASE WHEN ea.status = 'confirmed' THEN 1 END) as confirmed_count,
    COUNT(CASE WHEN ea.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN ea.status = 'declined' THEN 1 END) as declined_count,
    COUNT(CASE WHEN ea.status = 'absent' THEN 1 END) as absent_count,
    COUNT(DISTINCT m.id) as total_section_members
FROM events e
LEFT JOIN instrument_sections s ON e.tuna_id = s.tuna_id
LEFT JOIN members m ON m.section_id = s.id AND m.tuna_id = e.tuna_id AND m.status = 'active'
LEFT JOIN event_attendances ea ON ea.event_id = e.id AND ea.member_id = m.id
GROUP BY e.id, e.title, e.event_date, s.id, s.display_name;

-- ============================================================================
-- 3. MÓDULO DE INVENTÁRIO
-- ============================================================================

-- Tabela de itens de inventário
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    tuna_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    item_type VARCHAR(50) NOT NULL, -- 'instrument', 'costume', 'equipment', 'other'
    code VARCHAR(100) NOT NULL,
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'available', -- available, in_use, damaged, lost, decommissioned
    section_id BIGINT REFERENCES instrument_sections(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tuna_id, code)
);

-- Tabela de empréstimos/posse de itens
CREATE TABLE IF NOT EXISTS inventory_loans (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    loan_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    return_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE, -- Adicionado para alertas de sobreprazos
    condition_on_loan VARCHAR(50), -- 'excellent', 'good', 'fair', 'poor'
    condition_on_return VARCHAR(50),
    notes TEXT,
    returned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vista para item atual (quem tem a posse agora)
CREATE VIEW current_inventory_loans AS
SELECT
    li.id as loan_id,
    li.item_id,
    ii.name as item_name,
    ii.item_type,
    ii.code,
    li.member_id,
    m.name as member_name,
    m.email,
    li.loan_date,
    li.condition_on_loan,
    (CURRENT_TIMESTAMP - li.loan_date) as days_with_member
FROM inventory_loans li
JOIN inventory_items ii ON li.item_id = ii.id
JOIN members m ON li.member_id = m.id
WHERE li.return_date IS NULL;

-- ============================================================================
-- 4. MÓDULO FINANCEIRO
-- ============================================================================

-- Tabela de categorias de fluxo de caixa
CREATE TABLE IF NOT EXISTS financial_categories (
    id BIGSERIAL PRIMARY KEY,
    tuna_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'income', 'expense'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tuna_id, name)
);

-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS financial_transactions (
    id BIGSERIAL PRIMARY KEY,
    tuna_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'income', 'expense'
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    attachments JSONB DEFAULT '[]', -- array de URLs de ficheiros/comprovantes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vista para resumo financeiro por período
CREATE VIEW financial_summary AS
SELECT
    EXTRACT(YEAR FROM transaction_date)::INT as year,
    EXTRACT(MONTH FROM transaction_date)::INT as month,
    fc.type,
    fc.name as category,
    SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN ft.type = 'expense' THEN ft.amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE -ft.amount END) as balance
FROM financial_transactions ft
JOIN financial_categories fc ON ft.category_id = fc.id
GROUP BY EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date), fc.type, fc.name;

-- ============================================================================
-- 5. MÓDULO DE REPORTÓRIO E ARQUIVO DIGITAL
-- ============================================================================

-- Tabela de músicas/peças do reportório
CREATE TABLE IF NOT EXISTS sheet_music (
    id BIGSERIAL PRIMARY KEY,
    tuna_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    composer VARCHAR(255),
    arranger VARCHAR(255),
    description TEXT,
    genre VARCHAR(100),
    difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    file_url TEXT, -- URL do PDF armazenado em Supabase Storage
    file_size INT,
    pages INT,
    tags JSONB DEFAULT '[]', -- array de tags para pesquisa
    required_sections JSONB DEFAULT '[]', -- naipes necessários
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de práticas/performances de músicas
CREATE TABLE IF NOT EXISTS music_practices (
    id BIGSERIAL PRIMARY KEY,
    sheet_music_id BIGINT NOT NULL REFERENCES sheet_music(id) ON DELETE CASCADE,
    event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'learning', -- learning, rehearsing, performed, mastered
    feedback TEXT,
    practiced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. TABELAS DE ORGANIZAÇÃO MULTI-TENANT
-- ============================================================================

-- Para suportar múltiplas tunas na mesma plataforma
CREATE TABLE IF NOT EXISTS tunas (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    location VARCHAR(255),
    founded_year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX idx_members_tuna_id ON members(tuna_id);
CREATE INDEX idx_members_role_id ON members(role_id);
CREATE INDEX idx_members_section_id ON members(section_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_events_tuna_id ON events(tuna_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_event_attendances_event_id ON event_attendances(event_id);
CREATE INDEX idx_event_attendances_member_id ON event_attendances(member_id);
CREATE INDEX idx_event_attendances_status ON event_attendances(status);
CREATE INDEX idx_inventory_items_tuna_id ON inventory_items(tuna_id);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_loans_item_id ON inventory_loans(item_id);
CREATE INDEX idx_inventory_loans_member_id ON inventory_loans(member_id);
CREATE INDEX idx_inventory_loans_return_date ON inventory_loans(return_date);
CREATE INDEX idx_financial_transactions_tuna_id ON financial_transactions(tuna_id);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_sheet_music_tuna_id ON sheet_music(tuna_id);
CREATE INDEX idx_sheet_music_created_at ON sheet_music(created_at);

-- ============================================================================
-- RLS (Row Level Security) - Ativar posteriormente após configuração de auth
-- ============================================================================

ALTER TABLE IF EXISTS tunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hierarchy_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS instrument_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sheet_music ENABLE ROW LEVEL SECURITY;

