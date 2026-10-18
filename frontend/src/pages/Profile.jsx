import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { student } from '../data/mockData';
import api from '../services/api';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-black uppercase text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-800">{value || 'Nao informado'}</p>
  </div>
);

const parseDate = (value) => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (date, fallback = 'Nao informado') => {
  const parsed = parseDate(date);
  return parsed ? parsed.toLocaleDateString('pt-BR') : fallback;
};

const stageProgress = (stage) => {
  const start = parseDate(stage?.data_inicio);
  const end = parseDate(stage?.data_fim);
  if (!start || !end || end <= start) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const percentage = Math.round(Math.max(0, Math.min(1, (today - start) / (end - start))) * 100);
  return { percentage, label: today < start ? 'Estagio ainda nao iniciado' : today > end ? 'Estagio concluido' : 'Progresso do estagio' };
};

const StageProgress = ({ stage }) => {
  const progress = stageProgress(stage);
  return (
    <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-900">Progresso do estagio</p>
        <span className="text-sm font-black text-brand-800">{progress ? `${progress.percentage}%` : 'Indisponivel'}</span>
      </div>
      {progress ? (
        <>
          <div
            className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-label="Progresso do estagio"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress.percentage}
          >
            <div className="h-full rounded-full bg-brand-700 transition-all" style={{ width: `${progress.percentage}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {progress.label} · {formatDate(stage.data_inicio)} a {formatDate(stage.data_fim)}
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Informe datas de inicio e termino validas para calcular o progresso.
        </p>
      )}
    </div>
  );
};

const normalizeStage = (stage) => ({
  empresa: stage?.empresa_nome,
  vaga: stage?.vaga_titulo,
  supervisor: stage?.supervisor,
  status: stage?.status || 'Sem estagio cadastrado',
  inicio: formatDate(stage?.data_inicio),
  fim: formatDate(stage?.data_fim),
});

const documentDate = (document) => formatDate(document.enviado_em, 'Sem data');

const insurancePeriod = (insurance) => {
  if (!insurance) return 'Nao informado';

  return `${formatDate(insurance.vigencia_inicio, 'Sem inicio')} ate ${formatDate(insurance.vigencia_fim, 'Sem fim')}`;
};

const statusTone = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (['aprovado', 'ativo', 'vigente'].includes(normalized)) return 'bg-emerald-100 text-emerald-700';
  if (['reprovado', 'erro'].includes(normalized)) return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-800';
};

const workerStudentLabel = {
  pendente: 'Pendente',
  aceito: 'Aprovado',
  negado: 'Reprovado',
};

const StudentProfile = ({ user, profile, stage, documents, insurance }) => {
  const currentStudent = {
    ...student,
    ...profile,
    nome: user?.nome || profile?.nome || student.nome,
    periodo: profile?.semestre || profile?.periodo || student.periodo,
  };
  const currentStage = normalizeStage(stage);

  return (
    <section className="mx-auto max-w-5xl rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-full border border-brand-200 bg-brand-50 text-2xl font-black text-brand-800">
            {currentStudent.nome?.slice(0, 1) || 'A'}
          </div>
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Aluno</p>
            <h1 className="text-2xl font-black text-slate-900">{currentStudent.nome}</h1>
            <p className="text-sm text-slate-500">{currentStudent.curso}</p>
          </div>
        </div>
        <span className={`w-fit rounded-sm px-4 py-1 text-xs font-black uppercase ${statusTone(currentStage.status)}`}>
          {currentStage.status}
        </span>
      </div>

    <div className="mt-8 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Matricula" value={currentStudent.matricula} />
      <Field label="Periodo" value={currentStudent.periodo} />
      <Field label="Email" value={currentStudent.email} />
      <Field label="Telefone" value={currentStudent.telefone} />
    </div>

    <div className="mt-8 rounded-md border border-brand-100 bg-brand-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-brand-700">Seguro do estagio</p>
          <h2 className="mt-1 text-lg font-black text-slate-900">{insurance?.seguradora || 'Seguro nao cadastrado'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {insurance?.cobertura || 'Aguardando informacoes da DIVEST.'}
          </p>
        </div>
        <span className={`w-fit rounded-sm px-4 py-1 text-xs font-black uppercase ${statusTone(insurance?.status)}`}>
          {insurance?.status || 'Nao cadastrado'}
        </span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="Apolice" value={insurance?.apolice} />
        <Field label="Vigencia" value={insurancePeriod(insurance)} />
        <Field label="Observacao" value={insurance?.observacao} />
      </div>
    </div>

    <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm font-black text-slate-900">Dados do estagio</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Empresa" value={currentStage.empresa} />
            <Field label="Vaga" value={currentStage.vaga} />
            <Field label="Supervisor" value={currentStage.supervisor} />
            <Field label="Periodo" value={`${currentStage.inicio} ate ${currentStage.fim}`} />
          </div>
          <StageProgress stage={stage} />
        </div>
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm font-black text-slate-900">Status dos documentos</p>
          <div className="mt-4 space-y-3">
            {documents.slice(0, 4).map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600">{document.tipo}</span>
                <span className={`rounded-sm px-2 py-1 text-xs font-black ${statusTone(document.status)}`}>{document.status}</span>
              </div>
            ))}
            {!documents.length && <p className="text-sm text-slate-500">Nenhum documento enviado.</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

const CoordinationProfile = ({
  stage,
  documents,
  insurance,
  students,
  selectedStudentId,
  onSelectStudent,
  onWorkerStudentUpdate,
  onInsuranceUpdate,
  onDocumentUpdate,
  onStageUpdate,
}) => {
  const [decision, setDecision] = useState(stage?.aluno_trabalhador_status || 'pendente');
  const [savingDecision, setSavingDecision] = useState(false);
  const [decisionFeedback, setDecisionFeedback] = useState(null);
  const [presentationLetter, setPresentationLetter] = useState('');
  const [presentationFile, setPresentationFile] = useState(null);
  const [letterSent, setLetterSent] = useState(false);
  const [insuranceForm, setInsuranceForm] = useState({
    seguradora: '',
    apolice: '',
    cobertura: '',
    status: 'Pendente',
    vigencia_inicio: '',
    vigencia_fim: '',
    observacao: '',
  });
  const [savingInsurance, setSavingInsurance] = useState(false);
  const [insuranceFeedback, setInsuranceFeedback] = useState(null);
  const [savingDocumentId, setSavingDocumentId] = useState(null);
  const [documentFeedback, setDocumentFeedback] = useState(null);
  const [stagePeriodForm, setStagePeriodForm] = useState({ data_inicio: '', data_fim: '' });
  const [savingStagePeriod, setSavingStagePeriod] = useState(false);
  const [stagePeriodFeedback, setStagePeriodFeedback] = useState(null);
  const currentStage = normalizeStage(stage);
  const selectedStudent = students.find((item) => item.id === selectedStudentId) || students[0] || student;

  useEffect(() => {
    setDecision(stage?.aluno_trabalhador_status || 'pendente');
    setDecisionFeedback(null);
  }, [stage?.id, stage?.aluno_trabalhador_status]);

  useEffect(() => {
    setInsuranceForm({
      seguradora: insurance?.seguradora || '',
      apolice: insurance?.apolice || '',
      cobertura: insurance?.cobertura || '',
      status: insurance?.status || 'Pendente',
      vigencia_inicio: insurance?.vigencia_inicio ? String(insurance.vigencia_inicio).slice(0, 10) : '',
      vigencia_fim: insurance?.vigencia_fim ? String(insurance.vigencia_fim).slice(0, 10) : '',
      observacao: insurance?.observacao || '',
    });
    setInsuranceFeedback(null);
  }, [insurance, selectedStudentId]);

  useEffect(() => {
    setStagePeriodForm({
      data_inicio: stage?.data_inicio ? String(stage.data_inicio).slice(0, 10) : '',
      data_fim: stage?.data_fim ? String(stage.data_fim).slice(0, 10) : '',
    });
    setStagePeriodFeedback(null);
  }, [stage?.id, stage?.data_inicio, stage?.data_fim]);

  const saveStagePeriod = async (event) => {
    event.preventDefault();
    if (!stage?.id) return;

    setSavingStagePeriod(true);
    setStagePeriodFeedback(null);
    try {
      const response = await api.patch(`/estagios/${stage.id}/periodo`, stagePeriodForm);
      onStageUpdate(response.data);
      setStagePeriodFeedback({ type: 'success', message: 'Periodo do estagio atualizado.' });
    } catch (error) {
      setStagePeriodFeedback({ type: 'error', message: error.message || 'Nao foi possivel atualizar as datas.' });
    } finally {
      setSavingStagePeriod(false);
    }
  };

  const saveInsurance = async (event) => {
    event.preventDefault();
    setSavingInsurance(true);
    setInsuranceFeedback(null);
    try {
      const response = await api.put(`/info/seguro/${selectedStudentId}`, insuranceForm);
      onInsuranceUpdate(response.data);
      setInsuranceFeedback({ type: 'success', message: 'Dados do seguro salvos no perfil do aluno.' });
    } catch (error) {
      setInsuranceFeedback({ type: 'error', message: error.message || 'Nao foi possivel salvar os dados do seguro.' });
    } finally {
      setSavingInsurance(false);
    }
  };

  const updateDocumentStatus = async (document, status) => {
    setSavingDocumentId(document.id);
    setDocumentFeedback(null);
    try {
      const response = await api.patch(`/estagios/${stage.id}/documentos/${document.id}`, {
        status,
        observacao: document.observacao || '',
      });
      onDocumentUpdate(response.data);
      setDocumentFeedback({ type: 'success', message: 'Status do documento atualizado.' });
    } catch (error) {
      setDocumentFeedback({ type: 'error', message: error.message || 'Nao foi possivel atualizar o status do documento.' });
    } finally {
      setSavingDocumentId(null);
    }
  };

  const saveWorkerStudentDecision = async (status) => {
    if (!stage?.id) {
      setDecisionFeedback({ type: 'error', message: 'Selecione um estagio antes de avaliar.' });
      return;
    }

    setSavingDecision(true);
    setDecisionFeedback(null);

    try {
      const response = await api.patch(`/estagios/${stage.id}/aluno-trabalhador`, {
        status,
        observacao:
          status === 'aceito'
            ? 'Aluno trabalhador aprovado pela coordenacao.'
            : 'Aluno trabalhador reprovado pela coordenacao.',
      });
      const updatedStage = response.data || {};
      setDecision(updatedStage.aluno_trabalhador_status || status);
      onWorkerStudentUpdate(updatedStage);
      setDecisionFeedback({ type: 'success', message: 'Avaliacao salva com sucesso.' });
    } catch (error) {
      setDecisionFeedback({ type: 'error', message: error.message || 'Nao foi possivel salvar a avaliacao.' });
    } finally {
      setSavingDecision(false);
    }
  };

  const handlePresentationSend = () => {
    if (!presentationLetter.trim() && !presentationFile) {
      setDecisionFeedback({ type: 'error', message: 'Informe o texto ou envie um arquivo para a carta.' });
      return;
    }

    setLetterSent(true);
    setDecisionFeedback({
      type: 'success',
      message: `Carta de apresentacao enviada para ${selectedStudent.nome || 'o aluno'} com sucesso.`,
    });
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block">
            <span className="text-xs font-black uppercase text-slate-500">Aluno em acompanhamento</span>
            <select
              value={selectedStudentId || ''}
              onChange={(event) => onSelectStudent(Number(event.target.value))}
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            >
              {students.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome} - {item.matricula}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-slate-300 bg-slate-50 text-2xl font-black text-brand-800">
              {selectedStudent.nome?.slice(0, 1) || 'A'}
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-500">Dados do aluno</p>
              <h1 className="text-2xl font-black text-slate-900">{selectedStudent.nome}</h1>
              <p className="text-sm text-slate-500">{selectedStudent.curso}</p>
            </div>
          </div>
          <span className="w-fit rounded-sm bg-emerald-600 px-4 py-1 text-xs font-black uppercase text-white">
            {currentStage.status}
          </span>
        </div>

        <div className="mt-8 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Matricula" value={selectedStudent.matricula} />
          <Field label="Email" value={selectedStudent.email} />
          <Field label="Empresa" value={currentStage.empresa} />
          <Field label="Periodo" value={`${currentStage.inicio} ate ${currentStage.fim}`} />
        </div>
        <StageProgress stage={stage} />
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={saveStagePeriod}>
          <label className="block text-xs font-black uppercase text-slate-500">
            Inicio do estagio
            <input
              type="date"
              value={stagePeriodForm.data_inicio}
              onChange={(event) => setStagePeriodForm((current) => ({ ...current, data_inicio: event.target.value }))}
              disabled={!stage?.id}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-2 text-sm font-normal text-slate-800 disabled:opacity-60"
            />
          </label>
          <label className="block text-xs font-black uppercase text-slate-500">
            Fim do estagio
            <input
              type="date"
              value={stagePeriodForm.data_fim}
              onChange={(event) => setStagePeriodForm((current) => ({ ...current, data_fim: event.target.value }))}
              disabled={!stage?.id}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-2 text-sm font-normal text-slate-800 disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={savingStagePeriod || !stage?.id}
            className="h-10 rounded-md bg-brand-800 px-4 text-sm font-black text-white disabled:opacity-60"
          >
            {savingStagePeriod ? 'Salvando...' : 'Salvar periodo'}
          </button>
          {stagePeriodFeedback && (
            <p className={`sm:col-span-3 rounded-md p-3 text-sm font-semibold ${stagePeriodFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {stagePeriodFeedback.message}
            </p>
          )}
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-slate-900">Documentos enviados</p>
          <div className="mt-4 divide-y divide-slate-100">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{document.tipo}</p>
                  <p className="text-xs text-slate-500">{documentDate(document)}</p>
                </div>
                <label className="text-xs font-black uppercase text-slate-500">
                  <span className="sr-only">Status de {document.tipo}</span>
                  <select
                    value={document.status}
                    onChange={(event) => updateDocumentStatus(document, event.target.value)}
                    disabled={savingDocumentId === document.id || !stage?.id}
                    className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-700 disabled:opacity-60"
                  >
                    {['Enviado', 'Em analise', 'Pendente', 'Aprovado', 'Reprovado', 'Erro'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
            {!documents.length && (
              <p className="py-3 text-sm text-slate-500">
                {stage?.id ? 'Nenhum documento enviado para este estagio.' : 'O aluno ainda nao possui estagio cadastrado.'}
              </p>
            )}
          </div>
          {documentFeedback && (
            <p className={`mt-3 rounded-md p-3 text-sm font-semibold ${documentFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {documentFeedback.message}
            </p>
          )}
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-slate-900">Seguro do estagio</p>
          <p className="mt-2 text-sm text-slate-600">
            Registre a apolice, a vigencia e o status. O aluno vera estas informacoes no perfil.
          </p>
          <form className="mt-4 space-y-3" onSubmit={saveInsurance}>
            <label className="block text-xs font-black uppercase text-slate-500">
              Seguradora
              <input
                value={insuranceForm.seguradora}
                onChange={(event) => setInsuranceForm((current) => ({ ...current, seguradora: event.target.value }))}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-normal normal-case text-slate-800"
              />
            </label>
            <label className="block text-xs font-black uppercase text-slate-500">
              Apolice
              <input
                value={insuranceForm.apolice}
                onChange={(event) => setInsuranceForm((current) => ({ ...current, apolice: event.target.value }))}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-normal normal-case text-slate-800"
              />
            </label>
            <label className="block text-xs font-black uppercase text-slate-500">
              Cobertura
              <input
                value={insuranceForm.cobertura}
                onChange={(event) => setInsuranceForm((current) => ({ ...current, cobertura: event.target.value }))}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-normal normal-case text-slate-800"
              />
            </label>
            <label className="block text-xs font-black uppercase text-slate-500">
              Status do seguro
              <select
                value={insuranceForm.status}
                onChange={(event) => setInsuranceForm((current) => ({ ...current, status: event.target.value }))}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal normal-case text-slate-800"
              >
                {['Pendente', 'Em analise', 'Aprovado', 'Reprovado', 'Ativo', 'Vigente', 'Aguardando envio'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-black uppercase text-slate-500">
                Inicio da vigencia
                <input
                  type="date"
                  value={insuranceForm.vigencia_inicio}
                  onChange={(event) => setInsuranceForm((current) => ({ ...current, vigencia_inicio: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-2 text-sm font-normal text-slate-800"
                />
              </label>
              <label className="block text-xs font-black uppercase text-slate-500">
                Fim da vigencia
                <input
                  type="date"
                  value={insuranceForm.vigencia_fim}
                  onChange={(event) => setInsuranceForm((current) => ({ ...current, vigencia_fim: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-2 text-sm font-normal text-slate-800"
                />
              </label>
            </div>
            <label className="block text-xs font-black uppercase text-slate-500">
              Observacao
              <textarea
                rows={2}
                value={insuranceForm.observacao}
                onChange={(event) => setInsuranceForm((current) => ({ ...current, observacao: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 p-3 text-sm font-normal normal-case text-slate-800"
              />
            </label>
            {insuranceFeedback && (
              <p className={`rounded-md p-3 text-sm font-semibold ${insuranceFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {insuranceFeedback.message}
              </p>
            )}
            <button
              type="submit"
              disabled={savingInsurance || !selectedStudentId}
              className="h-10 rounded-md bg-brand-800 px-4 text-sm font-black text-white disabled:opacity-60"
            >
              {savingInsurance ? 'Salvando...' : 'Salvar seguro'}
            </button>
          </form>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-slate-900">Aluno trabalhador</p>
          <p className="mt-2 text-sm text-slate-600">
            Verifique se o cargo na carteira de trabalho e correlato com o curso designado.
          </p>
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <Field label="Cargo informado" value="Assistente de desenvolvimento de sistemas" />
          </div>
          {decisionFeedback && (
            <p
              className={`mt-4 rounded-xl p-3 text-sm font-semibold ${
                decisionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {decisionFeedback.message}
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => saveWorkerStudentDecision('aceito')}
              disabled={savingDecision || !stage?.id}
              className={`h-10 rounded-md text-sm font-black ${
                decision === 'aceito' ? 'bg-brand-800 text-white' : 'border border-slate-300 bg-white text-slate-700'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Aprovar
            </button>
            <button
              type="button"
              onClick={() => saveWorkerStudentDecision('negado')}
              disabled={savingDecision || !stage?.id}
              className={`h-10 rounded-md text-sm font-black ${
                decision === 'negado' ? 'bg-brand-800 text-white' : 'border border-slate-300 bg-white text-slate-700'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Reprovar
            </button>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Status: {savingDecision ? 'Salvando...' : workerStudentLabel[decision] || decision}
          </p>
        </section>
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Carta de apresentacao</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Enviar para o aluno</h2>
          </div>
          <span className="rounded-sm bg-brand-50 px-3 py-1 text-[10px] font-black uppercase text-brand-800">
            {letterSent ? 'Enviada' : 'Pendente'}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-black text-slate-700">Digite a mensagem da carta</span>
            <textarea
              value={presentationLetter}
              onChange={(event) => setPresentationLetter(event.target.value)}
              rows={6}
              placeholder="Prezados, segue a carta de apresentação..."
              className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-900">Upload ou digitalizacao</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer rounded-md bg-brand-800 px-4 py-2 text-xs font-black text-white">
                Selecionar arquivo
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => setPresentationFile(event.target.files?.[0] || null)}
                />
              </label>
              <label className="inline-flex cursor-pointer rounded-md border border-brand-800 px-4 py-2 text-xs font-black text-brand-800">
                Digitalizar
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => setPresentationFile(event.target.files?.[0] || null)}
                />
              </label>
            </div>
            {presentationFile && (
              <p className="mt-3 break-all text-xs font-semibold text-slate-600">Arquivo: {presentationFile.name}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handlePresentationSend}
            className="w-full rounded-md bg-brand-800 px-5 py-3 text-sm font-black text-white"
          >
            Enviar carta de apresentacao
          </button>
        </div>
      </section>
    </section>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stage, setStage] = useState(null);
  const [stages, setStages] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [insurance, setInsurance] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const isCoordination = user?.tipo === 'coordenacao';
        const insuranceRequest = user?.tipo === 'aluno'
          ? api.get('/info/seguro/me').catch((requestError) => {
              if (requestError.response?.status === 404) return { data: null };
              throw requestError;
            })
          : Promise.resolve({ data: null });
        const usersRequest = isCoordination ? api.get('/info/usuarios?tipo=aluno') : Promise.resolve({ data: [] });
        const [profileResponse, stagesResponse, insuranceResponse, usersResponse] = await Promise.all([
          api.get('/alunos/me'),
          api.get('/estagios'),
          insuranceRequest,
          usersRequest,
        ]);
        const loadedStages = stagesResponse.data || [];
        const firstStage = loadedStages[0] || null;
        const loadedStudents = usersResponse.data || [];
        setProfile(profileResponse.data || null);
        setStages(loadedStages);
        setStudents(loadedStudents);
        setSelectedStudentId((current) => current || loadedStudents[0]?.id || null);
        setStage(firstStage);
        setInsurance(insuranceResponse.data || null);

        if (firstStage?.id) {
          const documentsResponse = await api.get(`/estagios/${firstStage.id}/documentos`);
          setDocumentList(documentsResponse.data || []);
        } else {
          setDocumentList([]);
        }
      } catch (err) {
        setError(err.message || 'Nao foi possivel carregar os dados do perfil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.tipo]);

  useEffect(() => {
    if (user?.tipo !== 'coordenacao' || !selectedStudentId) return;

    let cancelled = false;
    const selectedStage = stages.find((item) => item.aluno_id === selectedStudentId) || null;
    setStage(selectedStage);
    setInsurance(null);
    setDocumentList([]);
    setError(null);

    const loadStudentRecords = async () => {
      try {
        const [insuranceResponse, documentsResponse] = await Promise.all([
          api.get(`/info/seguro/${selectedStudentId}`),
          selectedStage?.id
            ? api.get(`/estagios/${selectedStage.id}/documentos`)
            : Promise.resolve({ data: [] }),
        ]);
        if (cancelled) return;
        setInsurance(insuranceResponse.data || null);
        setDocumentList(documentsResponse.data || []);
      } catch (error) {
        if (!cancelled) {
          setError(error.message || 'Nao foi possivel carregar os dados do aluno.');
          setInsurance(null);
          setDocumentList([]);
        }
      }
    };

    loadStudentRecords();
    return () => {
      cancelled = true;
    };
  }, [selectedStudentId, stages, user?.tipo]);

  const handleWorkerStudentUpdate = (updatedStage) => {
    setStages((currentStages) =>
      currentStages.map((item) => (item.id === updatedStage.id ? { ...item, ...updatedStage } : item))
    );
    setStage((currentStage) => (currentStage?.id === updatedStage.id ? { ...currentStage, ...updatedStage } : currentStage));
  };

  const handleInsuranceUpdate = (updatedInsurance) => {
    setInsurance(updatedInsurance);
  };

  const handleDocumentUpdate = (updatedDocument) => {
    setDocumentList((currentDocuments) =>
      currentDocuments.map((document) => document.id === updatedDocument.id ? updatedDocument : document)
    );
  };

  const handleStageUpdate = (updatedStage) => {
    setStages((currentStages) =>
      currentStages.map((item) => item.id === updatedStage.id ? { ...item, ...updatedStage } : item)
    );
    setStage((currentStage) => (currentStage?.id === updatedStage.id ? { ...currentStage, ...updatedStage } : currentStage));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:flex lg:pb-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        {error && <p className="mx-auto mb-4 max-w-6xl rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        {loading ? (
          <p className="mx-auto max-w-6xl rounded-md border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600 shadow-sm">
            Carregando perfil...
          </p>
        ) : user?.tipo === 'coordenacao' ? (
          <CoordinationProfile
            stage={stage}
            documents={documentList}
            insurance={insurance}
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            onWorkerStudentUpdate={handleWorkerStudentUpdate}
            onInsuranceUpdate={handleInsuranceUpdate}
            onDocumentUpdate={handleDocumentUpdate}
            onStageUpdate={handleStageUpdate}
          />
        ) : (
          <StudentProfile user={user} profile={profile} stage={stage} documents={documentList} insurance={insurance} />
        )}
      </main>
    </div>
  );
};

export default Profile;
