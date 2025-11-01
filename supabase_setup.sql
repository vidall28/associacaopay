-- Script de configuração completo para Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- Armazenando senha em texto simples (apenas para desenvolvimento)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inserir admin padrão
INSERT INTO admins (username, password) 
VALUES ('associacao2025', 'associacao123')
ON CONFLICT (username) DO UPDATE SET password = 'associacao123';

-- 3. Criar tabela de membros (se não existir)
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar tabela de pagamentos (se não existir)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  member_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_payments_member_name ON payments(member_name);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- 6. Inserir dados de exemplo (opcional - comente se não quiser)
INSERT INTO members (name, email, phone, is_active) VALUES 
('João Silva', 'joao@email.com', '11999999999', true),
('Maria Santos', 'maria@email.com', '11888888888', true),
('Pedro Costa', 'pedro@email.com', '11777777777', true),
('Ana Oliveira', 'ana@email.com', '11666666666', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO payments (member_name, amount, payment_date) VALUES 
('João Silva', 100.00, '2024-01-15'),
('Maria Santos', 150.00, '2024-01-20'),
('Pedro Costa', 100.00, '2024-02-10'),
('Ana Oliveira', 200.00, '2024-02-15'),
('João Silva', 100.00, '2024-02-20')
ON CONFLICT DO NOTHING;

-- 7. Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT 'Admin cadastrado:' as info, username FROM admins;
SELECT 'Total de membros:' as info, COUNT(*) as total FROM members;
SELECT 'Total de pagamentos:' as info, COUNT(*) as total FROM payments;
