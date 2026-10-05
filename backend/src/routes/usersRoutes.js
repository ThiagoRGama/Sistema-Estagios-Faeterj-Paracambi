const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();
const allowedTypes = ['aluno', 'coordenacao', 'admin'];

const publicUser = ({ senha_hash, ...user }) => user;

const requireAdmin = (req, res, next) => {
  if (req.user?.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Apenas o Admin pode gerenciar usuarios.' });
  }

  return next();
};

const requirePasswordManager = (req, res, next) => {
  if (!['admin', 'coordenacao'].includes(req.user?.tipo)) {
    return res.status(403).json({ erro: 'Apenas Admin ou coordenacao podem alterar senhas.' });
  }

  return next();
};

const normalize = (value) => String(value || '').trim();
const normalizeLogin = (value) => normalize(value).toLowerCase();

const canChangePassword = (actor, target) =>
  actor?.tipo === 'admin' ||
  (actor?.tipo === 'coordenacao' && (target?.tipo === 'aluno' || Number(target?.id) === Number(actor.id)));

router.get('/', requireAdmin, async (req, res) => {
  const filterType = allowedTypes.includes(req.query.tipo) ? req.query.tipo : null;

  try {
    const result = await db.query(
      `SELECT u.id, u.nome, u.email, u.tipo, u.matricula, u.curso, u.semestre, u.telefone, u.criado_em,
              e.id AS estagio_id, e.vaga_titulo, e.empresa_nome, e.supervisor, e.status AS estagio_status,
              e.data_inicio, e.data_fim
       FROM usuarios u
       LEFT JOIN LATERAL (
         SELECT id, vaga_titulo, empresa_nome, supervisor, status, data_inicio, data_fim
         FROM estagios
         WHERE aluno_id = u.id
         ORDER BY criado_em DESC, id DESC
         LIMIT 1
       ) e ON true
       WHERE ($1::text IS NULL OR u.tipo = $1)
       ORDER BY u.criado_em DESC, u.id`,
      [filterType]
    );

    return res.json(
      result.rows.map(({ estagio_id, vaga_titulo, empresa_nome, supervisor, estagio_status, data_inicio, data_fim, ...user }) => ({
        ...user,
        estagio: estagio_id
          ? { id: estagio_id, vaga_titulo, empresa_nome, supervisor, status: estagio_status, data_inicio, data_fim }
          : null,
      }))
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel listar os usuarios.' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const nome = normalize(req.body.nome);
  const email = normalize(req.body.email).toLowerCase();
  const senha = normalize(req.body.senha);
  const tipo = normalize(req.body.tipo || 'aluno').toLowerCase();
  const matricula = tipo === 'aluno' ? normalize(req.body.matricula) || null : null;
  const curso = tipo === 'aluno' ? normalize(req.body.curso) || 'Sistemas de Informacao' : null;
  const semestre = tipo === 'aluno' ? normalize(req.body.semestre) || '1 semestre' : null;
  const telefone = normalize(req.body.telefone) || null;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha sao obrigatorios.' });
  }

  if (!/^[a-z0-9._%+-]+@faeterj\.br$/i.test(email)) {
    return res.status(400).json({ erro: 'O e-mail deve usar o dominio @faeterj.br.' });
  }

  if (!allowedTypes.includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo de usuario invalido.' });
  }

  try {
    const duplicate = await db.query(
      'SELECT 1 FROM usuarios WHERE LOWER(email) = $1 OR LOWER(nome) = $2 LIMIT 1',
      [email, normalizeLogin(nome)]
    );
    if (duplicate.rows.length) {
      return res.status(409).json({ erro: 'Ja existe usuario com este nome ou e-mail.' });
    }

    const passwordHash = bcrypt.hashSync(senha, 10);
    const result = await db.query(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo, matricula, curso, semestre, telefone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nome, email, tipo, matricula, curso, semestre, telefone, criado_em`,
      [nome, email, passwordHash, tipo, matricula, curso, semestre, telefone]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Ja existe usuario com este nome ou e-mail.' });
    }

    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel criar o usuario.' });
  }
});

router.patch('/:id/senha', requirePasswordManager, async (req, res) => {
  const targetId = Number(req.params.id);
  const novaSenha = normalize(req.body.novaSenha || req.body.senha);

  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ erro: 'Usuario invalido.' });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const targetResult = await db.query('SELECT id, nome, tipo FROM usuarios WHERE id = $1', [targetId]);
    const targetUser = targetResult.rows[0];

    if (!targetUser) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }

    if (!canChangePassword(req.user, targetUser)) {
      return res.status(403).json({ erro: 'Voce nao tem permissao para alterar a senha deste usuario.' });
    }

    const passwordHash = bcrypt.hashSync(novaSenha, 10);
    const updatedResult = await db.query(
      `UPDATE usuarios
       SET senha_hash = $1
       WHERE id = $2
       RETURNING id, nome, email, tipo, matricula, curso, semestre, telefone, criado_em`,
      [passwordHash, targetId]
    );

    return res.json({
      mensagem: `Senha de ${updatedResult.rows[0].nome} atualizada com sucesso.`,
      usuario: publicUser(updatedResult.rows[0]),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel alterar a senha.' });
  }
});

module.exports = router;
