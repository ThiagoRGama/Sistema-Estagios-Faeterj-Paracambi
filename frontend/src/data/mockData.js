export const demoUsers = [
  {
    id: 3,
    nome: 'Admin',
    email: 'admin@faeterj.br',
    tipo: 'admin',
    matricula: null,
    curso: null,
    semestre: null,
    telefone: '(21) 2683-0002',
    criado_em: '2026-06-06T11:50:00.000Z',
  },
  {
    id: 4,
    nome: 'Vitor',
    email: 'vitor@faeterj.br',
    tipo: 'aluno',
    matricula: '2026001',
    curso: 'Sistemas de Informacao',
    semestre: '4 semestre',
    telefone: '(21) 99999-0000',
    criado_em: '2026-06-06T12:00:00.000Z',
  },
  {
    id: 5,
    nome: 'Isabella',
    email: 'isabella@faeterj.br',
    tipo: 'aluno',
    matricula: '2026002',
    curso: 'Sistemas de Informacao',
    semestre: '5 semestre',
    telefone: '(21) 98888-0202',
    criado_em: '2026-06-06T12:10:00.000Z',
  },
  {
    id: 6,
    nome: 'Jonathan',
    email: 'jonathan@faeterj.br',
    tipo: 'aluno',
    matricula: '2026003',
    curso: 'Gestao Ambiental',
    semestre: '3 semestre',
    telefone: '(21) 98888-0303',
    criado_em: '2026-06-06T12:20:00.000Z',
  },
  {
    id: 7,
    nome: 'Carlos Davi',
    email: 'carlos.davi@faeterj.br',
    tipo: 'aluno',
    matricula: '2026004',
    curso: 'Sistemas de Informacao',
    semestre: '6 semestre',
    telefone: '(21) 98888-0404',
    criado_em: '2026-06-06T12:30:00.000Z',
  },
  {
    id: 8,
    nome: 'João Victor',
    email: 'joao.victor@faeterj.br',
    tipo: 'aluno',
    matricula: '2026005',
    curso: 'Gestao Ambiental',
    semestre: '4 semestre',
    telefone: '(21) 98888-0505',
    criado_em: '2026-06-06T12:40:00.000Z',
  },
  {
    id: 9,
    nome: 'Gabriel',
    email: 'gabriel@faeterj.br',
    tipo: 'coordenacao',
    matricula: null,
    curso: null,
    semestre: null,
    telefone: '(21) 2683-0000',
    criado_em: '2026-06-06T13:00:00.000Z',
  },
  {
    id: 10,
    nome: 'Thiago',
    email: 'thiago@faeterj.br',
    tipo: 'coordenacao',
    matricula: null,
    curso: null,
    semestre: null,
    telefone: '(21) 2683-0001',
    criado_em: '2026-06-06T13:10:00.000Z',
  },
];

export const coordinators = demoUsers.filter((user) => user.tipo === 'coordenacao');
export const coordinator = coordinators[0];
export const student = {
  ...demoUsers.find((user) => user.email === 'vitor@faeterj.br'),
  periodo: '4 semestre',
  status: 'Ativo',
};

export const internship = {
  id: 1,
  aluno: student.nome,
  empresa: 'Faeterj Paracambi',
  vaga: 'Desenvolvedor Frontend',
  supervisor: 'Gabriel',
  status: 'Em andamento',
  inicio: '01/03/2026',
  fim: '30/12/2026',
  progresso: 68,
};

export const documents = [
  {
    id: 1,
    tipo: 'Termo de compromisso',
    status: 'Erro',
    enviadoEm: '05/06/2026',
    observacao: 'Assinatura do supervisor ausente. Reenvie o documento corrigido.',
  },
  {
    id: 2,
    tipo: 'Relatorio parcial',
    status: 'Pendente',
    enviadoEm: '07/06/2026',
    observacao: 'Aguardando analise da coordenacao.',
  },
  {
    id: 3,
    tipo: 'Carteira de trabalho',
    status: 'Em analise',
    enviadoEm: '08/06/2026',
    observacao: 'Validar se o cargo e correlato ao curso.',
  },
  {
    id: 4,
    tipo: 'Convenio',
    status: 'Aprovado',
    enviadoEm: '01/06/2026',
    observacao: 'Modelo aceito pela instituicao.',
  },
];

export const companyContacts = [
  { nome: 'DIVEST', email: 'divest@faeterj.br', telefone: '(21) 2683-0000' },
  { nome: 'Tech Rio Jr.', email: 'estagios.techrio@faeterj.br', telefone: '(21) 98888-1200' },
  { nome: 'Paracambi Digital', email: 'rh.paracambidigital@faeterj.br', telefone: '(21) 97777-4300' },
];

export const notifications = [
  {
    id: 1,
    titulo: 'Documento com erro',
    mensagem: 'O termo de compromisso precisa ser reenviado com assinatura do supervisor.',
    tipo: 'documento',
    lida: false,
  },
  {
    id: 2,
    titulo: 'Reuniao de supervisao',
    mensagem: 'Reuniao disponivel para tirar duvidas sobre relatorio e convenio.',
    tipo: 'reuniao',
    lida: false,
  },
  {
    id: 3,
    titulo: 'Relatorio de aluno trabalhador',
    mensagem: 'Use o modelo especifico caso o aluno ja atue na area do curso.',
    tipo: 'relatorio',
    lida: true,
  },
];

export const coordinationQueue = [
  {
    id: 1,
    aluno: 'Vitor',
    documento: 'Carteira de trabalho',
    status: 'Analise de correlacao',
    cargo: 'Assistente de desenvolvimento de sistemas',
  },
  {
    id: 2,
    aluno: 'Isabella',
    documento: 'Termo de compromisso',
    status: 'Documento com erro',
    cargo: 'Estagiaria de suporte',
  },
  {
    id: 3,
    aluno: 'Jonathan',
    documento: 'Relatorio final',
    status: 'Aguardando parecer',
    cargo: 'Desenvolvedor junior',
  },
];

export const chatMessages = [
  { id: 1, from: 'coordenacao', text: 'Ola, Vitor. Reenvie o termo com a assinatura do supervisor.' },
  { id: 2, from: 'aluno', text: 'Certo, vou corrigir e enviar hoje.' },
  { id: 3, from: 'coordenacao', text: 'Depois do reenvio, avaliamos o convenio e a carteira de trabalho.' },
];
