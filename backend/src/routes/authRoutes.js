const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticate = require('../middleware/auth');

const router = express.Router();
const jwtSecret = () => process.env.JWT_SECRET || 'dev_secret_change_me';
const recoveryCodes = new Map();
const recoveryTtlMs = 15 * 60 * 1000;

const publicUser = ({ senha_hash, ...user }) => user;

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, tipo: user.tipo }, jwtSecret(), { expiresIn: '8h' });

const findDbUserByLogin = async (login) => {
  const result = await db.query(
    `SELECT id, nome, email, senha_hash, tipo, matricula, curso, semestre, telefone, criado_em
     FROM usuarios
     WHERE LOWER(email) = LOWER($1) OR LOWER(nome) = LOWER($1)
     LIMIT 1`,
    [login]
  );

  return result.rows[0] || null;
};

const makeRecoveryCode = () => String(Math.floor(100000 + Math.random() * 900000));
const passwordIsValid = (password) => String(password || '').trim().length >= 6;

router.post('/recuperar-senha', async (req, res) => {
  const login = String(req.body.email || req.body.login || '').trim();

  if (!login) {
    return res.status(400).json({ erro: 'Informe o nome ou e-mail cadastrado.' });
  }

  try {
    const user = await findDbUserByLogin(login);
    if (!user) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }

    const codigo = makeRecoveryCode();
    const expiresAt = Date.now() + recoveryTtlMs;
    recoveryCodes.set(String(user.id), { codigo, expiresAt });

    return res.json({
      mensagem: 'Codigo de recuperacao gerado. Use este codigo para criar uma nova senha.',
      usuario: publicUser(user),
      codigo,
      expira_em: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel iniciar a recuperacao de senha.' });
  }
});

router.post('/recuperar-senha/confirmar', async (req, res) => {
  const login = String(req.body.email || req.body.login || '').trim();
  const codigo = String(req.body.codigo || '').trim();
  const novaSenha = String(req.body.novaSenha || req.body.senha || '').trim();

  if (!login || !codigo || !novaSenha) {
    return res.status(400).json({ erro: 'Login, codigo e nova senha sao obrigatorios.' });
  }

  if (!passwordIsValid(novaSenha)) {
    return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const user = await findDbUserByLogin(login);
    if (!user) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }

    const key = String(user.id);
    const recovery = recoveryCodes.get(key);
    if (!recovery || recovery.codigo !== codigo) {
      return res.status(400).json({ erro: 'Codigo de recuperacao invalido.' });
    }

    if (Date.now() > recovery.expiresAt) {
      recoveryCodes.delete(key);
      return res.status(400).json({ erro: 'Codigo expirado. Solicite uma nova recuperacao.' });
    }

    const passwordHash = bcrypt.hashSync(novaSenha, 10);
    const updatedResult = await db.query(
      `UPDATE usuarios
       SET senha_hash = $1
       WHERE id = $2
       RETURNING id, nome, email, tipo, matricula, curso, semestre, telefone, criado_em`,
      [passwordHash, user.id]
    );
    recoveryCodes.delete(key);

    if (!updatedResult.rows.length) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }

    return res.json({
      mensagem: 'Senha atualizada com sucesso. Voce ja pode entrar com a nova senha.',
      usuario: updatedResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel concluir a recuperacao de senha.' });
  }
});

router.post('/login', async (req, res) => {
  const login = String(req.body.email || req.body.login || '').trim();
  const { senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ erro: 'Nome/e-mail e senha sao obrigatorios.' });
  }

  try {
    const user = await findDbUserByLogin(login);
    if (!user || !bcrypt.compareSync(senha, user.senha_hash)) {
      return res.status(401).json({ erro: 'Nome/e-mail ou senha invalidos.' });
    }

    return res.json({ token: signToken(user), usuario: publicUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel realizar o login.' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ erro: 'Usuario nao autenticado.' });
  }

  try {
    const result = await db.query(
      `SELECT id, nome, email, tipo, matricula, curso, semestre, telefone, criado_em
       FROM usuarios
       WHERE id = $1`,
      [req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

module.exports = router;
