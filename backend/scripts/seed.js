const bcrypt = require('bcryptjs');
const db = require('../src/db');
const seedData = require('../src/demoData');

const insertRows = async (sql, rows, parameters) => {
  for (const row of rows) {
    await db.query(sql, parameters(row));
  }
};

const run = async () => {
  try {
    await db.query(
      `TRUNCATE TABLE mensagens, notificacoes, documentos, estagios, vagas, seguros,
       empresas_conveniadas, divest_info, faqs, modelos_documentos, usuarios
       RESTART IDENTITY CASCADE`
    );

    await insertRows(
      `INSERT INTO usuarios (id, nome, email, senha_hash, tipo, matricula, curso, semestre, telefone, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      seedData.users,
      (user) => [
        user.id,
        user.nome,
        user.email,
        bcrypt.hashSync(user.senha, 10),
        user.tipo,
        user.matricula,
        user.curso,
        user.semestre,
        user.telefone,
        user.criado_em,
      ]
    );

    await insertRows(
      `INSERT INTO estagios (
         id, aluno_id, vaga_titulo, empresa_nome, supervisor, status, data_inicio, data_fim,
         aluno_trabalhador_status, aluno_trabalhador_observacao
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      seedData.stages,
      (stage) => [
        stage.id,
        stage.aluno_id,
        stage.vaga_titulo,
        stage.empresa_nome,
        stage.supervisor || null,
        stage.status,
        stage.data_inicio,
        stage.data_fim,
        stage.aluno_trabalhador_status || 'pendente',
        stage.aluno_trabalhador_observacao || '',
      ]
    );

    await insertRows(
      `INSERT INTO documentos (
         id, estagio_id, tipo, status, nome_arquivo, caminho, observacao, enviado_em
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      seedData.documents,
      (document) => [
        document.id,
        document.estagio_id,
        document.tipo,
        document.status,
        document.nome_arquivo,
        document.caminho || 'n/a',
        document.observacao || null,
        document.enviado_em,
      ]
    );

    await insertRows(
      `INSERT INTO notificacoes (id, usuario_id, titulo, mensagem, lida, criado_por, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      seedData.notifications,
      (notification) => [
        notification.id,
        notification.usuario_id,
        notification.titulo,
        notification.mensagem,
        notification.lida,
        notification.criado_por || null,
        notification.criado_em,
      ]
    );

    await insertRows(
      `INSERT INTO mensagens (id, remetente_id, destinatario_id, estagio_id, conteudo, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      seedData.messages,
      (message) => [
        message.id,
        message.remetente_id,
        message.destinatario_id,
        message.estagio_id || null,
        message.conteudo,
        message.criado_em,
      ]
    );

    await insertRows(
      `INSERT INTO seguros (
         id, usuario_id, seguradora, apolice, cobertura, status, vigencia_inicio, vigencia_fim, observacao
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      seedData.insurances,
      (insurance) => [
        insurance.id,
        insurance.usuario_id,
        insurance.seguradora,
        insurance.apolice,
        insurance.cobertura,
        insurance.status,
        insurance.vigencia_inicio,
        insurance.vigencia_fim,
        insurance.observacao,
      ]
    );

    await db.query(
      `INSERT INTO divest_info (id, nome, email, telefone, atendimento, redes_sociais)
       VALUES (1, $1, $2, $3, $4, $5::jsonb)`,
      [
        seedData.divest.nome,
        seedData.divest.email,
        seedData.divest.telefone,
        seedData.divest.atendimento,
        JSON.stringify(seedData.divest.redesSociais),
      ]
    );

    await insertRows(
      `INSERT INTO empresas_conveniadas (id, nome, area, cidade, contato, telefone, status, vagas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      seedData.partnerCompanies,
      (company) => [
        company.id,
        company.nome,
        company.area,
        company.cidade,
        company.contato,
        company.telefone,
        company.status,
        company.vagas,
      ]
    );

    await insertRows(
      'INSERT INTO faqs (id, pergunta, resposta) VALUES ($1, $2, $3)',
      seedData.faqs,
      (faq) => [faq.id, faq.pergunta, faq.resposta]
    );

    await insertRows(
      `INSERT INTO modelos_documentos (id, titulo, descricao, categoria, publico, campos, conteudo)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)`,
      seedData.documentTemplates,
      (template) => [
        template.id,
        template.titulo,
        template.descricao,
        template.categoria,
        JSON.stringify(template.publico),
        JSON.stringify(template.campos),
        template.conteudo,
      ]
    );

    await insertRows(
      `INSERT INTO vagas (
         id, titulo, empresa_nome, descricao, requisitos, curso_alvo, carga_horaria,
         modalidade, local, bolsa, data_limite, status, publicado_por, publicado_em
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      seedData.vacancies,
      (vacancy) => [
        vacancy.id,
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
        vacancy.publicado_por,
        vacancy.publicado_em,
      ]
    );

    await db.query(
      `SELECT setval(pg_get_serial_sequence('usuarios', 'id'), (SELECT MAX(id) FROM usuarios), true),
              setval(pg_get_serial_sequence('estagios', 'id'), (SELECT MAX(id) FROM estagios), true),
              setval(pg_get_serial_sequence('documentos', 'id'), (SELECT MAX(id) FROM documentos), true),
              setval(pg_get_serial_sequence('notificacoes', 'id'), (SELECT MAX(id) FROM notificacoes), true),
              setval(pg_get_serial_sequence('mensagens', 'id'), (SELECT MAX(id) FROM mensagens), true),
              setval(pg_get_serial_sequence('seguros', 'id'), (SELECT MAX(id) FROM seguros), true),
              setval(pg_get_serial_sequence('empresas_conveniadas', 'id'), (SELECT MAX(id) FROM empresas_conveniadas), true),
              setval(pg_get_serial_sequence('faqs', 'id'), (SELECT MAX(id) FROM faqs), true),
              setval(pg_get_serial_sequence('vagas', 'id'), (SELECT MAX(id) FROM vagas), true)`
    );

    console.log('Dados de demonstracao carregados no banco de dados.');
    console.log('Aluno: vitor@faeterj.br / senha123');
    console.log('Coordenacao: gabriel@faeterj.br / senha123');
    console.log('Administrador: admin@faeterj.br / admin123');
  } catch (error) {
    console.error('Erro ao popular o banco:', error);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
};

run();
