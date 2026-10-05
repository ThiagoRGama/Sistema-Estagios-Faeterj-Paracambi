# Backend Express + PostgreSQL

Este backend implementa a API REST esperada pelo frontend React.

## Instalação

1. Na pasta `backend/`, instale as dependências:

   ```bash
   npm install
   ```

2. Crie um banco PostgreSQL e atualize `backend/.env` com a URL correta.

3. Crie o banco de dados e rode as migrações:

   ```bash
   psql "${DATABASE_URL}" -f schema.sql
   npm run seed
   ```

4. Inicie a API:
   ```bash
   npm run dev
   ```

## Endpoints principais

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/estagios`
- `GET /api/v1/estagios/prazos`
- `GET /api/v1/estagios/:estagioId/documentos`
- `POST /api/v1/estagios/:estagioId/documentos`
- `GET /api/v1/documentos/:documentoId/download`
- `GET /api/v1/notificacoes`
- `GET /api/v1/notificacoes/nao-lidas`
- `PATCH /api/v1/notificacoes/ler-todas`
- `PATCH /api/v1/notificacoes/:id/ler`
- `GET /api/v1/mensagens`
- `GET /api/v1/mensagens/nao-lidas`
- `POST /api/v1/mensagens`
- `GET /api/v1/alunos/me`
