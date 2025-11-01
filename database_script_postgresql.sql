-- Script completo do banco de dados para PostgreSQL
-- Sistema de Gerenciamento de Pagamentos de Membros
-- Execute este script em um banco PostgreSQL para criar todas as tabelas necessárias

-- Criar tabela de membros
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para nome dos membros (busca rápida)
CREATE INDEX idx_members_name ON members(name);

-- Criar índice para email dos membros
CREATE INDEX idx_members_email ON members(email);

-- Criar índice para membros ativos
CREATE INDEX idx_members_active ON members(is_active);

-- Criar tabela de pagamentos
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  member_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para nome do membro nos pagamentos
CREATE INDEX idx_payments_member_name ON payments(member_name);

-- Criar índice para data do pagamento
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Criar índice para data de criação dos pagamentos
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Dados de exemplo (opcional - remova se não quiser dados de teste)
INSERT INTO members (name, email, phone, is_active) VALUES 
('João Silva', 'joao@email.com', '11999999999', true),
('Maria Santos', 'maria@email.com', '11888888888', true),
('Pedro Costa', 'pedro@email.com', '11777777777', true),
('Ana Oliveira', 'ana@email.com', '11666666666', true);

INSERT INTO payments (member_name, amount, payment_date) VALUES 
('João Silva', 100.00, '2024-01-15'),
('Maria Santos', 150.00, '2024-01-20'),
('Pedro Costa', 100.00, '2024-02-10'),
('Ana Oliveira', 200.00, '2024-02-15'),
('João Silva', 100.00, '2024-02-20');

-- Verificar se as tabelas foram criadas corretamente
-- Descomente as linhas abaixo se quiser verificar
-- SELECT 'Membros cadastrados:' as info;
-- SELECT * FROM members;
-- SELECT 'Pagamentos registrados:' as info;  
-- SELECT * FROM payments;
-- SELECT 'Total de membros:' as info, COUNT(*) as total FROM members;
-- SELECT 'Total de pagamentos:' as info, COUNT(*) as total FROM payments;
