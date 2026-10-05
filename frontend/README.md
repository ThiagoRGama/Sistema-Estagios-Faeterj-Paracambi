# Front-end do Sistema de Estágio

Este é o front-end do sistema de estágio, construído com **React**, **Vite** e **Tailwind CSS**.

## Como rodar

1. Abra o terminal em `frontend`.
2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

4. Abra o link exibido na saída do terminal (normalmente `http://localhost:5173`).

## Configuração de API

A URL base da API é definida em `.env` com a variável:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Ajuste conforme o endereço do back-end.

## Páginas incluídas

- `/` - Página inicial do sistema
- `/login` - Tela de login
- `/dashboard` - Painel do aluno
- `/profile` - Perfil do usuário
- `/documents` - Lista de documentos
- `/upload` - Upload de arquivo
