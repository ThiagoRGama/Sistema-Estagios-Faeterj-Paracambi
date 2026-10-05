const express = require('express');
const db = require('../db');
const defaultFaqs = require('../faqData');

const router = express.Router();
const insuranceStatuses = ['Pendente', 'Em analise', 'Aprovado', 'Reprovado', 'Ativo', 'Vigente', 'Aguardando envio'];
const canManageInsurance = (user) => ['coordenacao', 'admin'].includes(user?.tipo);

const loadInsurance = async (userId) => {
  const result = await db.query(
    `SELECT id, usuario_id, seguradora, apolice, cobertura, status,
            vigencia_inicio, vigencia_fim, observacao
     FROM seguros
     WHERE usuario_id = $1
     ORDER BY id DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
};

router.get('/seguro/me', async (req, res) => {
  try {
    const insurance = await loadInsurance(req.user.id);
    if (!insurance) {
      return res.status(404).json({ erro: 'Seguro nao encontrado para este usuario.' });
    }

    return res.json(insurance);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar os dados do seguro.' });
  }
});

router.get('/seguro/:usuarioId', async (req, res) => {
  if (!canManageInsurance(req.user)) {
    return res.status(403).json({ erro: 'Apenas a coordenacao pode consultar o seguro de outro usuario.' });
  }

  const userId = Number(req.params.usuarioId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ erro: 'Usuario invalido.' });
  }

  try {
    const insurance = await loadInsurance(userId);
    return res.json(insurance);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar os dados do seguro.' });
  }
});

router.put('/seguro/:usuarioId', async (req, res) => {
  if (!canManageInsurance(req.user)) {
    return res.status(403).json({ erro: 'Apenas a coordenacao pode atualizar o seguro.' });
  }

  const userId = Number(req.params.usuarioId);
  const seguradora = String(req.body.seguradora || '').trim();
  const apolice = String(req.body.apolice || '').trim();
  const cobertura = String(req.body.cobertura || '').trim();
  const status = String(req.body.status || '').trim();
  const observacao = String(req.body.observacao || '').trim();
  const vigenciaInicio = String(req.body.vigencia_inicio || '').trim() || null;
  const vigenciaFim = String(req.body.vigencia_fim || '').trim() || null;
  const validDate = (value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ erro: 'Usuario invalido.' });
  }

  if (!insuranceStatuses.includes(status)) {
    return res.status(400).json({ erro: 'Status do seguro invalido.' });
  }

  if (!validDate(vigenciaInicio) || !validDate(vigenciaFim)) {
    return res.status(400).json({ erro: 'Informe datas de vigencia validas.' });
  }

  if (vigenciaInicio && vigenciaFim && vigenciaFim < vigenciaInicio) {
    return res.status(400).json({ erro: 'O fim da vigencia nao pode ser anterior ao inicio.' });
  }

  try {
    const userResult = await db.query(
      "SELECT id FROM usuarios WHERE id = $1 AND tipo = 'aluno'",
      [userId]
    );
    if (!userResult.rows.length) {
      return res.status(404).json({ erro: 'Aluno nao encontrado.' });
    }

    const existingInsurance = await loadInsurance(userId);
    const result = existingInsurance
      ? await db.query(
          `UPDATE seguros
           SET seguradora = $1, apolice = $2, cobertura = $3, status = $4,
               vigencia_inicio = $5, vigencia_fim = $6, observacao = $7
           WHERE id = $8
           RETURNING id, usuario_id, seguradora, apolice, cobertura, status,
                     vigencia_inicio, vigencia_fim, observacao`,
          [seguradora, apolice, cobertura, status, vigenciaInicio, vigenciaFim, observacao, existingInsurance.id]
        )
      : await db.query(
          `INSERT INTO seguros (usuario_id, seguradora, apolice, cobertura, status, vigencia_inicio, vigencia_fim, observacao)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, usuario_id, seguradora, apolice, cobertura, status,
                     vigencia_inicio, vigencia_fim, observacao`,
          [userId, seguradora, apolice, cobertura, status, vigenciaInicio, vigenciaFim, observacao]
        );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel salvar os dados do seguro.' });
  }
});

router.get('/empresas', async (req, res) => {
  try {
    const [divestResult, companiesResult] = await Promise.all([
      db.query(
        `SELECT nome, email, telefone, atendimento, redes_sociais AS "redesSociais"
         FROM divest_info
         WHERE id = 1`
      ),
      db.query(
        `SELECT id, nome, area, cidade, contato, telefone, status, vagas
         FROM empresas_conveniadas
         ORDER BY nome`
      ),
    ]);

    return res.json({
      divest: divestResult.rows[0] || null,
      empresas: companiesResult.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar as empresas.' });
  }
});

router.get('/faq', async (req, res) => {
  try {
    const result = await db.query('SELECT id, pergunta, resposta FROM faqs ORDER BY id');
    return res.json(result.rows.length > 0 ? result.rows : defaultFaqs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar as perguntas frequentes.' });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, titulo, descricao, categoria, publico, campos, conteudo
       FROM modelos_documentos
       WHERE publico @> $1::jsonb OR publico @> '["todos"]'::jsonb
       ORDER BY id`,
      [JSON.stringify([req.user.tipo])]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar os modelos de documentos.' });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, titulo, descricao, categoria, publico, campos, conteudo
       FROM modelos_documentos
       WHERE id = $1 AND (publico @> $2::jsonb OR publico @> '["todos"]'::jsonb)`,
      [req.params.id, JSON.stringify([req.user.tipo])]
    );

    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Template nao encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar o modelo de documento.' });
  }
});

router.get('/usuarios', async (req, res) => {
  const allowedTypes = ['aluno', 'coordenacao'];
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
       ORDER BY u.nome, u.id`,
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
    return res.status(500).json({ erro: 'Nao foi possivel carregar os usuarios.' });
  }
});

module.exports = router;
