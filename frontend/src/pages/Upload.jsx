import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const documentTypes = [
  'Termo de compromisso',
  'Plano de atividades',
  'Convenio',
  'Carteira de trabalho',
  'Relatorio parcial',
  'Relatorio final',
  'Relatorio de aluno trabalhador',
];

const externalTemplates = [
  {
    id: 'termo-compromisso',
    titulo: 'Termo de compromisso',
    categoria: 'Inicio do estagio',
    descricao: 'Modelo base para formalizar estagio entre aluno, empresa e instituicao.',
  },
  {
    id: 'plano-atividades',
    titulo: 'Plano de atividades',
    categoria: 'Inicio do estagio',
    descricao: 'Organiza atividades previstas, supervisor e relacao com o curso.',
  },
  {
    id: 'convenio',
    titulo: 'Folha de convenio',
    categoria: 'Convenio',
    descricao: 'Modelo para registrar convenio com empresa concedente.',
  },
  {
    id: 'relatorio-100-horas',
    titulo: 'Relatório de 100 horas',
    categoria: 'Formulário externo',
    descricao: 'Modelo oficial para relatório de 100 horas.',
    url: 'https://docs.google.com/document/d/1WPO3h2_aaktzuiqDybFpQoa0kcRj_ny1/edit?usp=drive_link&ouid=110238086755970678865&rtpof=true&sd=true',
  },
  {
    id: 'relatorio-final',
    titulo: 'Relatorio final',
    categoria: 'Relatorios',
    descricao: 'Documento de encerramento com avaliacao das atividades realizadas.',
  },
  {
    id: 'aluno-trabalhador',
    titulo: 'Relatório de aluno trabalhador',
    categoria: 'Formulário externo',
    descricao: 'Template específico para estudante trabalhador.',
    url: 'https://docs.google.com/document/d/1ve7JpxFQxRsJLSTjc3yxnCHDKbPcI8Ck/edit?usp=drive_link&ouid=110238086755970678865&rtpof=true&sd=true',
  },
];

const TemplateGrid = ({ eyebrow, title, description }) => {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">{title}</h2>
          {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        <span className="w-fit rounded-sm bg-brand-50 px-3 py-1 text-xs font-black uppercase text-brand-800">
          {externalTemplates.length} modelo(s)
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {externalTemplates.map((template) => (
          <article key={template.id} className="rounded-md border border-slate-200 bg-slate-50 p-5">
            <div className="grid h-16 w-20 place-items-center rounded-sm bg-yellow-300 text-sm font-black text-yellow-900">
              DOC
            </div>
            <p className="mt-4 text-sm font-black text-slate-900">{template.titulo}</p>
            <p className="mt-1 text-xs font-semibold uppercase text-brand-700">{template.categoria}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{template.descricao}</p>
            {template.url ? (
              <a
                href={template.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-md bg-brand-800 px-4 py-2 text-xs font-black text-white"
              >
                Acessar Google Docs
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-4 inline-flex cursor-not-allowed rounded-md bg-slate-300 px-4 py-2 text-xs font-black text-slate-600"
              >
                Indisponivel
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

const StudentUpload = () => {
  const fileInputRef = useRef(null);
  const scanInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [type, setType] = useState(documentTypes[0]);
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);

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
        setError(err.message || 'Nao foi possivel carregar seus estagios.');
      } finally {
        setLoading(false);
      }
    };

    loadStages();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setFileName(selectedFile?.name || '');
    setFeedback(null);
    setError(null);
    setUploadedDocument(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setUploadedDocument(null);

    if (!selectedStageId) {
      setError('Nenhum estagio encontrado para receber o documento.');
      return;
    }

    if (!file) {
      setError('Selecione um arquivo antes de enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('tipo', type);
    formData.append('arquivo', file);
    setSending(true);

    try {
      const response = await api.post(`/estagios/${selectedStageId}/documentos`, formData);
      const receivedDocument = response.data?.documento || null;
      setFeedback(receivedDocument ? null : response.data?.mensagem || 'Documento enviado com sucesso.');
      setUploadedDocument(receivedDocument);
      setFile(null);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (scanInputRef.current) scanInputRef.current.value = '';
    } catch (err) {
      setError(err.message || 'Erro ao enviar documento.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase text-slate-500">Envio de documento</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">Enviar arquivo</h1>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {feedback && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            {uploadedDocument && (
              <div className="rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-xs font-black uppercase text-emerald-700">Arquivo recebido</p>
                <p className="mt-1 break-all text-sm font-black text-slate-900">{uploadedDocument.nome_arquivo}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Status: {uploadedDocument.status}</p>
                <Link to="/documents" className="mt-3 inline-flex rounded-md border border-emerald-600 px-3 py-2 text-xs font-black text-emerald-700">
                  Ver em documentos
                </Link>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-black text-slate-700">Estagio</span>
              <select
                value={selectedStageId}
                onChange={(event) => setSelectedStageId(event.target.value)}
                disabled={loading || !stages.length}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
              >
                {stages.length ? (
                  stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.vaga_titulo} - {stage.empresa_nome}
                    </option>
                  ))
                ) : (
                  <option>{loading ? 'Carregando estagios...' : 'Nenhum estagio encontrado'}</option>
                )}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-700">Tipo de documento</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              >
                {documentTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-md border border-slate-300 bg-white text-3xl font-black text-brand-700">
                ^
              </div>
              <p className="mt-4 text-sm font-black text-slate-900">Upload de Arquivo</p>
              <p className="mt-1 text-xs text-slate-500">PDF, DOC ou DOCX.</p>
              <label className="mt-5 inline-flex cursor-pointer rounded-md bg-brand-800 px-5 py-2 text-sm font-black text-white">
                Selecionar
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                />
              </label>
              <label className="mt-3 inline-flex cursor-pointer rounded-md border border-brand-800 px-5 py-2 text-sm font-black text-brand-800 sm:hidden">
                Digitalizar
                <input
                  ref={scanInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                />
              </label>
              {fileName && <p className="mt-4 break-all text-xs font-semibold text-slate-600">{fileName}</p>}
            </div>

            <button
              type="submit"
              disabled={sending || loading}
              className="w-full rounded-md bg-brand-800 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>

          <aside className="rounded-md border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-black text-slate-900">Orientacoes</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Confira assinatura da empresa e supervisor.</li>
              <li>Se houver erro, reenvie apenas o documento corrigido.</li>
              <li>A digitalizacao aparece apenas em dispositivos moveis.</li>
              <li>Aluno trabalhador deve usar relatorio proprio.</li>
            </ul>
          </aside>
        </div>
      </section>

      <TemplateGrid
        eyebrow="Modelos para aluno"
        title="Templates de documentos"
        description="Acesse os modelos antes de preencher e enviar os arquivos para a coordenacao."
      />
    </div>
  );
};

const CoordinationModels = () => (
  <div className="mx-auto max-w-5xl">
    <TemplateGrid
      eyebrow="Modelos da coordenacao"
      title="Templates e formularios"
      description="Modelos oficiais para convenio, relatorios e aluno trabalhador."
    />
  </div>
);

const Upload = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        {user?.tipo === 'coordenacao' ? <CoordinationModels /> : <StudentUpload />}
      </main>
    </div>
  );
};

export default Upload;
