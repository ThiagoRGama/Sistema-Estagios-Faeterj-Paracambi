import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const templateMap = {
  'relatorio-100-horas': {
    title: 'Relatório de 100 horas',
    url: 'https://docs.google.com/document/d/1WPO3h2_aaktzuiqDybFpQoa0kcRj_ny1/edit?usp=drive_link&ouid=110238086755970678865&rtpof=true&sd=true',
  },
  'relatorio-aluno-trabalhador': {
    title: 'Relatório de aluno trabalhador',
    url: 'https://docs.google.com/document/d/1ve7JpxFQxRsJLSTjc3yxnCHDKbPcI8Ck/edit?usp=drive_link&ouid=110238086755970678865&rtpof=true&sd=true',
  },
};

const DocsTemplate = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const template = useMemo(() => templateMap[templateId] || null, [templateId]);

  useEffect(() => {
    if (!template) {
      navigate('/upload', { replace: true });
      return;
    }

    const openTemplate = () => {
      window.location.assign(template.url);
    };

    openTemplate();
  }, [template, navigate]);

  if (!template) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-xl rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase text-slate-500">Google Docs</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">{template.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          O formulário foi aberto em uma nova aba do navegador. Se não aparecer, utilize o botão abaixo para acessar novamente.
        </p>
        <a
          href={template.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex rounded-md bg-brand-800 px-5 py-3 text-sm font-black text-white"
        >
          Abrir documento
        </a>
        <button
          type="button"
          onClick={() => navigate('/upload')}
          className="mt-3 ml-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default DocsTemplate;
