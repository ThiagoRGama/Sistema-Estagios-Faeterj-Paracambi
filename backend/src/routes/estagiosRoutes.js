const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = express.Router();
const uploadsDir = path.resolve(process.cwd(), process.env.UPLOADS_DIR || 'uploads');
const reviewerRoles = ['coordenacao', 'admin'];
const allowedDocumentStatuses = ['Aprovado', 'Reprovado', 'Erro', 'Em analise', 'Pendente', 'Enviado'];

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const safeFileName = (file) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const baseName = path
    .basename(file.originalname || 'arquivo', extension)
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName || 'arquivo'}${extension}`;
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, callback) => callback(null, safeFileName(file)),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const receiveDocument = (req, res, next) => {
  upload.single('arquivo')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const message = error.code === 'LIMIT_FILE_SIZE' ? 'Arquivo maior que 10MB.' : 'Erro ao receber arquivo.';
      return res.status(400).json({ erro: message });
    }

    return res.status(400).json({ erro: error.message || 'Erro ao receber arquivo.' });
  });
};

const authorizeStageAccess = async (req, res, next) => {
  const estagioId = Number(req.params.estagioId);

  if (!Number.isInteger(estagioId) || estagioId <= 0) {
    return res.status(404).json({ erro: 'Estagio nao encontrado.' });
  }

  try {
    const result = await db.query(
      `SELECT id, aluno_id, vaga_titulo, empresa_nome, supervisor, status, data_inicio, data_fim,
              aluno_trabalhador_status, aluno_trabalhador_observacao,
              aluno_trabalhador_atualizado_em, aluno_trabalhador_avaliado_por
       FROM estagios
       WHERE id = $1`,
      [estagioId]
    );
    const stage = result.rows[0];

    if (!stage) {
      return res.status(404).json({ erro: 'Estagio nao encontrado.' });
    }

    if (!reviewerRoles.includes(req.user.tipo) && Number(stage.aluno_id) !== Number(req.user.id)) {
      return res.status(403).json({ erro: 'Este estagio nao pertence ao aluno autenticado.' });
    }

    req.stage = stage;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel verificar o estagio.' });
  }
};

const canReviewWorkerStudent = (user) => reviewerRoles.includes(user?.tipo);
const canReviewDocuments = (user) => reviewerRoles.includes(user?.tipo);

router.get('/', async (req, res) => {
  const isReviewer = reviewerRoles.includes(req.user.tipo);

  try {
    const result = await db.query(
      `SELECT id, aluno_id, vaga_titulo, empresa_nome, supervisor, status, data_inicio, data_fim,
              aluno_trabalhador_status, aluno_trabalhador_observacao,
              aluno_trabalhador_atualizado_em, aluno_trabalhador_avaliado_por
       FROM estagios
       WHERE ($1::boolean OR aluno_id = $2)
       ORDER BY data_fim ASC NULLS LAST, id`,
      [isReviewer, req.user.id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar os estagios.' });
  }
});

router.get('/prazos', async (req, res) => {
  const isReviewer = reviewerRoles.includes(req.user.tipo);

  try {
    const result = await db.query(
      `SELECT e.id, e.vaga_titulo, e.data_fim,
              CASE WHEN e.data_fim IS NULL THEN NULL
                   ELSE e.data_fim - CURRENT_DATE END AS dias_restantes,
              COUNT(d.id) FILTER (WHERE d.status <> 'Aprovado')::integer AS docs_pendentes
       FROM estagios e
       LEFT JOIN documentos d ON d.estagio_id = e.id
       WHERE ($1::boolean OR e.aluno_id = $2)
       GROUP BY e.id
       ORDER BY e.data_fim ASC NULLS LAST, e.id`,
      [isReviewer, req.user.id]
    );

    return res.json({
      vencimentos_proximos: result.rows
        .filter((stage) => stage.data_fim)
        .map(({ id, vaga_titulo, data_fim, dias_restantes }) => ({ id, vaga_titulo, data_fim, dias_restantes })),
      documentos_pendentes_ha_muito: result.rows.map(({ id, docs_pendentes }) => ({
        estagio_id: id,
        docs_pendentes,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar prazos.' });
  }
});

router.get('/:estagioId/documentos', authorizeStageAccess, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, estagio_id, tipo, status, nome_arquivo, caminho, observacao, avaliado_em, avaliado_por, enviado_em
       FROM documentos
       WHERE estagio_id = $1
       ORDER BY enviado_em DESC`,
      [req.stage.id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar os documentos.' });
  }
});

