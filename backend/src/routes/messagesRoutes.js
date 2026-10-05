const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/nao-lidas', async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) AS total FROM mensagens WHERE destinatario_id = $1', [
      req.user.id,
    ]);
    return res.json({ total: Number(result.rows[0].total) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar a quantidade de mensagens.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.id, m.remetente_id, m.destinatario_id, m.conteudo, m.criado_em,
              u_remetente.nome AS remetente_nome,
              u_destinatario.nome AS destinatario_nome, m.estagio_id
       FROM mensagens m
       JOIN usuarios u_remetente ON u_remetente.id = m.remetente_id
       JOIN usuarios u_destinatario ON u_destinatario.id = m.destinatario_id
       WHERE m.remetente_id = $1 OR m.destinatario_id = $1
       ORDER BY m.criado_em DESC, m.id DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar as mensagens.' });
  }
});

router.post('/', async (req, res) => {
  const destinatarioId = Number(req.body.destinatario_id);
  const conteudo = String(req.body.conteudo || '').trim();
  const estagioId = req.body.estagio_id ? Number(req.body.estagio_id) : null;

  if (!Number.isInteger(destinatarioId) || destinatarioId <= 0 || !conteudo) {
    return res.status(400).json({ erro: 'destinatario_id e conteudo sao obrigatorios.' });
  }

  if (estagioId !== null && (!Number.isInteger(estagioId) || estagioId <= 0)) {
    return res.status(400).json({ erro: 'Estagio invalido.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO mensagens (remetente_id, destinatario_id, estagio_id, conteudo)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [req.user.id, destinatarioId, estagioId, conteudo]
    );
    return res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(404).json({ erro: 'Destinatario ou estagio nao encontrado.' });
    }

    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel enviar a mensagem.' });
  }
});

module.exports = router;
