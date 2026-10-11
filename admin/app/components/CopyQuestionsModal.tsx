import { useState, useEffect } from "react";

interface CopyQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCopy: (questionIds: number[]) => void;
  isSubmitting: boolean;
  examType: "magistratura" | "buraxilis" | "applicant" | "miq";
  allExampages: any[];
  currentExampageId: number | string;
  subjectId?: number | string;
  groupId?: number | string;
  questionTypeId?: number | string;
  storageBase?: string;
}

export function CopyQuestionsModal({
  isOpen,
  onClose,
  onSubmitCopy,
  isSubmitting,
  examType,
  allExampages,
  currentExampageId,
  subjectId,
  groupId,
  questionTypeId,
  storageBase = "https://api.imtahanver.online",
}: CopyQuestionsModalProps) {
  const [selectedExampageId, setSelectedExampageId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filter out the current exampage so user can only pick other exampages
  const availableExampages = allExampages.filter(
    (ep) => String(ep.id) !== String(currentExampageId)
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedExampageId("");
      setQuestions([]);
      setSelectedIds(new Set());
      setLoading(false);
    }
  }, [isOpen]);

  async function handleExampageChange(newEpId: string) {
    setSelectedExampageId(newEpId);
    setSelectedIds(new Set());

    if (!newEpId) {
      setQuestions([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: examType,
        exampage_id: newEpId,
      });
      if (subjectId) params.append("subject_id", String(subjectId));
      if (groupId) params.append("group_id", String(groupId));
      if (questionTypeId) params.append("question_type_id", String(questionTypeId));

      const res = await fetch(`/api/get-source-questions?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setQuestions(data.data);
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleQuestion(id: number) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  }

  function toggleAll() {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </span>
              Digər Vərəqdən Sualları Kopyala
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Mövcud vərəqi seçin, köçürmək istədiyiniz sualları checkbox ilə işarələyin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-gray-150 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <label className="text-xs font-bold text-gray-700 whitespace-nowrap">
              Mənbə Vərəq:
            </label>
            <select
              value={selectedExampageId}
              onChange={(e) => handleExampageChange(e.target.value)}
              className="flex-1 rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">-- Vərəq seçin --</option>
              {availableExampages.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.title} ({ep.exam_duration ?? 90} dəq)
                </option>
              ))}
            </select>
          </div>

          {questions.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {selectedIds.size === questions.length ? "Seçimi ləğv et" : "Hamısını seç"}
              </button>
              <span className="text-xs font-semibold text-gray-500">
                Seçilib: <strong className="text-indigo-600">{selectedIds.size}</strong> / {questions.length}
              </span>
            </div>
          )}
        </div>

        {/* Question List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {!selectedExampageId && (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-semibold">Sualları görmək üçün yuxarıdan başqa bir vərəq seçin.</p>
            </div>
          )}

          {selectedExampageId && loading && (
            <div className="text-center py-16 text-gray-500">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold">Suallar yüklənir...</p>
            </div>
          )}

          {selectedExampageId && !loading && questions.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm font-semibold">Bu vərəqdə seçilmiş fənn üzrə sual tapılmadı.</p>
            </div>
          )}

          {selectedExampageId && !loading && questions.map((q, idx) => {
            const isChecked = selectedIds.has(q.id);
            const questionText = q.title || q.text || "(Mətn yoxdur)";
            const options = q.options || [];

            return (
              <div
                key={q.id}
                onClick={() => toggleQuestion(q.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                  isChecked
                    ? "border-indigo-500 bg-indigo-50/40 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // handled by parent onClick
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold text-gray-800">
                      № {idx + 1}
                    </span>
                    {q.question_type && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                        {q.question_type === 1 ? "Qapalı" : q.question_type === 2 ? "Açıq" : "Yazılı"}
                      </span>
                    )}
                  </div>

                  <div
                    className="text-xs text-gray-800 leading-relaxed font-medium line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: questionText }}
                  />

                  {q.image && (
                    <img
                      src={`${storageBase}/${q.image.replace(/^\/+/, "")}`}
                      alt="Question"
                      className="mt-2 h-14 w-auto rounded border object-contain bg-white"
                    />
                  )}

                  {options.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-150 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {options.map((opt: any, optIdx: number) => {
                        const label = String.fromCharCode(65 + optIdx);
                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded ${
                              opt.is_true
                                ? "bg-emerald-100 text-emerald-800 font-bold"
                                : "text-gray-600"
                            }`}
                          >
                            <span className="font-bold">{label})</span>
                            <span className="truncate">{opt.text || "(Variant)"}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-150 bg-white flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-gray-500">
            {selectedIds.size > 0
              ? `Kopyalanacaq: ${selectedIds.size} sual`
              : "Heç bir sual seçilməyib"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-gray-250 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Ləğv et
            </button>
            <button
              type="button"
              onClick={() => onSubmitCopy(Array.from(selectedIds))}
              disabled={selectedIds.size === 0 || isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Kopyalanır...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Seçilmişləri Bu Vərəqə Kopyala ({selectedIds.size})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
