import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Companies = () => {
  const [divest, setDivest] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/info/empresas');
        setDivest(response.data?.divest || null);
        setCompanies(response.data?.empresas || []);
      } catch (err) {
        setError(err.message || 'Nao foi possivel carregar empresas conveniadas.');
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">DIVEST</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Empresas conveniadas</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Consulte empresas acompanhadas pela divisao de estagios e os contatos para orientacao.
            </p>
          </div>

          {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

          {loading ? (
            <p className="mt-5 rounded-md border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600 shadow-sm">
              Carregando empresas...
            </p>
          ) : (
            <>
              {divest && (
                <section className="mt-5 rounded-md border border-brand-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase text-brand-700">Contato institucional</p>
                      <h2 className="mt-1 text-xl font-black text-slate-900">{divest.nome}</h2>
                      <p className="mt-2 text-sm text-slate-600">{divest.atendimento}</p>
                      <p className="mt-3 text-sm font-semibold text-slate-700">{divest.email}</p>
                      <p className="text-sm text-slate-600">{divest.telefone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(divest.redesSociais || []).map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-black text-brand-800 hover:bg-brand-100"
                        >
                          {link.nome}
                        </a>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {companies.map((company) => (
                  <article key={company.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase text-brand-700">{company.status}</p>
                        <h2 className="mt-1 text-lg font-black text-slate-900">{company.nome}</h2>
                        <p className="text-sm text-slate-500">{company.cidade}</p>
                      </div>
                      <span className="rounded-sm bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-700">
                        {company.vagas} vaga(s)
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-700">{company.area}</p>
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      <p>{company.contato}</p>
                      <p>{company.telefone}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Companies;
