const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const estagiosRoutes = require('./routes/estagiosRoutes');
const documentsRoutes = require('./routes/documentsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const profileRoutes = require('./routes/profileRoutes');
const infoRoutes = require('./routes/infoRoutes');
const usersRoutes = require('./routes/usersRoutes');
const vacanciesRoutes = require('./routes/vacanciesRoutes');
const authenticate = require('./middleware/auth');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uploadsDir = path.resolve(process.cwd(), process.env.UPLOADS_DIR || 'uploads');
const frontendDistDir = path.resolve(__dirname, '../../frontend/dist');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(cors(
  process.env.NODE_ENV === 'production'
    ? { origin: allowedOrigins || false }
    : undefined
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/v1', (req, res) => {
  res.json({
    nome: 'Sistema de Estagios FAETERJ',
    status: 'online',
    mensagem: 'API funcionando. Use o frontend em http://localhost:5173 ou acesse os endpoints abaixo.',
    endpoints: {
      login: 'POST /api/v1/auth/login',
      usuarioAtual: 'GET /api/v1/auth/me',
      recuperarSenha: 'POST /api/v1/auth/recuperar-senha',
      confirmarRecuperacao: 'POST /api/v1/auth/recuperar-senha/confirmar',
      estagios: 'GET /api/v1/estagios',
      documentos: 'GET /api/v1/estagios/:estagioId/documentos',
      notificacoes: 'GET|POST /api/v1/notificacoes',
      notificacoesEnviadas: 'GET /api/v1/notificacoes/enviadas',
      mensagens: 'GET /api/v1/mensagens',
      seguro: 'GET /api/v1/info/seguro/me',
      empresas: 'GET /api/v1/info/empresas',
      faq: 'GET /api/v1/info/faq',
      templates: 'GET /api/v1/info/templates',
      usuarios: 'GET /api/v1/info/usuarios?tipo=aluno',
      gerenciarUsuarios: 'GET|POST /api/v1/usuarios',
      alterarSenha: 'PATCH /api/v1/usuarios/:id/senha',
      vagas: 'GET|POST /api/v1/vagas',
    },
  });
});

app.get('/api/v1/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ status: 'online', database: 'connected' });
  } catch (error) {
    console.error('Health check database query failed:', error);
    return res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/estagios', authenticate, estagiosRoutes);
app.use('/api/v1/documentos', authenticate, documentsRoutes);
app.use('/api/v1/notificacoes', authenticate, notificationsRoutes);
app.use('/api/v1/mensagens', authenticate, messagesRoutes);
app.use('/api/v1/alunos', authenticate, profileRoutes);
app.use('/api/v1/info', authenticate, infoRoutes);
app.use('/api/v1/usuarios', authenticate, usersRoutes);
app.use('/api/v1/vagas', authenticate, vacanciesRoutes);

if (fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(frontendDistDir, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ erro: 'Endpoint não encontrado.' });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}/api/v1`);
});
