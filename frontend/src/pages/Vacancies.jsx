import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const emptyVacancy = {
  titulo: '',
  empresa_nome: '',
  descricao: '',
  requisitos: '',
  curso_alvo: '',
  carga_horaria: '',
  modalidade: 'Presencial',
  local: '',
  bolsa: '',
  data_limite: '',
  status: 'Aberta',
};

const statusClass = (status) => {
  if (status === 'Aberta') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Pausada') return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-700';
};

const Vacancies = () => {
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState([]);
  const [form, setForm] = useState(emptyVacancy);
  const [filter, setFilter] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const canPublish = ['coordenacao', 'admin'].includes(user?.tipo);

  useEffect(() => {
    const loadVacancies = async () => {
      setLoading(true);
      setFeedback(null);

      try {
        const response = await api.get('/vagas');
        setVacancies(response.data || []);
      } catch (error) {
        setFeedback({ type: 'error', message: error.message || 'Nao foi possivel carregar vagas.' });
      } finally {
        setLoading(false);
      }
    };

    loadVacancies();
  }, []);

  const filteredVacancies = useMemo(() => {
    if (filter === 'todas') return vacancies;
    return vacancies.filter((vacancy) => vacancy.status === filter);
  }, [filter, vacancies]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const response = await api.post('/vagas', form);
      setVacancies((current) => [response.data, ...current]);
      setForm(emptyVacancy);
      setFeedback({ type: 'success', message: 'Vaga publicada com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Nao foi possivel publicar a vaga.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Estagios</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Vagas publicadas</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Alunos podem consultar oportunidades. A coordenacao e o Admin podem publicar novas vagas para os cursos.
                </p>
              </div>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Filtrar</span>
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="mt-2 h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="todas">Todas</option>
                  <option value="Aberta">Abertas</option>
                  <option value="Pausada">Pausadas</option>
                  <option value="Encerrada">Encerradas</option>
                </select>
              </label>
            </div>
          </div>

          {feedback && (
            <p
              className={`mt-5 rounded-xl p-4 text-sm font-semibold ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {feedback.message}
            </p>
          )}

          <div className={`mt-6 grid gap-6 ${canPublish ? 'xl:grid-cols-[0.85fr_1.15fr]' : ''}`}>
            {canPublish && (
              <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase text-brand-700">Coordenacao</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">Publicar vaga</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-black uppercase text-slate-500">Titulo</span>
                    <input
                      value={form.titulo}
                      onChange={(event) => updateForm('titulo', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="Estagio em desenvolvimento"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Empresa</span>
                    <input
                      value={form.empresa_nome}
                      onChange={(event) => updateForm('empresa_nome', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="Empresa conveniada"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Curso alvo</span>
                    <input
                      value={form.curso_alvo}
                      onChange={(event) => updateForm('curso_alvo', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="Sistemas de Informacao"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-xs font-black uppercase text-slate-500">Descricao</span>
                    <textarea
                      rows={4}
                      value={form.descricao}
                      onChange={(event) => updateForm('descricao', event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="Resumo das atividades"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-xs font-black uppercase text-slate-500">Requisitos</span>
                    <textarea
                      rows={3}
                      value={form.requisitos}
                      onChange={(event) => updateForm('requisitos', event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="Conhecimentos, disponibilidade e documentos necessarios"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Carga horaria</span>
                    <input
                      value={form.carga_horaria}
                      onChange={(event) => updateForm('carga_horaria', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="20h semanais"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Modalidade</span>
                    <select
                      value={form.modalidade}
                      onChange={(event) => updateForm('modalidade', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                    >
                      <option>Presencial</option>
                      <option>Hibrido</option>
                      <option>Remoto</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Local</span>
                    <input
                      value={form.local}
                      onChange={(event) => updateForm('local', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="Paracambi/RJ"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Bolsa</span>
                    <input
                      value={form.bolsa}
                      onChange={(event) => updateForm('bolsa', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      placeholder="R$ 900,00"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Prazo</span>
                    <input
                      type="date"
                      value={form.data_limite}
                      onChange={(event) => updateForm('data_limite', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-500">Status</span>
                    <select
                      value={form.status}
                      onChange={(event) => updateForm('status', event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                    >
                      <option>Aberta</option>
                      <option>Pausada</option>
                      <option>Encerrada</option>
                    </select>
                  </label>
                </div>

                <button type="submit" disabled={saving} className="primary-button mt-5 w-full sm:w-auto">
                  {saving ? 'Publicando...' : 'Publicar vaga'}
                </button>
              </form>
            )}

            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-slate-500">Oportunidades</p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">{filteredVacancies.length} vaga(s)</h2>
                </div>
              </div>

              {loading ? (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">Carregando vagas...</p>
              ) : filteredVacancies.length ? (
                <div className="mt-5 space-y-4">
                  {filteredVacancies.map((vacancy) => (
                    <article key={vacancy.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase text-brand-700">{vacancy.empresa_nome}</p>
                          <h3 className="mt-1 text-lg font-black text-slate-900">{vacancy.titulo}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{vacancy.descricao}</p>
                        </div>
                        <span className={`w-fit rounded-sm px-3 py-1 text-xs font-black uppercase ${statusClass(vacancy.status)}`}>
                          {vacancy.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-black uppercase text-slate-400">Curso</p>
                          <p className="mt-1 font-semibold text-slate-700">{vacancy.curso_alvo}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-black uppercase text-slate-400">Carga</p>
                          <p className="mt-1 font-semibold text-slate-700">{vacancy.carga_horaria}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-black uppercase text-slate-400">Modalidade</p>
                          <p className="mt-1 font-semibold text-slate-700">{vacancy.modalidade}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-black uppercase text-slate-400">Local</p>
                          <p className="mt-1 font-semibold text-slate-700">{vacancy.local}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-black uppercase text-slate-400">Bolsa</p>
                          <p className="mt-1 font-semibold text-slate-700">{vacancy.bolsa}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-black uppercase text-slate-400">Prazo</p>
                          <p className="mt-1 font-semibold text-slate-700">{vacancy.prazo_formatado || 'Sem prazo'}</p>
                        </div>
                      </div>

                      <p className="mt-4 rounded-xl bg-white p-3 text-sm leading-6 text-slate-600">
                        <span className="font-black text-slate-800">Requisitos: </span>
                        {vacancy.requisitos}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                  Nenhuma vaga encontrada para este filtro.
                </p>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Vacancies;
