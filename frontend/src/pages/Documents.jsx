import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const badgeClass = (status) => {
  if (status === 'Aprovado') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Reprovado') return 'bg-red-100 text-red-700';
  if (status === 'Erro') return 'bg-red-100 text-red-700';
  if (status === 'Em analise') return 'bg-blue-100 text-blue-700';
  if (status === 'Enviado') return 'bg-blue-100 text-blue-700';
  return 'bg-amber-100 text-amber-800';
};

const normalizeDate = (date) => (date ? new Date(date).toLocaleDateString('pt-BR') : 'Sem data');

const Documents = () => {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [observation, setObservation] = useState('');
  const [savingDecision, setSavingDecision] = useState(false);
  const [decisionFeedback, setDecisionFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [openingDocumentId, setOpeningDocumentId] = useState(null);
  const isCoordination = user?.tipo === 'coordenacao';

  useEffect(() => {
    const loadStages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/estagios');
        const loadedStages = response.data || [];
        setStages(loadedStages);
        setSelectedStageId(loadedStages[0]?.id || '');
      } catch (err) {
        setError(err.message || 'Erro ao carregar estagios.');
      } finally {
        setLoading(false);
      }
    };

    loadStages();
  }, []);

  useEffect(() => {
    if (!selectedStageId) {
      setDocuments([]);
      return;
    }

    const loadDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/estagios/${selectedStageId}/documentos`);
        const loadedDocuments = response.data || [];
        setDocuments(loadedDocuments);
        setSelectedDocumentId(loadedDocuments[0]?.id || null);
      } catch (err) {
        setError(err.message || 'Erro ao carregar documentos.');
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [selectedStageId]);

  const selectedDocument = documents.find((document) => document.id === selectedDocumentId) || documents[0];

  useEffect(() => {
    setObservation(selectedDocument?.observacao || '');
    setDecisionFeedback(null);
  }, [selectedDocument?.id, selectedDocument?.observacao]);

  const saveDocumentDecision = async (status) => {
    if (!selectedStageId || !selectedDocument?.id) {
      setDecisionFeedback({ type: 'error', message: 'Selecione um documento antes de avaliar.' });
      return;
    }

    setSavingDecision(true);
    setDecisionFeedback(null);
    setActionError(null);

    try {
      const response = await api.patch(`/estagios/${selectedStageId}/documentos/${selectedDocument.id}`, {
        status,
        observacao: observation,
      });
      const updatedDocument = response.data;

      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === updatedDocument.id ? { ...document, ...updatedDocument } : document
        )
      );
      setDecisionFeedback({ type: 'success', message: `Documento ${status.toLowerCase()} com sucesso.` });
    } catch (err) {
      setDecisionFeedback({ type: 'error', message: err.message || 'Nao foi possivel salvar o parecer.' });
    } finally {
      setSavingDecision(false);
    }
  };

  const openDocument = async (document) => {
    if (!document?.id) return;

    setActionError(null);
    setOpeningDocumentId(document.id);

    try {
      const response = await api.get(`/documentos/${document.id}/download`, { responseType: 'blob' });
      const contentType = response.headers?.['content-type'] || document.mime_type || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const fileName = document.nome_arquivo || 'documento';

      if (contentType.includes('pdf') || contentType.startsWith('image/') || contentType.startsWith('text/')) {
        window.open(url, '_blank', 'noopener,noreferrer');
        window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      } else {
        const link = window.document.createElement('a');
        link.href = url;
        link.download = fileName;
        window.document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setActionError(err.message || 'Nao foi possivel abrir o arquivo.');
    } finally {
      setOpeningDocumentId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        {isCoordination ? (
          <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="surface-card p-5">
              <p className="text-xs font-black uppercase text-slate-500">Fila de documentos</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">Analise</h1>

              <label className="mt-5 block text-sm font-bold text-slate-700">
                Estagio
                <select
                  value={selectedStageId}
                  onChange={(event) => setSelectedStageId(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
                >
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.vaga_titulo} - {stage.empresa_nome}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-5 space-y-2">
                {documents.map((document) => (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => {
                      setSelectedDocumentId(document.id);
                      setDecisionFeedback(null);
                      setActionError(null);
                    }}
                    className={`w-full rounded-xl border p-4 text-left ${
                      selectedDocument?.id === document.id ? 'border-brand-700 bg-brand-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-black text-slate-900">{document.tipo}</p>
                    <p className="text-sm text-slate-500">{normalizeDate(document.enviado_em)}</p>
                    <span className={`mt-2 inline-flex rounded-sm px-3 py-1 text-xs font-black uppercase ${badgeClass(document.status)}`}>
                      {document.status}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <article className="surface-card p-5">
              {loading ? (
                <p className="text-sm font-semibold text-slate-600">Carregando documentos...</p>
              ) : error ? (
                <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
              ) : selectedDocument ? (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase text-slate-500">Documento selecionado</p>
                      <h2 className="mt-1 text-2xl font-black text-slate-900">{selectedDocument.tipo}</h2>
                      <p className="text-sm text-slate-500">{selectedDocument.nome_arquivo}</p>
                    </div>
                    <span className={`w-fit rounded-sm px-3 py-1 text-xs font-black uppercase ${badgeClass(selectedDocument.status)}`}>
                      {selectedDocument.status || 'Aguardando parecer'}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-black uppercase text-slate-500">Arquivo</p>
                      <div className="mt-5 grid h-28 place-items-center rounded-xl border border-dashed border-slate-300 bg-white">
                        <span className="text-sm font-black text-slate-500">{selectedDocument.nome_arquivo}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDocument(selectedDocument)}
                        disabled={openingDocumentId === selectedDocument.id}
                        className="primary-button mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {openingDocumentId === selectedDocument.id ? 'Abrindo...' : 'Visualizar arquivo'}
                      </button>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-black uppercase text-slate-500">Observacao</p>
                      <textarea
                        rows={5}
                        value={observation}
                        onChange={(event) => setObservation(event.target.value)}
                        placeholder="Descreva pendencias ou parecer da coordenacao"
                        className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                  </div>

                  {actionError && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{actionError}</p>}
                  {decisionFeedback && (
                    <p
                      className={`mt-4 rounded-xl p-4 text-sm font-semibold ${
                        decisionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {decisionFeedback.message}
                    </p>
                  )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => saveDocumentDecision('Reprovado')}
                      disabled={savingDecision}
                      className="secondary-button disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingDecision ? 'Salvando...' : 'Reprovar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => saveDocumentDecision('Aprovado')}
                      disabled={savingDecision}
                      className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingDecision ? 'Salvando...' : 'Aprovar'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600">Nenhum documento encontrado.</p>
              )}
            </article>
          </section>
        ) : (
          <section className="surface-card mx-auto max-w-5xl p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Documentos do aluno</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Arquivos enviados</h1>
              </div>
              <Link to="/upload" className="primary-button w-fit">
                Enviar documento
              </Link>
            </div>

            {loading ? (
              <p className="mt-6 text-sm font-semibold text-slate-600">Carregando documentos...</p>
            ) : error ? (
              <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
            ) : (
              <div className="mt-6 divide-y divide-slate-100">
                {documents.map((document) => (
                  <article key={document.id} className="py-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-base font-black text-slate-900">{document.tipo}</h2>
                        <p className="mt-1 text-sm text-slate-500">Enviado em {normalizeDate(document.enviado_em)}</p>
                        <p className="mt-2 text-sm text-slate-600">{document.nome_arquivo}</p>
                      </div>
                      <span className={`w-fit rounded-sm px-3 py-1 text-xs font-black uppercase ${badgeClass(document.status)}`}>
                        {document.status}
                      </span>
                    </div>
                    {['Erro', 'Reprovado'].includes(document.status) && (
                      <Link to="/upload" className="secondary-button mt-4 inline-flex">
                        Reenviar corrigido
                      </Link>
                    )}
                    {document.observacao && <p className="mt-3 text-sm text-slate-600">{document.observacao}</p>}
                    <button
                      type="button"
                      onClick={() => openDocument(document)}
                      disabled={openingDocumentId === document.id}
                      className="secondary-button mt-4 inline-flex disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {openingDocumentId === document.id ? 'Abrindo...' : 'Visualizar arquivo'}
                    </button>
                  </article>
                ))}
              </div>
            )}
            {actionError && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{actionError}</p>}
          </section>
        )}
      </main>
    </div>
  );
};

export default Documents;
