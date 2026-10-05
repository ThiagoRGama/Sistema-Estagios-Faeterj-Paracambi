const express = require('express');
const db = require('../db');

const router = express.Router();

const canPublish = (user) => ['coordenacao', 'admin'].includes(user?.tipo);
const normalize = (value) => String(value || '').trim();

const requirePublisher = (req, res, next) => {
  if (!canPublish(req.user)) {
    return res.status(403).json({ erro: 'Apenas a coordenacao pode publicar notificacoes.' });
  }

  return next();
};

router.get('/enviadas', requirePublisher, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.id, n.usuario_id, n.titulo, n.mensagem, n.lida, n.criado_em,
              n.criado_por, aluno.nome AS destinatario_nome, autor.nome AS criado_por_nome
       FROM notificacoes n
       JOIN usuarios aluno ON aluno.id = n.usuario_id
       LEFT JOIN usuarios autor ON autor.id = n.criado_por
       WHERE n.criado_por IS NOT NULL
       ORDER BY n.criado_em DESC, n.id DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar as notificacoes enviadas.' });
  }
});

router.post('/', requirePublisher, async (req, res) => {
  const titulo = normalize(req.body.titulo);
  const mensagem = normalize(req.body.mensagem);
  const destinatario = normalize(req.body.destinatario_id || 'todos').toLowerCase();

  if (!titulo || !mensagem) {
    return res.status(400).json({ erro: 'Titulo e mensagem sao obrigatorios.' });
  }

  if (titulo.length > 120 || mensagem.length > 2000) {
    return res.status(400).json({ erro: 'Use ate 120 caracteres no titulo e 2000 na mensagem.' });
  }

  const recipientId = destinatario === 'todos' ? null : Number(destinatario);
  if (destinatario !== 'todos' && (!Number.isInteger(recipientId) || recipientId <= 0)) {
    return res.status(404).json({ erro: 'Aluno destinatario nao encontrado.' });
  }

  try {
    const result = await db.query(
      `WITH recipients AS (
         SELECT id, nome
         FROM usuarios
         WHERE tipo = 'aluno'
           AND ($1::integer IS NULL OR id = $1)
       ),
       created AS (
         INSERT INTO notificacoes (usuario_id, titulo, mensagem, lida, criado_por)
         SELECT id, $2, $3, false, $4
         FROM recipients
         RETURNING id, usuario_id, titulo, mensagem, lida, criado_em, criado_por
       )
       SELECT created.id, created.usuario_id, created.titulo, created.mensagem, created.lida,
              created.criado_em, created.criado_por, recipients.nome AS destinatario_nome,
              autor.nome AS criado_por_nome
       FROM created
       JOIN recipients ON recipients.id = created.usuario_id
       LEFT JOIN usuarios autor ON autor.id = created.criado_por
       ORDER BY created.criado_em DESC, created.id DESC`,
      [recipientId, titulo, mensagem, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Aluno destinatario nao encontrado.' });
    }

    return res.status(201).json({
      mensagem: `Notificacao enviada para ${result.rows.length} aluno(s).`,
      total: result.rows.length,
      notificacoes: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel enviar a notificacao.' });
  }
});

router.get('/nao-lidas', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, titulo, mensagem, criado_em
       FROM notificacoes
       WHERE usuario_id = $1 AND lida = false
       ORDER BY criado_em DESC, id DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar as notificacoes.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, titulo, mensagem, lida, criado_em
       FROM notificacoes
       WHERE usuario_id = $1
       ORDER BY criado_em DESC, id DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar as notificacoes.' });
  }
});

router.patch('/ler-todas', async (req, res) => {
  try {
    await db.query('UPDATE notificacoes SET lida = true WHERE usuario_id = $1', [req.user.id]);
    return res.json({ mensagem: 'Notificacoes marcadas como lidas.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel marcar as notificacoes como lidas.' });
  }
});

router.patch('/:id/ler', async (req, res) => {
  try {
    await db.query('UPDATE notificacoes SET lida = true WHERE id = $1 AND usuario_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    return res.json({ mensagem: 'Notificacao marcada como lida.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel marcar a notificacao como lida.' });
  }
});

module.exports = router;
