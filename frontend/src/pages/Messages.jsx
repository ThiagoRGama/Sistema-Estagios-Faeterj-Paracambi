import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { coordinators as demoCoordinators, student } from '../data/mockData';
import api from '../services/api';

const studentChannels = [
  {
    id: student.id,
    nome: student.nome,
    description: `Aluno de ${student.curso}`,
    estagio: { id: 1 },
  },
];

const coordinatorChannels = demoCoordinators.map((coordinator) => ({
  id: coordinator.id,
  nome: coordinator.nome,
  email: coordinator.email,
}));

const sortMessages = (items) =>
  [...items].sort((a, b) => new Date(a.criado_em || 0).getTime() - new Date(b.criado_em || 0).getTime());

const Bubble = ({ message, isMine }) => (
  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[78%] rounded-md px-4 py-3 text-sm leading-6 ${
        isMine ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {message.conteudo || message.text}
      {message.criado_em && (
        <p className={`mt-2 text-[11px] font-semibold ${isMine ? 'text-white/70' : 'text-slate-400'}`}>
          {new Date(message.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  </div>
);

const Conversation = ({ user, activeStudent, activeCoordinator }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);
  const isStudent = user?.tipo === 'aluno';
  const activeContact = isStudent ? activeCoordinator : activeStudent;
  const targetId = activeContact?.id;

  const visibleMessages = useMemo(() => {
    return messages.filter((message) => {
      const otherParticipantId = Number(message.remetente_id) === Number(user?.id)
        ? Number(message.destinatario_id)
        : Number(message.remetente_id);
      return otherParticipantId === Number(activeContact?.id);
    });
  }, [activeContact?.id, messages, user?.id]);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/mensagens');
        setMessages(sortMessages(response.data || []));
      } catch (err) {
        setError(err.message || 'Nao foi possivel carregar mensagens.');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContact?.id, visibleMessages.length]);

  useEffect(() => {
    setDraft('');
  }, [activeContact?.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = draft.trim();

    if (!content || !targetId) return;

    setSending(true);
    setError(null);

    try {
      const response = await api.post('/mensagens', {
        destinatario_id: targetId,
        estagio_id: isStudent ? null : activeStudent.estagio?.id || null,
        conteudo: content,
      });

      const createdMessage = response.data?.conteudo
        ? response.data
        : {
            id: response.data?.id || Date.now(),
            remetente_id: user.id,
            destinatario_id: targetId,
            estagio_id: isStudent ? null : activeStudent.estagio?.id || null,
            conteudo: content,
            criado_em: new Date().toISOString(),
            remetente_nome: user.nome,
            destinatario_nome: activeContact.nome,
          };

      setMessages((current) => sortMessages([...current, createdMessage]));
      setDraft('');
    } catch (err) {
      setError(err.message || 'Nao foi possivel enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  const headerTitle = activeContact
    ? `Conversa com ${activeContact.nome}`
    : 'Nenhum contato selecionado';
  const headerSubtitle = isStudent ? activeContact?.email : activeContact?.description;

  return (
    <section className="flex min-h-[560px] flex-col rounded-md border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 p-5">
        <p className="text-xs font-black uppercase text-slate-500">{isStudent ? 'Canal direto' : 'Atendimento'}</p>
        <h1 className="mt-1 text-xl font-black text-slate-900">{headerTitle}</h1>
        <p className="text-sm text-slate-500">{headerSubtitle}</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        {loading ? (
          <p className="text-sm font-semibold text-slate-600">Carregando mensagens...</p>
        ) : visibleMessages.length ? (
          visibleMessages.map((message) => {
            const mineById = message.remetente_id ? Number(message.remetente_id) === Number(user?.id) : false;
            const mineByName = message.remetente_nome && message.remetente_nome === user?.nome;

            return <Bubble key={message.id} message={message} isMine={mineById || mineByName} />;
          })
        ) : (
          <p className="text-sm font-semibold text-slate-500">
            {activeContact ? 'Nenhuma mensagem nesta conversa.' : 'Nenhum contato disponivel para conversar.'}
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form className="border-t border-slate-200 p-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Mensagem"
            className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim() || !targetId}
            className="h-10 rounded-md bg-brand-800 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </section>
  );
};

const Messages = () => {
  const { user } = useAuth();
  const isCoordination = user?.tipo === 'coordenacao';
  const [students, setStudents] = useState(studentChannels);
  const [activeStudentId, setActiveStudentId] = useState(studentChannels[0].id);
  const [coordinators, setCoordinators] = useState(coordinatorChannels);
  const [activeCoordinatorId, setActiveCoordinatorId] = useState(coordinatorChannels[0]?.id || null);
  const activeStudent = students.find((student) => student.id === activeStudentId) || students[0] || studentChannels[0];
  const activeCoordinator = coordinators.find((coordinator) => coordinator.id === activeCoordinatorId) || coordinators[0] || null;

  useEffect(() => {
    if (isCoordination) return;

    const loadCoordinators = async () => {
      try {
        const response = await api.get('/info/usuarios?tipo=coordenacao');
        const loadedCoordinators = (response.data || []).map((coordinator) => ({
          id: Number(coordinator.id),
          nome: coordinator.nome,
          email: coordinator.email,
        }));
        setCoordinators(loadedCoordinators);
        setActiveCoordinatorId((current) =>
          loadedCoordinators.find((coordinator) => coordinator.id === current)?.id ||
          loadedCoordinators[0]?.id ||
          null
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadCoordinators();
  }, [isCoordination]);

  useEffect(() => {
    if (!isCoordination) return;

    const loadStudents = async () => {
      try {
        const response = await api.get('/info/usuarios?tipo=aluno');
        const loadedStudents = (response.data || []).map((student) => ({
          id: student.id,
          nome: student.nome,
          description: `${student.curso || 'Aluno'}${student.matricula ? ` - ${student.matricula}` : ''}`,
          estagio: student.estagio,
        }));

        if (loadedStudents.length) {
          setStudents(loadedStudents);
          setActiveStudentId((current) => loadedStudents.find((student) => student.id === current)?.id || loadedStudents[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadStudents();
  }, [isCoordination]);

  const studentConversation = (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-md border border-slate-200 bg-brand-950 p-4 text-white shadow-sm">
        <p className="mb-4 text-sm font-black">Coordenadores</p>
        {coordinators.length ? (
          coordinators.map((coordinator) => (
            <button
              key={coordinator.id}
              type="button"
              onClick={() => setActiveCoordinatorId(coordinator.id)}
              className={`mb-2 w-full rounded-md p-3 text-left text-sm font-bold ${
                activeCoordinator?.id === coordinator.id ? 'bg-white text-brand-950' : 'bg-white/10 text-white'
              }`}
            >
              {coordinator.nome}
            </button>
          ))
        ) : (
          <p className="text-sm text-white/75">Nenhum coordenador cadastrado.</p>
        )}
      </aside>
      <Conversation user={user} activeStudent={activeStudent} activeCoordinator={activeCoordinator} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-6xl">
          {isCoordination ? (
            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <aside className="rounded-md border border-slate-200 bg-brand-950 p-4 text-white shadow-sm">
                <p className="mb-4 text-sm font-black">Alunos</p>
                {students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => setActiveStudentId(student.id)}
                    className={`mb-2 w-full rounded-md p-3 text-left text-sm font-bold ${
                      activeStudentId === student.id ? 'bg-white text-brand-950' : 'bg-white/10 text-white'
                    }`}
                  >
                    {student.nome}
                  </button>
                ))}
              </aside>
              <Conversation user={user} activeStudent={activeStudent} />
            </div>
          ) : user?.tipo === 'aluno' ? (
            studentConversation
          ) : (
            <Conversation user={user} activeStudent={activeStudent} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Messages;
