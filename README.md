# Sistema de Gestão de Estágios FAETERJ

## Resumo acadêmico

Este projeto consiste no desenvolvimento de uma aplicação web para auxiliar no acompanhamento de estágios acadêmicos, contemplando autenticação de usuários, gestão de documentos, notificações, mensagens e cadastro de vagas. A proposta tem como foco oferecer uma solução prática para estudantes, coordenadores e administradores, centralizando as atividades relacionadas ao processo de estágio.

## Problema abordado

A gestão de estágios costuma envolver diferentes atores, documentos e acompanhamentos dispersos em canais não estruturados. Esse cenário pode gerar retrabalho, perda de informação e dificuldade no acompanhamento das etapas do processo.

## Objetivos

### Objetivo geral
Implementar uma plataforma web que facilite a organização e o acompanhamento das atividades de estágio acadêmico.

### Objetivos específicos
- disponibilizar autenticação e controle de acesso por perfil;
- permitir o registro e acompanhamento de estágios;
- centralizar o envio e visualização de documentos;
- oferecer notificações e mensagens internas;
- fornecer uma interface simples para estudantes e coordenadores.

## Metodologia

O desenvolvimento foi organizado em etapas que contemplam:
1. levantamento de requisitos;
2. modelagem das funcionalidades principais;
3. implementação do backend com Node.js e Express;
4. implementação do frontend com React e Vite;
5. testes funcionais das rotas e fluxo de uso.

## Tecnologias utilizadas

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, PostgreSQL, JWT, bcryptjs, multer
- Gerenciamento: npm, Git, GitHub

## Estrutura do projeto

- backend/: API REST e integração com PostgreSQL
- frontend/: interface web do sistema
- docs/: documentação complementar do trabalho

## Como executar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- npm

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Para carregar os dados de demonstração no PostgreSQL durante o desenvolvimento, execute `npm run seed` em outro terminal dentro de `backend/`. Esse comando substitui os dados existentes pelas contas e registros de exemplo; aluno: `vitor@faeterj.br` / `vitor1234567`, coordenação: `gabriel@faeterj.br` / `gabriel12345`, administrador: `admin@faeterj.br` / `admin1234567`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Arquitetura geral

A aplicação segue uma arquitetura cliente-servidor, com:
- frontend consumindo a API REST do backend;
- backend validando autenticação JWT;
- banco PostgreSQL armazenando usuários, estágios, documentos, notificações e mensagens.

## App instalável / PWA

O frontend foi configurado como PWA para permitir que o sistema possa ser instalado como um aplicativo no navegador, em desktop e em dispositivos móveis, com ícone próprio e aparência de app nativo.

### O que está configurado
- manifest do aplicativo
- ícones em diferentes tamanhos
- suporte a instalação como app standalone
- cache de assets com Workbox

### Como testar a instalação localmente
```bash
cd frontend
npm install
npm run build
npm run preview
```

A partir do navegador, acesse a aplicação e use a opção "Instalar aplicativo" ou "Adicionar à tela inicial" quando disponível.

### Produção
O repositório inclui um Blueprint do Render em `render.yaml` para publicar o frontend e a API no mesmo serviço. O banco pode ser criado no Neon usando o plano gratuito.

1. Crie ou selecione um projeto PostgreSQL no Neon. Na tela **Connect**, escolha a branch, o banco e a role; copie a URL de conexão pooled (host com `-pooler`) para uso pela aplicação.
2. No Render, escolha **New > Blueprint**, conecte este repositório e confirme a criação do serviço definido em `render.yaml`.
3. Quando solicitado, configure `DATABASE_URL` com a URL pooled do Neon, `INITIAL_ADMIN_EMAIL` com o email do administrador e `INITIAL_ADMIN_PASSWORD` com uma senha exclusiva de pelo menos 12 caracteres. O Render gera `JWT_SECRET` automaticamente.
4. Aguarde o deploy. O serviço executa `backend/scripts/setup-db.js` na inicialização para criar/atualizar as tabelas e cria a conta de administrador inicial quando ainda não existe um administrador. Verifique o health check em `/api/v1/health` e acesse a URL `onrender.com`.
5. Para instalar no celular, abra essa URL em HTTPS e use "Instalar aplicativo" ou "Adicionar à tela inicial".

Nunca grave URLs de banco, senhas ou outros segredos em arquivos versionados. `backend/.env.example` contém apenas campos de exemplo; configure os valores reais no painel do Render. Se uma URL de conexão ou senha já foi publicada no GitHub, redefina a senha da role no Neon e atualize `DATABASE_URL` no Render antes de usar o serviço.

O plano gratuito do serviço pode entrar em suspensão após períodos sem uso. Os arquivos enviados ficam no armazenamento temporário do serviço e podem ser perdidos em reinicializações ou novos deploys. Não use esse armazenamento para documentos reais importantes; para isso, será necessário contratar armazenamento persistente ou um serviço de objetos.

O schema do banco é inicializado automaticamente ao iniciar a API. As informações da DIVEST, as empresas conveniadas, as vagas e as perguntas frequentes de demonstração são carregadas somente quando as respectivas tabelas estão vazias; os registros existentes não são apagados nem substituídos. O script `backend/scripts/seed.js` é apenas para desenvolvimento: ele apaga e recria dados de exemplo e não deve ser executado no banco de produção. As rotas consultam e persistem os registros no PostgreSQL; não usam `demoData.js` como armazenamento em memória.

### Keep-alive (opcional)

O workflow `.github/workflows/keep-alive.yml` chama `/api/v1/health` a cada 5 minutos. Esse endpoint consulta o PostgreSQL com `SELECT 1`, ajudando a manter a API do Render e o compute do Neon ativos. O workflow também pode ser executado manualmente na aba **Actions** do GitHub.

O agendamento do GitHub pode atrasar ou ser suspenso por inatividade do repositório; não é uma garantia de disponibilidade. O ping frequente pode consumir as horas gratuitas do Render, portanto desative o workflow se não quiser manter o serviço acordado. A chamada é somente leitura e não envia credenciais.

## Referências acadêmicas

Este projeto pode ser utilizado como base para um trabalho de conclusão de curso em áreas relacionadas a sistemas web, desenvolvimento full stack e gestão acadêmica.
