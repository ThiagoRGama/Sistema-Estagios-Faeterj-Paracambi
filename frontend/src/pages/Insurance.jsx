import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const insuranceRows = [
  {
    aluno: 'Vitor',
    email: 'vitor@faeterj.br',
    apolice: 'STG-2026/1048',
    seguradora: 'Mapfre Seguros',
    status: 'Vigente',
    vigencia: '01/08/2026 a 31/07/2027',
    observacao: 'Cobertura ativa e documentação validada.',
  },
  {
    aluno: 'Isabella',
    email: 'isabella@faeterj.br',
    apolice: 'STG-2026/1091',
    seguradora: 'Porto Seguro',
    status: 'Aguardando envio',
    vigencia: '15/09/2026 a 14/09/2027',
    observacao: 'Falta envio de comprovante de matrícula.',
  },
  {
    aluno: 'Jonathan',
    email: 'jonathan@faeterj.br',
    apolice: 'STG-2026/1120',
    seguradora: 'SulAmérica',
    status: 'Em revisão',
    vigencia: '05/07/2026 a 04/07/2027',
    observacao: 'Dados do estágio em análise pela coordenação.',
  },
  {
    aluno: 'Carlos Davi',
    email: 'carlos.davi@faeterj.br',
    apolice: 'STG-2026/1186',
    seguradora: 'Bradesco Seguros',
    status: 'Vigente',
    vigencia: '20/06/2026 a 19/06/2027',
    observacao: 'Apólice aceita com cobertura completa.',
  },
  {
    aluno: 'João Victor',
    email: 'joao.victor@faeterj.br',
    apolice: 'STG-2026/1245',
    seguradora: 'Porto Seguro',
    status: 'Aguardando envio',
    vigencia: '01/09/2026 a 31/08/2027',
    observacao: 'Encaminhar comprovante de matrícula para concluir o processo.',
  },
];

const coverageChecklist = [
  'Cobertura de acidentes pessoais durante o estágio.',
  'Assistência emergencial com atendimento 24h.',
  'Documentação de apólice com validade confirmada.',
  'Atualização do endereço do estágio em análise.',
];

const statusCards = [
  { label: 'Alunos com seguro ativo', value: '48', tone: 'bg-emerald-50 text-emerald-700' },
  { label: 'Pendências', value: '06', tone: 'bg-amber-50 text-amber-700' },
  { label: 'Vigência próxima', value: '12', tone: 'bg-sky-50 text-sky-700' },
  { label: 'Cobertura total', value: '96%', tone: 'bg-violet-50 text-violet-700' },
];

const Insurance = () => {
  const { user } = useAuth();

  const visibleInsuranceRows = user?.tipo === 'aluno'
    ? insuranceRows.filter((item) => item.email.toLowerCase() === (user.email || '').toLowerCase())
    : insuranceRows;

  const summaryTitle = user?.tipo === 'aluno'
    ? 'Seu seguro de estágio'
    : 'Controle do seguro do aluno';

  const alertMessage = user?.tipo === 'aluno' && !visibleInsuranceRows.length
    ? 'Nenhum seguro foi encontrado para o seu perfil.'
    : 'Visão geral fictícia do acompanhamento das apólices e status dos seguros para alunos em estágio.';

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Segurança e apólices</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">{summaryTitle}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {alertMessage}
                </p>
              </div>
              <span className="w-fit rounded-sm bg-emerald-600 px-4 py-2 text-xs font-black uppercase text-white">
                Vigência em dia
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            {statusCards.map((card) => (
              <article key={card.label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`inline-flex rounded-md px-2 py-1 text-xs font-black uppercase ${card.tone}`}>
                  {card.label}
                </div>
                <p className="mt-4 text-3xl font-black text-slate-900">{card.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-slate-900">Acompanhamento por aluno</p>
                <button type="button" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-black uppercase text-slate-700">
                  Exportar relatório
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 pr-4 font-black uppercase">Aluno</th>
                      <th className="pb-3 pr-4 font-black uppercase">Apólice</th>
                      <th className="pb-3 pr-4 font-black uppercase">Status</th>
                      <th className="pb-3 pr-4 font-black uppercase">Vigência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleInsuranceRows.map((item) => (
                      <tr key={item.aluno} className="border-b border-slate-100 align-top">
                        <td className="py-3 pr-4 font-semibold text-slate-800">{item.aluno}</td>
                        <td className="py-3 pr-4 text-slate-600">{item.apolice}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                              item.status === 'Vigente'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'Aguardando envio'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-sky-100 text-sky-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{item.vigencia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black text-slate-900">Resumo da cobertura</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {coverageChecklist.map((item) => (
                    <div key={item} className="flex gap-3">
                      <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-brand-700" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Insurance;
