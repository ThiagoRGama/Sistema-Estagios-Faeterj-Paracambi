import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const typeLabel = {
  aluno: 'Aluno',
  coordenacao: 'Coordenacao',
  admin: 'Admin',
};

const initialForm = {
  novaSenha: '',
  confirmarSenha: '',
};

const Security = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const canManagePasswords = ['admin', 'coordenacao'].includes(user?.tipo);

  useEffect(() => {
    if (!canManagePasswords) {
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      setFeedback(null);

      try {
        const response =
          user.tipo === 'admin' ? await api.get('/usuarios') : await api.get('/info/usuarios?tipo=aluno');
        const availableUsers = response.data || [];
        const withSelf =
          user.tipo === 'coordenacao'
            ? [{ id: user.id, nome: `${user.nome} (minha senha)`, email: user.email, tipo: user.tipo }, ...availableUsers]
            : availableUsers;

        const uniqueUsers = withSelf.filter(
          (item, index, list) => list.findIndex((candidate) => Number(candidate.id) === Number(item.id)) === index
        );

        setUsers(uniqueUsers);
        setSelectedUserId(String(uniqueUsers[0]?.id || ''));
      } catch (error) {
        setFeedback({ type: 'error', message: error.message || 'Nao foi possivel carregar usuarios.' });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [canManagePasswords, user]);

  const selectedUser = useMemo(
    () => users.find((item) => Number(item.id) === Number(selectedUserId)),
    [selectedUserId, users]
  );

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!selectedUserId) {
      setFeedback({ type: 'error', message: 'Selecione um usuario.' });
      return;
    }

    if (form.novaSenha.length < 6) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (form.novaSenha !== form.confirmarSenha) {
      setFeedback({ type: 'error', message: 'As senhas informadas nao conferem.' });
      return;
    }

    setSaving(true);

    try {
      const response = await api.patch(`/usuarios/${selectedUserId}/senha`, { novaSenha: form.novaSenha });
      setForm(initialForm);
      setFeedback({ type: 'success', message: response.data.mensagem || 'Senha atualizada com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Nao foi possivel alterar a senha.' });
    } finally {
      setSaving(false);
    }
  };

  if (!canManagePasswords) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <section className="mx-auto max-w-3xl rounded-md border border-red-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase text-red-600">Acesso restrito</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Pagina exclusiva da coordenacao e Admin</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Alunos podem recuperar a propria senha pela tela de login.
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
        <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-brand-700">Seguranca</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Alterar senhas</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {user.tipo === 'admin'
                ? 'Admin pode redefinir a senha de qualquer perfil cadastrado.'
                : 'Coordenacao pode redefinir senhas de alunos e a propria senha.'}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-brand-50 p-4">
                <p className="text-xs font-black uppercase text-brand-700">Disponiveis</p>
                <p className="mt-1 text-3xl font-black text-brand-950">{users.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase text-slate-500">Perfil atual</p>
                <p className="mt-1 text-lg font-black text-slate-900">{typeLabel[user.tipo] || user.tipo}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            {feedback && (
              <p
                className={`mb-4 rounded-xl border p-3 text-sm font-semibold ${
                  feedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {feedback.message}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-black uppercase text-slate-500">Usuario</span>
                <select
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                >
                  {loading ? (
                    <option>Carregando...</option>
                  ) : (
                    users.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome} - {typeLabel[item.tipo] || item.tipo}
                      </option>
                    ))
                  )}
                </select>
              </label>

              {selectedUser && (
                <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-900">{selectedUser.nome}</p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              )}

              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Nova senha</span>
                <input
                  type="password"
                  value={form.novaSenha}
                  onChange={(event) => updateForm('novaSenha', event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                  placeholder="Minimo 6 caracteres"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Confirmar senha</span>
                <input
                  type="password"
                  value={form.confirmarSenha}
                  onChange={(event) => updateForm('confirmarSenha', event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                  placeholder="Repita a senha"
                />
              </label>
            </div>

            <button type="submit" disabled={saving || loading} className="primary-button mt-5 w-full sm:w-auto">
              {saving ? 'Atualizando...' : 'Alterar senha'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Security;
