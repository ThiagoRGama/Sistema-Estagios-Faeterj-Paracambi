import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { NavIcon } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { notifications as fallbackNotifications } from '../data/mockData';

const emptyForm = {
  destinatario_id: 'todos',
  titulo: '',
  mensagem: '',
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '';

const NoticeCard = ({ notice, onRead, actionLoading }) => (
  <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-sm px-2.5 py-1 text-[11px] font-black uppercase ${
              notice.lida ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {notice.lida ? 'Lida' : 'Nova'}
          </span>
          {notice.criado_em && <span className="text-xs font-semibold text-slate-400">{formatDate(notice.criado_em)}</span>}
        </div>
        <h2 className="mt-3 break-words text-base font-black text-slate-900">{notice.titulo}</h2>
      </div>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800 ring-1 ring-brand-100">
        <NavIcon name="bell" className="h-5 w-5" />
      </span>
    </div>
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{notice.mensagem}</p>
    {!notice.lida && (
      <button
        type="button"
        onClick={() => onRead(notice.id)}
        disabled={actionLoading}
        className="secondary-button mt-4 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Marcar como lida
      </button>
    )}
  </article>
);

const SentNoticeCard = ({ notice }) => (
  <article className="border-b border-slate-100 py-4 last:border-b-0">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase text-brand-700">Para {notice.destinatario_nome || 'Aluno'}</p>
        <h3 className="mt-1 break-words font-black text-slate-900">{notice.titulo}</h3>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{notice.mensagem}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
        <span
          className={`rounded-sm px-2.5 py-1 text-[11px] font-black uppercase ${
            notice.lida ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {notice.lida ? 'Visualizada' : 'Nao lida'}
        </span>
        <span className="text-xs font-semibold text-slate-400">{formatDate(notice.criado_em)}</span>
      </div>
    </div>
  </article>
);

const Notifications = () => {
  const { user } = useAuth();
  const canPublish = ['coordenacao', 'admin'].includes(user?.tipo);
  const [notices, setNotices] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      if (canPublish) {
        const [notificationsResponse, studentsResponse] = await Promise.all([
          api.get('/notificacoes/enviadas'),
          api.get('/info/usuarios?tipo=aluno'),
        ]);
        setNotices(notificationsResponse.data || []);
        setStudents(studentsResponse.data || []);
      } else {
        const response = await api.get('/notificacoes');
        setNotices(response.data || []);
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Nao foi possivel carregar as notificacoes.' });
      if (!canPublish) setNotices(fallbackNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [canPublish]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const publishNotification = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const response = await api.post('/notificacoes', form);
      setNotices((current) => [...(response.data.notificacoes || []), ...current]);
      setForm(emptyForm);
      setFeedback({ type: 'success', message: response.data.mensagem || 'Notificacao publicada com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Nao foi possivel publicar a notificacao.' });
    } finally {
      setSaving(false);
    }
  };

  const markAsRead = async (id) => {
    setActionLoading(true);
    setFeedback(null);

    try {
      await api.patch(`/notificacoes/${id}/ler`);
      setNotices((current) => current.map((notice) => (notice.id === id ? { ...notice, lida: true } : notice)));
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Nao foi possivel atualizar a notificacao.' });
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setActionLoading(true);
    setFeedback(null);

    try {
      await api.patch('/notificacoes/ler-todas');
      setNotices((current) => current.map((notice) => ({ ...notice, lida: true })));
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Nao foi possivel atualizar as notificacoes.' });
    } finally {
      setActionLoading(false);
    }
  };

  const unreadCount = useMemo(() => notices.filter((notice) => !notice.lida).length, [notices]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">Central de avisos</p>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  {canPublish ? 'Notificacoes para alunos' : 'Notificacoes do aluno'}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {canPublish ? `${students.length} aluno(s) disponivel(is)` : `${unreadCount} aviso(s) novo(s)`}
                </p>
              </div>
              {!canPublish && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={!unreadCount || actionLoading}
                  className="secondary-button w-fit disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <p
              role="status"
              className={`mt-5 rounded-xl p-4 text-sm font-semibold ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {feedback.message}
            </p>
          )}

          {canPublish ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <form onSubmit={publishNotification} className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase text-brand-700">Coordenacao</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">Criar notificacao</h2>

                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Destinatario</span>
                    <select
                      value={form.destinatario_id}
                      onChange={(event) => updateForm('destinatario_id', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="todos">Todos os alunos</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.nome}{student.matricula ? ` - ${student.matricula}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Titulo</span>
                    <input
                      required
                      maxLength={120}
                      value={form.titulo}
                      onChange={(event) => updateForm('titulo', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="Titulo do aviso"
                    />
                    <span className="mt-1 block text-right text-xs font-semibold text-slate-400">{form.titulo.length}/120</span>
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Mensagem</span>
                    <textarea
                      required
                      rows={7}
                      maxLength={2000}
                      value={form.mensagem}
                      onChange={(event) => updateForm('mensagem', event.target.value)}
                      className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="Escreva a notificacao"
                    />
                    <span className="mt-1 block text-right text-xs font-semibold text-slate-400">{form.mensagem.length}/2000</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving || !students.length}
                  className="primary-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Publicando...' : 'Publicar notificacao'}
                </button>
              </form>

              <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-500">Historico</p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">Notificacoes enviadas</h2>
                  </div>
                  <span className="rounded-sm bg-brand-50 px-3 py-1 text-xs font-black text-brand-800">{notices.length}</span>
                </div>

                {loading ? (
                  <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">Carregando...</p>
                ) : notices.length ? (
                  <div className="mt-3">
                    {notices.map((notice) => (
                      <SentNoticeCard key={notice.id} notice={notice} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                    Nenhuma notificacao foi publicada.
                  </p>
                )}
              </section>
            </div>
          ) : loading ? (
            <p className="mt-6 rounded-md border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600 shadow-sm">
              Carregando notificacoes...
            </p>
          ) : notices.length ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {notices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} onRead={markAsRead} actionLoading={actionLoading} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-md border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600 shadow-sm">
              Nenhuma notificacao encontrada.
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Notifications;
