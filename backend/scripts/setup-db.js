const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/db');
const demoData = require('../src/demoData');
const { faqs } = demoData;

const initializeDatabase = async () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET precisa estar configurado em producao.');
  }

  const schemaPath = path.resolve(__dirname, '../schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await db.query(schema);

  const divestResult = await db.query('SELECT 1 FROM divest_info WHERE id = 1');
  if (divestResult.rows.length === 0) {
    await db.query(
      `INSERT INTO divest_info (id, nome, email, telefone, atendimento, redes_sociais)
       VALUES (1, $1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [
        demoData.divest.nome,
        demoData.divest.email,
        demoData.divest.telefone,
        demoData.divest.atendimento,
        JSON.stringify(demoData.divest.redesSociais),
      ]
    );
  }

  const companiesResult = await db.query(
    'SELECT EXISTS (SELECT 1 FROM empresas_conveniadas) AS has_companies'
  );
  if (!companiesResult.rows[0].has_companies) {
    for (const company of demoData.partnerCompanies) {
      await db.query(
        `INSERT INTO empresas_conveniadas (nome, area, cidade, contato, telefone, status, vagas)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          company.nome,
          company.area,
          company.cidade,
          company.contato,
          company.telefone,
          company.status,
          company.vagas,
        ]
      );
    }
  }

  const vacanciesResult = await db.query(
    'SELECT EXISTS (SELECT 1 FROM vagas) AS has_vacancies'
  );
  if (!vacanciesResult.rows[0].has_vacancies) {
    for (const vacancy of demoData.vacancies) {
      await db.query(
        `INSERT INTO vagas (
           titulo, empresa_nome, descricao, requisitos, curso_alvo, carga_horaria,
           modalidade, local, bolsa, data_limite, status, publicado_em
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          vacancy.titulo,
          vacancy.empresa_nome,
          vacancy.descricao,
          vacancy.requisitos,
          vacancy.curso_alvo,
          vacancy.carga_horaria,
          vacancy.modalidade,
          vacancy.local,
          vacancy.bolsa,
          vacancy.data_limite,
          vacancy.status,
          vacancy.publicado_em,
        ]
      );
    }
  }

  for (const faq of faqs) {
    await db.query(
      `INSERT INTO faqs (pergunta, resposta)
       SELECT $1, $2
       WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE pergunta = $1)`,
      [faq.pergunta, faq.resposta]
    );
  }

  const adminEmail = String(process.env.INITIAL_ADMIN_EMAIL || '').trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || '';

  if (Boolean(adminEmail) !== Boolean(adminPassword)) {
    throw new Error('Configure INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD juntos.');
  }

  if (!adminEmail) {
    return;
  }

  if (adminPassword.length < 12) {
    throw new Error('INITIAL_ADMIN_PASSWORD precisa ter pelo menos 12 caracteres.');
  }

  const existingAdmin = await db.query(
    "SELECT id FROM usuarios WHERE tipo = 'admin' LIMIT 1"
  );
  if (existingAdmin.rows.length > 0) {
    return;
  }

  const passwordHash = bcrypt.hashSync(adminPassword, 12);
  const createdAdmin = await db.query(
    `INSERT INTO usuarios (nome, email, senha_hash, tipo)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    ['Administrador inicial', adminEmail, passwordHash]
  );

  if (createdAdmin.rows.length === 0) {
    throw new Error('O email inicial ja existe sem perfil de administrador.');
  }

  console.log('Conta inicial de administrador configurada.');
};

initializeDatabase()
  .catch((error) => {
    console.error('Falha ao preparar o banco de dados:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