router.patch('/:estagioId/periodo', authorizeStageAccess, async (req, res) => {
  if (!reviewerRoles.includes(req.user.tipo)) {
    return res.status(403).json({ erro: 'Apenas a coordenacao pode atualizar o periodo do estagio.' });
  }

  const dateValue = (value) => {
    if (value === null || value === '') return { valid: true, value: null };
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return { valid: false, value: null };
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return {
      valid: !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value,
      value,
    };
  };
  const inicio = dateValue(req.body.data_inicio);
  const fim = dateValue(req.body.data_fim);

  if (!Object.prototype.hasOwnProperty.call(req.body, 'data_inicio') ||
      !Object.prototype.hasOwnProperty.call(req.body, 'data_fim') ||
      !inicio.valid || !fim.valid) {
    return res.status(400).json({ erro: 'Informe datas validas de inicio e termino.' });
  }

  if (inicio.value && fim.value && fim.value < inicio.value) {
    return res.status(400).json({ erro: 'A data final nao pode ser anterior a data inicial.' });
  }

  try {
    const result = await db.query(
      `UPDATE estagios
       SET data_inicio = $1, data_fim = $2
       WHERE id = $3
       RETURNING id, aluno_id, vaga_titulo, empresa_nome, supervisor, status, data_inicio, data_fim,
                 aluno_trabalhador_status, aluno_trabalhador_observacao,
                 aluno_trabalhador_atualizado_em, aluno_trabalhador_avaliado_por`,
      [inicio.value, fim.value, req.stage.id]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel atualizar o periodo do estagio.' });
  }
});

router.patch('/:estagioId/documentos/:documentoId', authorizeStageAccess, async (req, res) => {
  if (!canReviewDocuments(req.user)) {
    return res.status(403).json({ erro: 'Apenas a coordenacao pode avaliar documentos.' });
  }

  const documentoId = Number(req.params.documentoId);
  const status = String(req.body.status || '').trim();
  const observacao = String(req.body.observacao || '').trim();

  if (!Number.isInteger(documentoId) || documentoId <= 0) {
    return res.status(400).json({ erro: 'Documento invalido.' });
  }

  if (!allowedDocumentStatuses.includes(status)) {
    return res.status(400).json({ erro: 'Status de documento invalido.' });
  }

  try {
    const result = await db.query(
      `UPDATE documentos
       SET status = $1, observacao = $2, avaliado_em = NOW(), avaliado_por = $3
       WHERE id = $4 AND estagio_id = $5
       RETURNING id, estagio_id, tipo, status, nome_arquivo, observacao, avaliado_em, avaliado_por, enviado_em`,
      [status, observacao, req.user.id, documentoId, req.stage.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Documento nao encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel avaliar o documento.' });
  }
});

router.patch('/:estagioId/aluno-trabalhador', authorizeStageAccess, async (req, res) => {
  if (!canReviewWorkerStudent(req.user)) {
    return res.status(403).json({ erro: 'Apenas a coordenacao pode avaliar aluno trabalhador.' });
  }

  const status = String(req.body.status || '').trim().toLowerCase();
  const observacao = String(req.body.observacao || '').trim();
  const allowedStatus = ['pendente', 'aceito', 'negado'];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ erro: 'Status de aluno trabalhador invalido.' });
  }

  try {
    const result = await db.query(
      `UPDATE estagios
       SET aluno_trabalhador_status = $1, aluno_trabalhador_observacao = $2,
           aluno_trabalhador_atualizado_em = NOW(), aluno_trabalhador_avaliado_por = $3
       WHERE id = $4
       RETURNING id, aluno_id, aluno_trabalhador_status, aluno_trabalhador_observacao,
                 aluno_trabalhador_atualizado_em, aluno_trabalhador_avaliado_por`,
      [status, observacao, req.user.id, req.stage.id]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel avaliar aluno trabalhador.' });
  }
});

router.post('/:estagioId/documentos', authorizeStageAccess, receiveDocument, async (req, res) => {
  const tipo = String(req.body.tipo || '').trim();
  const file = req.file;

  if (!file || !tipo) {
    if (file) {
      fs.unlink(file.path, (error) => {
        if (error) console.error('Nao foi possivel remover o arquivo sem tipo:', error);
      });
    }
    return res.status(400).json({ erro: 'Arquivo e tipo sao obrigatorios.' });
  }

  const filePath = path.relative(process.cwd(), file.path);
  const arquivoUrl = `/uploads/${path.basename(file.path)}`;

  try {
    const result = await db.query(
      `INSERT INTO documentos (estagio_id, tipo, status, nome_arquivo, caminho)
       VALUES ($1, $2, 'Enviado', $3, $4)
       RETURNING id, estagio_id, tipo, status, nome_arquivo, caminho, enviado_em`,
      [req.stage.id, tipo, file.originalname, filePath]
    );

    return res.status(201).json({
      mensagem: 'Documento enviado com sucesso.',
      documento: {
        ...result.rows[0],
        arquivo_url: arquivoUrl,
        tamanho: file.size,
        mime_type: file.mimetype,
      },
    });
  } catch (error) {
    console.error(error);
    fs.unlink(file.path, (unlinkError) => {
      if (unlinkError) console.error('Nao foi possivel remover o upload sem registro:', unlinkError);
    });
    return res.status(500).json({ erro: 'Nao foi possivel salvar o documento.' });
  }
});

module.exports = router;
