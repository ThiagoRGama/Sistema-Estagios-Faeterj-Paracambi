const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/me', async (req, res) => {
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
    return res.status(500).json({ erro: 'Nao foi possivel carregar o perfil.' });
  }
});

module.exports = router;
