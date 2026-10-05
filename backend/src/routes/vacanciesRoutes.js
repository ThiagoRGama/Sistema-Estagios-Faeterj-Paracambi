const express = require('express');
const db = require('../db');

const router = express.Router();
const writableRoles = ['coordenacao', 'admin'];
const statusOptions = ['Aberta', 'Pausada', 'Encerrada'];
const editableFields = [
  'titulo',
  'empresa_nome',
  'descricao',
  'requisitos',
  'curso_alvo',
  'carga_horaria',
  'modalidade',
  'local',
  'bolsa',
  'data_limite',
  'status',
];

const normalize = (value) => String(value || '').trim();

const canPublish = (req, res, next) => {
  if (!writableRoles.includes(req.user?.tipo)) {
    return res.status(403).json({ erro: 'Apenas coordenacao ou Admin podem publicar vagas.' });
  }

  return next();
};

const publicVacancy = (vacancy) => {
  const dataLimite = vacancy.data_limite instanceof Date
    ? vacancy.data_limite.toISOString().slice(0, 10)
    : String(vacancy.data_limite || '').slice(0, 10);

  return {
    ...vacancy,
    prazo_formatado: dataLimite ? new Date(`${dataLimite}T00:00:00`).toLocaleDateString('pt-BR') : null,
  };
};

router.get('/', async (req, res) => {
  const status = normalize(req.query.status);
  const curso = normalize(req.query.curso);

  try {
    const result = await db.query(
      `SELECT id, titulo, empresa_nome, descricao, requisitos, curso_alvo, carga_horaria,
              modalidade, local, bolsa, data_limite, status, publicado_por, publicado_em, atualizado_em
       FROM vagas
       WHERE ($1::text = '' OR LOWER(status) = LOWER($1))
         AND ($2::text = '' OR LOWER(curso_alvo) LIKE '%' || LOWER($2) || '%')
       ORDER BY publicado_em DESC, id DESC`,
      [status, curso]
    );
    return res.json(result.rows.map(publicVacancy));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar as vagas.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, titulo, empresa_nome, descricao, requisitos, curso_alvo, carga_horaria,
              modalidade, local, bolsa, data_limite, status, publicado_por, publicado_em, atualizado_em
       FROM vagas
       WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Vaga nao encontrada.' });
    }

    return res.json(publicVacancy(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel carregar a vaga.' });
  }
});

router.post('/', canPublish, async (req, res) => {
  const titulo = normalize(req.body.titulo);
  const empresaNome = normalize(req.body.empresa_nome);
  const descricao = normalize(req.body.descricao);
  const status = normalize(req.body.status) || 'Aberta';

  if (!titulo || !empresaNome || !descricao) {
    return res.status(400).json({ erro: 'Titulo, empresa e descricao sao obrigatorios.' });
  }

  if (!statusOptions.includes(status)) {
    return res.status(400).json({ erro: 'Status de vaga invalido.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO vagas (
         titulo, empresa_nome, descricao, requisitos, curso_alvo, carga_horaria,
         modalidade, local, bolsa, data_limite, status, publicado_por
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, titulo, empresa_nome, descricao, requisitos, curso_alvo, carga_horaria,
                 modalidade, local, bolsa, data_limite, status, publicado_por, publicado_em, atualizado_em`,
      [
        titulo,
        empresaNome,
        descricao,
        normalize(req.body.requisitos) || 'Consultar detalhes com a coordenacao.',
        normalize(req.body.curso_alvo) || 'Todos os cursos',
        normalize(req.body.carga_horaria) || 'A combinar',
        normalize(req.body.modalidade) || 'A combinar',
        normalize(req.body.local) || 'A combinar',
        normalize(req.body.bolsa) || 'A combinar',
        normalize(req.body.data_limite) || null,
        status,
        req.user.id,
      ]
    );

    return res.status(201).json(publicVacancy(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel publicar a vaga.' });
  }
});

router.patch('/:id', canPublish, async (req, res) => {
  if (
    Object.prototype.hasOwnProperty.call(req.body, 'status') &&
    !statusOptions.includes(normalize(req.body.status))
  ) {
    return res.status(400).json({ erro: 'Status de vaga invalido.' });
  }

  const updates = editableFields
    .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
    .map((field) => [field, normalize(req.body[field])])
    .filter(([, value]) => Boolean(value));

  if (!updates.length) {
    return res.status(400).json({ erro: 'Informe ao menos um campo valido para atualizar.' });
  }

  const values = updates.map(([, value]) => value || null);
  const assignments = updates.map(([field], index) => `${field} = $${index + 1}`);
  values.push(req.params.id);

  try {
    const result = await db.query(
      `UPDATE vagas
       SET ${assignments.join(', ')}, atualizado_em = NOW()
       WHERE id = $${values.length}
       RETURNING id, titulo, empresa_nome, descricao, requisitos, curso_alvo, carga_horaria,
                 modalidade, local, bolsa, data_limite, status, publicado_por, publicado_em, atualizado_em`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Vaga nao encontrada.' });
    }

    return res.json(publicVacancy(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel atualizar a vaga.' });
  }
});

router.delete('/:id', canPublish, async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM vagas
       WHERE id = $1
       RETURNING id, titulo, empresa_nome, descricao, requisitos, curso_alvo, carga_horaria,
                 modalidade, local, bolsa, data_limite, status, publicado_por, publicado_em, atualizado_em`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Vaga nao encontrada.' });
    }

    return res.json(publicVacancy(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Nao foi possivel excluir a vaga.' });
  }
});

module.exports = router;
