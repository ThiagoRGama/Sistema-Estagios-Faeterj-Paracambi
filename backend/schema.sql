CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'aluno',
  matricula TEXT,
  curso TEXT,
  semestre TEXT,
  telefone TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone TEXT;

CREATE TABLE IF NOT EXISTS estagios (
  id SERIAL PRIMARY KEY,
  aluno_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  vaga_titulo TEXT NOT NULL,
  empresa_nome TEXT NOT NULL,
  supervisor TEXT,
  status TEXT NOT NULL DEFAULT 'Em andamento',
  data_inicio DATE,
  data_fim DATE,
  aluno_trabalhador_status TEXT NOT NULL DEFAULT 'pendente',
  aluno_trabalhador_observacao TEXT NOT NULL DEFAULT '',
  aluno_trabalhador_atualizado_em TIMESTAMP WITH TIME ZONE,
  aluno_trabalhador_avaliado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE estagios ADD COLUMN IF NOT EXISTS supervisor TEXT;
ALTER TABLE estagios ADD COLUMN IF NOT EXISTS aluno_trabalhador_status TEXT NOT NULL DEFAULT 'pendente';
ALTER TABLE estagios ADD COLUMN IF NOT EXISTS aluno_trabalhador_observacao TEXT NOT NULL DEFAULT '';
ALTER TABLE estagios ADD COLUMN IF NOT EXISTS aluno_trabalhador_atualizado_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE estagios ADD COLUMN IF NOT EXISTS aluno_trabalhador_avaliado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS documentos (
  id SERIAL PRIMARY KEY,
  estagio_id INTEGER NOT NULL REFERENCES estagios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  nome_arquivo TEXT NOT NULL,
  caminho TEXT NOT NULL,
  observacao TEXT,
  avaliado_em TIMESTAMP WITH TIME ZONE,
  avaliado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  enviado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE documentos ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS avaliado_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS avaliado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS notificacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  criado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS criado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS mensagens (
  id SERIAL PRIMARY KEY,
  remetente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  destinatario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estagio_id INTEGER REFERENCES estagios(id) ON DELETE SET NULL,
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vagas (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  empresa_nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  requisitos TEXT NOT NULL DEFAULT '',
  curso_alvo TEXT NOT NULL DEFAULT 'Todos os cursos',
  carga_horaria TEXT NOT NULL DEFAULT 'A combinar',
  modalidade TEXT NOT NULL DEFAULT 'A combinar',
  local TEXT NOT NULL DEFAULT 'A combinar',
  bolsa TEXT NOT NULL DEFAULT 'A combinar',
  data_limite DATE,
  status TEXT NOT NULL DEFAULT 'Aberta',
  publicado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  publicado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS seguros (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  seguradora TEXT NOT NULL,
  apolice TEXT NOT NULL,
  cobertura TEXT NOT NULL,
  status TEXT NOT NULL,
  vigencia_inicio DATE,
  vigencia_fim DATE,
  observacao TEXT
);

CREATE TABLE IF NOT EXISTS empresas_conveniadas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  area TEXT NOT NULL,
  cidade TEXT NOT NULL,
  contato TEXT NOT NULL,
  telefone TEXT,
  status TEXT NOT NULL DEFAULT 'Conveniada',
  vagas INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS divest_info (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  atendimento TEXT,
  redes_sociais JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS modelos_documentos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  publico JSONB NOT NULL DEFAULT '[]'::jsonb,
  campos JSONB NOT NULL DEFAULT '[]'::jsonb,
  conteudo TEXT NOT NULL
);
