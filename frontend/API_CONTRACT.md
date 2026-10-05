# Contrato de API esperado pelo Frontend

Documento completo da API:

```txt
../API_DOCUMENTATION.md
```

Base URL usada pelo frontend:

```txt
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Se `VITE_API_BASE_URL` nao estiver configurado, o frontend usa:

```txt
http://localhost:3000/api/v1
```

## Autenticacao

O frontend salva o token retornado pelo login em `localStorage` com a chave:

```txt
token
```

Todas as rotas protegidas recebem:

```http
Authorization: Bearer <token>
```

## Endpoints consumidos

### Login

```txt
POST /auth/login
```

Request:

```json
{
  "email": "Vitor",
  "senha": "senha123"
}
```

Response:

```json
{
  "token": "jwt_token",
  "usuario": {
    "id": 9001,
    "nome": "Vitor",
    "email": "vitor@faeterj.br",
    "tipo": "aluno"
  }
}
```

### Usuario atual

```txt
GET /auth/me
```

### Recuperacao de senha

```txt
POST /auth/recuperar-senha
POST /auth/recuperar-senha/confirmar
```

Request para gerar codigo:

```json
{
  "login": "vitor@faeterj.br"
}
```

Request para confirmar:

```json
{
  "login": "vitor@faeterj.br",
  "codigo": "123456",
  "novaSenha": "novaSenha123"
}
```

### Perfil

```txt
GET /alunos/me
```

### Estagios

```txt
GET /estagios
GET /estagios/prazos
PATCH /estagios/:estagioId/periodo
```

### Documentos

```txt
GET /estagios/:estagioId/documentos
POST /estagios/:estagioId/documentos
PATCH /estagios/:estagioId/documentos/:documentoId
GET /documentos/:documentoId/download
```

Atualizar periodo exige `data_inicio` e `data_fim` no formato `YYYY-MM-DD`; envie `null` ou string vazia para limpar uma data. A rota e restrita a coordenacao e Admin.

Upload usa `FormData`:

```txt
arquivo: File
tipo: string
```

### Notificacoes

```txt
GET /notificacoes
POST /notificacoes
GET /notificacoes/enviadas
GET /notificacoes/nao-lidas
PATCH /notificacoes/ler-todas
PATCH /notificacoes/:id/ler
```

### Mensagens

```txt
GET /mensagens
GET /mensagens/nao-lidas
POST /mensagens
```

### Informacoes

```txt
GET /info/seguro/me
GET /info/seguro/:usuarioId
PUT /info/seguro/:usuarioId
GET /info/empresas
GET /info/faq
GET /info/templates
GET /info/templates/:id
GET /info/usuarios?tipo=aluno
GET /info/usuarios?tipo=coordenacao
```

Consultar ou atualizar o seguro de outro usuario e restrito a coordenacao e Admin. A atualizacao aceita `seguradora`, `apolice`, `cobertura`, `status`, `vigencia_inicio`, `vigencia_fim` e `observacao`.

### Usuarios Admin

```txt
GET /usuarios
POST /usuarios
PATCH /usuarios/:id/senha
```

`POST /usuarios` e usado apenas pelo perfil Admin.

`PATCH /usuarios/:id/senha` e usado por Admin e coordenacao. Admin altera qualquer usuario. Coordenacao altera alunos e a propria senha.

Request:

```json
{
  "nome": "Novo Aluno",
  "email": "novo.aluno@faeterj.br",
  "senha": "senha123",
  "tipo": "aluno",
  "matricula": "2026006",
  "curso": "Sistemas de Informacao",
  "semestre": "1 semestre",
  "telefone": "(21) 99999-9999"
}
```

Request para alterar senha:

```json
{
  "novaSenha": "senha123"
}
```

### Vagas

```txt
GET /vagas
GET /vagas?status=Aberta
POST /vagas
PATCH /vagas/:id
DELETE /vagas/:id
```

Alunos usam `GET /vagas`. Coordenacao e Admin usam `POST /vagas` para publicar oportunidades.

## Erros esperados

Formato padrao:

```json
{
  "erro": "Mensagem do erro."
}
```

Em erro `401`, o frontend remove o token e redireciona para `/login`, exceto nas rotas publicas de login e recuperacao de senha, onde a mensagem do servidor aparece na tela.
