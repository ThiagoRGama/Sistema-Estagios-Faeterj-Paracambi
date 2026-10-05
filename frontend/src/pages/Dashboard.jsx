import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar, { NavIcon } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { coordinationQueue, internship } from '../data/mockData';

const ModuleCard = ({ title, subtitle, to, icon }) => (
  <Link
    to={to}
    className="group flex min-h-40 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-xl hover:shadow-slate-200/70"
  >
    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-800 ring-1 ring-brand-100 transition group-hover:bg-brand-800 group-hover:text-white">
      <NavIcon name={icon} className="h-6 w-6" />
    </span>
    <div>
      <p className="mt-4 text-base font-black text-slate-900">{title}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
    </div>
  </Link>
);

const StudentDashboard = () => {
  const [summary, setSummary] = useState({
    pending: 0,
    unreadNotifications: 0,
    unreadMessages: 0,
    availableVacancies: 0,
    deadlines: [],
  });
  const [stage, setStage] = useState(internship);

  useEffect(() => {
    const load = async () => {
      try {
        const [stagesRes, deadlinesRes, notificationsRes, messagesRes, vacanciesRes] = await Promise.all([
          api.get('/estagios'),
          api.get('/estagios/prazos'),
          api.get('/notificacoes/nao-lidas'),
          api.get('/mensagens/nao-lidas'),
          api.get('/vagas?status=Aberta'),
        ]);

        const firstStage = stagesRes.data[0];
        if (firstStage) {
          setStage({
            vaga: firstStage.vaga_titulo,
            empresa: firstStage.empresa_nome,
            status: firstStage.status,
            inicio: firstStage.data_inicio ? new Date(firstStage.data_inicio).toLocaleDateString('pt-BR') : internship.inicio,
            fim: firstStage.data_fim ? new Date(firstStage.data_fim).toLocaleDateString('pt-BR') : internship.fim,
            progresso: internship.progresso,
          });
        }

        setSummary({
          pending: deadlinesRes.data.documentos_pendentes_ha_muito?.[0]?.docs_pendentes || 0,
          unreadNotifications: notificationsRes.data.length || 0,
          unreadMessages: messagesRes.data.total || 0,
          availableVacancies: vacanciesRes.data.length || 0,
          deadlines: deadlinesRes.data.vencimentos_proximos || [],
        });
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
          <span className="text-sm font-black text-brand-700">F</span>
        </div>
        <h1 className="mt-3 text-2xl font-black text-slate-900">Painel do Aluno</h1>
        <p className="text-sm text-slate-500">Acompanhe documentos, avisos e contato com a coordenacao.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ModuleCard title="Documentos" subtitle={`${summary.pending} pendencia(s)`} to="/documents" icon="file" />
        <ModuleCard title="Relatorios" subtitle="Parcial e final" to="/upload" icon="upload" />
        <ModuleCard title="Dados" subtitle="Meu perfil" to="/profile" icon="profile" />
        <ModuleCard title="Seguro" subtitle="Minha apolice" to="/student-insurance" icon="lock" />
        <ModuleCard title="Vagas" subtitle={`${summary.availableVacancies} aberta(s)`} to="/vacancies" icon="briefcase" />
        <ModuleCard title="Avisos" subtitle={`${summary.unreadNotifications} novo(s)`} to="/notifications" icon="bell" />
        <ModuleCard title="Chat" subtitle={`${summary.unreadMessages} mensagem(ns)`} to="/messages" icon="chat" />
        <ModuleCard title="Empresas" subtitle="Convenios DIVEST" to="/companies" icon="building" />
        <ModuleCard title="FAQ" subtitle="Perguntas frequentes" to="/faq" icon="help" />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Estagio atual</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">{stage.vaga}</h2>
            <p className="text-sm text-slate-600">{stage.empresa}</p>
          </div>
          <span className="w-fit rounded-sm bg-emerald-600 px-4 py-1 text-xs font-black uppercase text-white">
            {stage.status}
          </span>
        </div>
        <div className="mt-5 h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-brand-700" style={{ width: `${stage.progresso}%` }} />
        </div>
        <div className="mt-3 flex justify-between text-xs font-semibold text-slate-500">
          <span>{stage.inicio}</span>
          <span>{stage.fim}</span>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-500">Proxima acao</p>
          <h2 className="mt-1 text-lg font-black text-slate-900">Reenviar termo de compromisso</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A coordenacao apontou falta de assinatura. Corrija o arquivo e envie novamente pela area de envio.
          </p>
          <Link to="/upload" className="mt-4 inline-flex rounded-md bg-brand-800 px-4 py-2 text-sm font-black text-white">
            Corrigir envio
          </Link>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-500">Supervisao</p>
          <h2 className="mt-1 text-lg font-black text-slate-900">Reuniao para duvidas</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use o chat para confirmar horario com a coordenacao e registrar duvidas sobre relatorio ou convenio.
          </p>
          <Link to="/messages" className="mt-4 inline-flex rounded-md border border-brand-800 px-4 py-2 text-sm font-black text-brand-800">
            Falar com coordenacao
          </Link>
        </div>
      </section>
    </div>
  );
};

const CoordinationDashboard = () => {
  const [summary, setSummary] = useState({ stages: 0, notifications: 0, messages: 0, vacancies: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [stagesRes, notificationsRes, messagesRes, vacanciesRes] = await Promise.all([
          api.get('/estagios'),
          api.get('/notificacoes/enviadas'),
          api.get('/mensagens/nao-lidas'),
          api.get('/vagas?status=Aberta'),
        ]);

        setSummary({
          stages: stagesRes.data.length || 0,
          notifications: notificationsRes.data.length || 0,
          messages: messagesRes.data.total || 0,
          vacancies: vacanciesRes.data.length || 0,
        });
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
          <span className="text-sm font-black text-brand-700">F</span>
        </div>
        <h1 className="mt-3 text-2xl font-black text-slate-900">Painel da Coordenacao</h1>
        <p className="text-sm text-slate-500">Analise alunos, documentos e comunicacoes de estagio.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ModuleCard title="Alunos" subtitle={`${summary.stages} em acompanhamento`} to="/profile" icon="users" />
        <ModuleCard title="Documentos" subtitle="Fila de analise" to="/documents" icon="file" />
        <ModuleCard title="Modelos" subtitle="Convenio e relatorios" to="/upload" icon="upload" />
        <ModuleCard title="Seguro" subtitle="Controle dos alunos" to="/insurance" icon="lock" />
        <ModuleCard title="Vagas" subtitle={`${summary.vacancies} aberta(s)`} to="/vacancies" icon="briefcase" />
        <ModuleCard title="Avisos" subtitle={`${summary.notifications} enviado(s)`} to="/notifications" icon="bell" />
        <ModuleCard title="Chat" subtitle={`${summary.messages} mensagem(ns)`} to="/messages" icon="chat" />
        <ModuleCard title="Senhas" subtitle="Redefinicao segura" to="/security" icon="lock" />
        <ModuleCard title="Empresas" subtitle="Convenios DIVEST" to="/companies" icon="building" />
        <ModuleCard title="FAQ" subtitle="Perguntas frequentes" to="/faq" icon="help" />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Fila da coordenacao</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Pendencias recentes</h2>
          </div>
          <Link to="/documents" className="text-sm font-black text-brand-700 hover:text-brand-900">
            Ver fila
          </Link>
        </div>
        <div className="mt-5 divide-y divide-slate-100">
          {coordinationQueue.map((item) => (
            <div key={item.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
              <div>
                <p className="font-black text-slate-900">{item.aluno}</p>
                <p className="text-sm text-slate-500">{item.documento}</p>
              </div>
              <p className="text-sm font-semibold text-slate-600">{item.status}</p>
              <span className="w-fit rounded-sm border border-slate-300 px-3 py-1 text-xs font-black uppercase">
                Analisar
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-500">Documentos com erro</p>
          <p className="mt-2 text-3xl font-black text-brand-800">{summary.notifications}</p>
          <p className="mt-1 text-sm text-slate-500">Notificar aluno para reenvio.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-500">Aluno trabalhador</p>
          <p className="mt-2 text-3xl font-black text-brand-800">1</p>
          <p className="mt-1 text-sm text-slate-500">Carteira aguardando decisao.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-500">Reunioes</p>
          <p className="mt-2 text-3xl font-black text-brand-800">2</p>
          <p className="mt-1 text-sm text-slate-500">Solicitacoes de supervisao.</p>
        </div>
      </section>
    </div>
  );
};

const AdminDashboard = () => {
  const [summary, setSummary] = useState({ users: 0, students: 0, coordination: 0, vacancies: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, vacanciesRes] = await Promise.all([api.get('/usuarios'), api.get('/vagas')]);
        const users = usersRes.data || [];

        setSummary({
          users: users.length,
          students: users.filter((item) => item.tipo === 'aluno').length,
          coordination: users.filter((item) => item.tipo === 'coordenacao').length,
          vacancies: (vacanciesRes.data || []).filter((item) => item.status === 'Aberta').length,
        });
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
          <span className="text-sm font-black text-brand-700">F</span>
        </div>
        <h1 className="mt-3 text-2xl font-black text-slate-900">Painel do Admin</h1>
        <p className="text-sm text-slate-500">Gerencie acessos e acompanhe as vagas publicadas pela coordenacao.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ModuleCard title="Usuarios" subtitle={`${summary.users} cadastrado(s)`} to="/admin/users" icon="users" />
        <ModuleCard title="Senhas" subtitle="Controle de acesso" to="/security" icon="lock" />
        <ModuleCard title="Seguro" subtitle="Controle dos alunos" to="/insurance" icon="lock" />
        <ModuleCard title="Vagas" subtitle={`${summary.vacancies} aberta(s)`} to="/vacancies" icon="briefcase" />
        <ModuleCard title="Empresas" subtitle="Convenios DIVEST" to="/companies" icon="building" />
        <ModuleCard title="FAQ" subtitle="Base de duvidas" to="/faq" icon="help" />
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-500">Alunos</p>
          <p className="mt-2 text-3xl font-black text-brand-800">{summary.students}</p>
          <p className="mt-1 text-sm text-slate-500">Perfis com acesso de estudante.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-500">Coordenacao</p>
          <p className="mt-2 text-3xl font-black text-brand-800">{summary.coordination}</p>
          <p className="mt-1 text-sm text-slate-500">Perfis autorizados a publicar vagas.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-500">Vagas abertas</p>
          <p className="mt-2 text-3xl font-black text-brand-800">{summary.vacancies}</p>
          <p className="mt-1 text-sm text-slate-500">Oportunidades visiveis aos alunos.</p>
        </div>
      </section>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        {user?.tipo === 'admin' ? (
          <AdminDashboard />
        ) : user?.tipo === 'coordenacao' ? (
          <CoordinationDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
