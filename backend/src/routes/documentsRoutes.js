const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const router = express.Router();

router.get('/:documentoId/download', async (req, res) => {
  const documentoId = Number(req.params.documentoId);

  if (!Number.isInteger(documentoId) || documentoId <= 0) {
    return res.status(404).json({ erro: 'Documento nao encontrado.' });
  }

  try {
    const result = await db.query(
      `SELECT d.caminho, d.nome_arquivo
       FROM documentos d
       JOIN estagios e ON e.id = d.estagio_id
       WHERE d.id = $1 AND (e.aluno_id = $2 OR $3 IN ('coordenacao', 'admin'))`,
      [documentoId, req.user.id, req.user.tipo]
    );

    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Documento nao encontrado.' });
    }

    const document = result.rows[0];
    const filePath = path.resolve(process.cwd(), document.caminho);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ erro: 'Arquivo nao encontrado no servidor.' });
    }

    return res.download(filePath, document.nome_arquivo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel baixar o documento.' });
  }
});

module.exports = router;
