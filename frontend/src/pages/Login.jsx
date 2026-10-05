import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const initialRecoveryForm = {
  login: '',
  codigo: '',
  novaSenha: '',
  confirmarSenha: '',
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState(initialRecoveryForm);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryFeedback, setRecoveryFeedback] = useState(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      await login({ email, senha: password });
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRecoveryForm = (field, value) => {
    setRecoveryForm((current) => ({ ...current, [field]: value }));
  };

  const requestRecoveryCode = async (event) => {
    event.preventDefault();
    setRecoveryFeedback(null);
    setRecoveryCode('');
    setRecoveryLoading(true);

    try {
      const response = await api.post('/auth/recuperar-senha', { login: recoveryForm.login });
      setRecoveryCode(response.data.codigo || '');
      setRecoveryFeedback({
        type: 'success',
        message: response.data.mensagem || 'Codigo de recuperacao gerado.',
      });
    } catch (error) {
      setRecoveryFeedback({ type: 'error', message: error.message || 'Nao foi possivel gerar o codigo.' });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const confirmRecovery = async (event) => {
    event.preventDefault();
    setRecoveryFeedback(null);

    if (recoveryForm.novaSenha !== recoveryForm.confirmarSenha) {
      setRecoveryFeedback({ type: 'error', message: 'As senhas informadas nao conferem.' });
      return;
    }

    setRecoveryLoading(true);

    try {
      const response = await api.post('/auth/recuperar-senha/confirmar', {
        login: recoveryForm.login,
        codigo: recoveryForm.codigo,
        novaSenha: recoveryForm.novaSenha,
      });
      setRecoveryForm(initialRecoveryForm);
      setRecoveryCode('');
      setRecoveryFeedback({
        type: 'success',
        message: response.data.mensagem || 'Senha atualizada com sucesso.',
      });
    } catch (error) {
      setRecoveryFeedback({ type: 'error', message: error.message || 'Nao foi possivel atualizar a senha.' });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f8fc] px-4 py-10">
      <div className={`grid w-full gap-5 ${showRecovery ? 'max-w-5xl lg:grid-cols-[0.9fr_1.1fr]' : 'max-w-md'}`}>
      <section className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-xl shadow-slate-200/70 sm:px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-800 shadow-lg shadow-brand-800/20">
            <span className="text-2xl font-black text-white">F</span>
          </div>
          <h1 className="mt-5 text-xl font-black text-brand-800">FAETERJ</h1>
          <p className="text-sm font-semibold text-slate-500">Sistema de Estagios</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>
          )}

          <label className="block">
            <span className="sr-only">Nome ou e-mail</span>
            <input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Nome ou e-mail"
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 focus:border-brand-700 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="sr-only">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Senha"
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 focus:border-brand-700 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mx-auto block h-11 min-w-40 rounded-xl bg-brand-800 px-6 text-sm font-black uppercase text-white shadow-md shadow-brand-800/20 hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Entrando...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowRecovery((current) => !current);
              setRecoveryFeedback(null);
            }}
            className="mx-auto block text-sm font-black text-brand-800 hover:text-brand-950"
          >
            {showRecovery ? 'Fechar recuperacao' : 'Recuperar senha'}
          </button>
        </form>
      </section>

      {showRecovery && (
        <section className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-xl shadow-slate-200/70 sm:px-8">
          <div className="mb-6">
            <p className="text-xs font-black uppercase text-brand-700">Seguranca</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Recuperar senha</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gere um codigo pelo nome ou e-mail cadastrado e informe a nova senha.
            </p>
          </div>

          {recoveryFeedback && (
            <div
              className={`mb-4 rounded-xl border p-3 text-sm font-semibold ${
                recoveryFeedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {recoveryFeedback.message}
            </div>
          )}

          {recoveryCode && (
            <div className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 p-4">
              <p className="text-xs font-black uppercase text-brand-700">Codigo gerado</p>
              <p className="mt-1 text-3xl font-black tracking-[0.18em] text-brand-900">{recoveryCode}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={requestRecoveryCode}>
            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Nome ou e-mail</span>
              <input
                type="text"
                value={recoveryForm.login}
                onChange={(event) => updateRecoveryForm('login', event.target.value)}
                placeholder="usuario@faeterj.br"
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 focus:border-brand-700 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </label>

            <button type="submit" disabled={recoveryLoading} className="secondary-button w-full">
              {recoveryLoading ? 'Gerando...' : 'Gerar codigo'}
            </button>
          </form>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={confirmRecovery}>
            <label className="block sm:col-span-2">
              <span className="text-xs font-black uppercase text-slate-500">Codigo</span>
              <input
                type="text"
                inputMode="numeric"
                value={recoveryForm.codigo}
                onChange={(event) => updateRecoveryForm('codigo', event.target.value)}
                placeholder="000000"
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 focus:border-brand-700 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Nova senha</span>
              <input
                type="password"
                value={recoveryForm.novaSenha}
                onChange={(event) => updateRecoveryForm('novaSenha', event.target.value)}
                placeholder="Minimo 6 caracteres"
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 focus:border-brand-700 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Confirmar senha</span>
              <input
                type="password"
                value={recoveryForm.confirmarSenha}
                onChange={(event) => updateRecoveryForm('confirmarSenha', event.target.value)}
                placeholder="Repita a senha"
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 focus:border-brand-700 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </label>

            <button type="submit" disabled={recoveryLoading} className="primary-button sm:col-span-2">
              {recoveryLoading ? 'Salvando...' : 'Atualizar senha'}
            </button>
          </form>
        </section>
      )}
      </div>
    </div>
  );
};

export default Login;
