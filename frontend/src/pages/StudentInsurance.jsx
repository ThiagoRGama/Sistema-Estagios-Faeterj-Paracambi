import React, { useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const studentInsuranceMap = [
  {
    aluno: 'Vitor',
    email: 'vitor@faeterj.br',
    apolice: 'STG-2026/1048',
    seguradora: 'Mapfre Seguros',
    status: 'Vigente',
    vigencia: '01/08/2026 a 31/07/2027',
    cobertura: 'Cobertura de acidentes pessoais, assistência emergencial e auxílio documental.',
    observacao: 'Documentação validada e seguro ativo durante todo o período do estágio.',
  },
  {
    aluno: 'Isabella',
    email: 'isabella@faeterj.br',
    apolice: 'STG-2026/1091',
    seguradora: 'Porto Seguro',
    status: 'Aguardando envio',
    vigencia: '15/09/2026 a 14/09/2027',
    cobertura: 'Cobertura parcial com necessidade de confirmação de matrícula.',
    observacao: 'Falta envio de comprovante de matrícula.',
  },
  {
    aluno: 'Jonathan',
    email: 'jonathan@faeterj.br',
    apolice: 'STG-2026/1120',
    seguradora: 'SulAmérica',
    status: 'Em revisão',
    vigencia: '05/07/2026 a 04/07/2027',
    cobertura: 'Cobertura ativa, aguardando validação da documentação do estágio.',
    observacao: 'Dados do estágio em análise pela coordenação.',
  },
  {
    aluno: 'Carlos Davi',
    email: 'carlos.davi@faeterj.br',
    apolice: 'STG-2026/1186',
    seguradora: 'Bradesco Seguros',
    status: 'Vigente',
    vigencia: '20/06/2026 a 19/06/2027',
    cobertura: 'Cobertura completa com atendimento 24 horas e apólice ativa.',
    observacao: 'Apólice aceita com cobertura completa e documentação regularizada.',
  },
  {
    aluno: 'João Victor',
    email: 'joao.victor@faeterj.br',
    apolice: 'STG-2026/1245',
    seguradora: 'Porto Seguro',
    status: 'Aguardando envio',
    vigencia: '01/09/2026 a 31/08/2027',
    cobertura: 'Cobertura ativa após envio do comprovante da matrícula.',
    observacao: 'Encaminhar comprovante de matrícula para concluir o processo.',
  },
];

const StudentInsurance = () => {
  const { user } = useAuth();

  const insurance = useMemo(() => {
    const matched = studentInsuranceMap.find((item) => item.email.toLowerCase() === (user?.email || '').toLowerCase());
    return matched || null;
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-5xl rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500">Meu seguro</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">Seguro do aluno</h1>
            </div>
            <span className="w-fit rounded-sm bg-emerald-600 px-4 py-1 text-xs font-black uppercase text-white">
              {insurance?.status || 'Não cadastrado'}
            </span>
          </div>

          {!insurance ? (
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              Nenhum seguro foi encontrado para o seu perfil de aluno.
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-md border border-brand-100 bg-brand-50 p-4">
                <p className="text-xs font-black uppercase text-brand-700">Dados do seguro</p>
                <h2 className="mt-2 text-xl font-black text-slate-900">{insurance.seguradora}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{insurance.cobertura}</p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Aluno</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{insurance.aluno}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Apólice</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{insurance.apolice}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Vigência</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{insurance.vigencia}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Observação</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{insurance.observacao}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentInsurance;
