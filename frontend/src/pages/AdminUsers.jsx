import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const emptyForm = {
  nome: '',
  email: '',
  senha: '',
  tipo: 'aluno',
  matricula: '',
  curso: 'Sistemas de Informacao',
  semestre: '1 semestre',
  telefone: '',
};

const typeLabel = {
  aluno: 'Aluno',
  coordenacao: 'Coordenacao',
  admin: 'Admin',
};

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const isAdmin = user?.tipo === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      setFeedback(null);

      try {
        const response = await api.get('/usuarios');
        setUsers(response.data || []);
      } catch (error) {
        setFeedback({ type: 'error', message: error.message || 'Nao foi possivel carregar usuarios.' });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    if (filter === 'todos') return users;
    return users.filter((item) => item.tipo === filter);
  }, [filter, users]);

  const totals = useMemo(
    () => ({
      alunos: users.filter((item) => item.tipo === 'aluno').length,
      coordenacao: users.filter((item) => item.tipo === 'coordenacao').length,
      admin: users.filter((item) => item.tipo === 'admin').length,
    }),
    [users]
  );

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        ...form,
        matricula: form.tipo === 'aluno' ? form.matricula : '',
        curso: form.tipo === 'aluno' ? form.curso : '',
        semestre: form.tipo === 'aluno' ? form.semestre : '',
      };
      const response = await api.post('/usuarios', payload);
      setUsers((current) => [response.data, ...current]);
      setForm(emptyForm);
      setFeedback({ type: 'success', message: 'Usuario criado com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Nao foi possivel criar usuario.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <section className="mx-auto max-w-3xl rounded-md border border-red-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase text-red-600">Acesso restrito</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Pagina exclusiva do Admin</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use o login de Admin para criar usuarios e separar corretamente os acessos do aluno e da coordenacao.
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <section className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase text-slate-500">Admin</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">Criar usuarios</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Cadastre alunos, membros da coordenacao ou outro Admin. O perfil escolhido define quais telas aparecem apos o login.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              {feedback && (
                <p
                  className={`mb-4 rounded-xl p-3 text-sm font-semibold ${
                    feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {feedback.message}
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase text-slate-500">Nome</span>
                  <input
                    value={form.nome}
                    onChange={(event) => updateForm('nome', event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                    placeholder="Nome do usuario"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase text-slate-500">E-mail</span>
                  <input
                    type="email"
                    required
                    pattern="[A-Za-z0-9._%+\-]+@faeterj\.br"
                    title="Use um e-mail com o dominio @faeterj.br"
                    value={form.email}
                    onChange={(event) => updateForm('email', event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                    placeholder="usuario@faeterj.br"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase text-slate-500">Senha</span>
                  <input
                    type="password"
                    value={form.senha}
                    onChange={(event) => updateForm('senha', event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                    placeholder="Senha inicial"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase text-slate-500">Tipo de acesso</span>
                  <select
                    value={form.tipo}
                    onChange={(event) => updateForm('tipo', event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="aluno">Aluno</option>
                    <option value="coordenacao">Coordenacao</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase text-slate-500">Telefone</span>
                  <input
                    value={form.telefone}
                    onChange={(event) => updateForm('telefone', event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                    placeholder="(21) 99999-9999"
                  />
                </label>

                {form.tipo === 'aluno' && (
                  <>
                    <label className="block">
                      <span className="text-xs font-black uppercase text-slate-500">Matricula</span>
                      <input
                        value={form.matricula}
                        onChange={(event) => updateForm('matricula', event.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                        placeholder="2026006"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-black uppercase text-slate-500">Curso</span>
                      <input
                        value={form.curso}
                        onChange={(event) => updateForm('curso', event.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-black uppercase text-slate-500">Semestre</span>
                      <input
                        value={form.semestre}
                        onChange={(event) => updateForm('semestre', event.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      />
                    </label>
                  </>
                )}
              </div>

              <button type="submit" disabled={saving} className="primary-button mt-5 w-full sm:w-auto">
                {saving ? 'Criando...' : 'Criar usuario'}
              </button>
            </form>
          </div>

          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Usuarios cadastrados</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Controle de acesso</h2>
              </div>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Filtro</span>
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="mt-2 h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="aluno">Alunos</option>
                  <option value="coordenacao">Coordenacao</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-brand-50 p-4">
                <p className="text-xs font-black uppercase text-brand-700">Alunos</p>
                <p className="mt-1 text-2xl font-black text-brand-900">{totals.alunos}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase text-slate-500">Coordenacao</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{totals.coordenacao}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-black uppercase text-emerald-700">Admin</p>
                <p className="mt-1 text-2xl font-black text-emerald-900">{totals.admin}</p>
              </div>
            </div>

            {loading ? (
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">Carregando usuarios...</p>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {filteredUsers.map((item) => (
                  <article key={item.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="font-black text-slate-900">{item.nome}</p>
                      <p className="text-sm text-slate-500">{item.email}</p>
                      {item.tipo === 'aluno' && (
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {item.matricula || 'Sem matricula'} - {item.curso || 'Curso nao informado'}
                        </p>
                      )}
                    </div>
                    <span className="w-fit rounded-sm bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">
                      {typeLabel[item.tipo] || item.tipo}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default AdminUsers;
