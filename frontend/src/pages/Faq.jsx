import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Faq = () => {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFaq = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/info/faq');
        const faqs = response.data || [];
        setItems(faqs);
        setOpenId(faqs[0]?.id || null);
      } catch (err) {
        setError(err.message || 'Nao foi possivel carregar perguntas frequentes.');
      } finally {
        setLoading(false);
      }
    };

    loadFaq();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">Ajuda</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Perguntas frequentes</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Respostas rapidas sobre envio de documentos, aluno trabalhador, empresas e atendimento da coordenacao.
            </p>
          </div>

          {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

          {loading ? (
            <p className="mt-5 rounded-md border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600 shadow-sm">
              Carregando perguntas...
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {items.map((item) => {
                const isOpen = openId === item.id;

                return (
                  <article key={item.id} className="rounded-md border border-slate-200 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    >
                      <span className="text-base font-black text-slate-900">{item.pergunta}</span>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-lg font-black text-brand-800">
                        {isOpen ? '-' : '+'}
                      </span>
                    </button>
                    {isOpen && <p className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-6 text-slate-600">{item.resposta}</p>}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Faq;
