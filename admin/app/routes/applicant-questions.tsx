import { useState, useEffect } from "react";
import { Link, useLoaderData, useActionData, useNavigation, useSubmit, redirect } from "react-router";
import type { Route } from "./+types/applicant-questions";
import { sessionCookie, type AdminSession } from "../lib/session";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

const TYPE_INFO = [
  { type: 1, label: "Qapalı tip", desc: "Cavab variantları olan sual", max: 22, color: "indigo" },
  { type: 2, label: "Kodlaşdırıla bilən açıq", desc: "Cavab yoxdur, yalnız sual mətni", max: 5, color: "emerald" },
  { type: 3, label: "Yazılı açıq tipli", desc: "Cavab yoxdur, yalnız sual mətni", max: 3, color: "amber" },
];

export function meta({ data }: Route.MetaArgs) {
  const d = data as any;
  return [{ title: d?.subject ? `${d.subject.title} — Suallar` : "Suallar — Admin" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const { id, groupId, subjectId } = params;
  const headers = { Accept: "application/json", Authorization: `Bearer ${session.token}` };

  const [epRes, grRes, qRes] = await Promise.all([
    fetch("http://backend:80/api/adminapi/applicant-exampages", { headers }),
    fetch("http://backend:80/api/adminapi/applicant-groups", { headers }),
    fetch(`http://backend:80/api/adminapi/applicant-exampages/${id}/groups/${groupId}/subjects/${subjectId}/questions`, { headers }),
  ]);

  const [epData, grData, qData] = await Promise.all([epRes.json(), grRes.json(), qRes.json()]);

  const exampage = epData.success ? epData.data.find((e: any) => e.id === Number(id)) ?? null : null;
  const group = grData.success ? grData.data.find((g: any) => g.id === Number(groupId)) ?? null : null;
  const subject = group?.subjects?.find((s: any) => s.id === Number(subjectId)) ?? null;

  return {
    exampage,
    group,
    subject,
    questions: qData.success ? qData.data : [],
    counts: qData.counts ?? { 1: 0, 2: 0, 3: 0 },
    limits: qData.limits ?? { 1: 22, 2: 5, 3: 3 },
    exampageId: id,
    groupId,
    subjectId,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const { id, groupId, subjectId } = params;
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const headers = { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${session.token}` };
  const base = `http://backend:80/api/adminapi/applicant-exampages/${id}/groups/${groupId}/subjects/${subjectId}/questions`;

  try {
    if (intent === "create-question") {
      const res = await fetch(base, {
        method: "POST", headers,
        body: JSON.stringify({ question_type: Number(formData.get("question_type")), title: formData.get("title") }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual əlavə edilmədi." };
      return { success: "Sual uğurla əlavə edildi.", intent };
    }

    if (intent === "update-question") {
      const qId = formData.get("question_id") as string;
      const res = await fetch(`${base}/${qId}`, {
        method: "POST", headers,
        body: JSON.stringify({ title: formData.get("title") }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual yenilənmədi." };
      return { success: "Sual yeniləndi.", intent };
    }

    if (intent === "delete-question") {
      const qId = formData.get("question_id") as string;
      const res = await fetch(`${base}/${qId}`, { method: "DELETE", headers });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual silinmədi." };
      return { success: "Sual silindi.", intent };
    }

    if (intent === "add-option") {
      const qId = formData.get("question_id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/applicant-questions/${qId}/options`, {
        method: "POST", headers,
        body: JSON.stringify({ text: formData.get("text"), is_true: formData.get("is_true") === "true" }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Cavab əlavə edilmədi." };
      return { success: "Cavab əlavə edildi.", intent };
    }

    if (intent === "update-option") {
      const qId = formData.get("question_id") as string;
      const oId = formData.get("option_id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/applicant-questions/${qId}/options/${oId}`, {
        method: "PUT", headers,
        body: JSON.stringify({ text: formData.get("text"), is_true: formData.get("is_true") === "true" }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Cavab yenilənmədi." };
      return { success: "Cavab yeniləndi.", intent };
    }

    if (intent === "delete-option") {
      const qId = formData.get("question_id") as string;
      const oId = formData.get("option_id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/applicant-questions/${qId}/options/${oId}`, {
        method: "DELETE", headers,
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Cavab silinmədi." };
      return { success: "Cavab silindi.", intent };
    }

  } catch {
    return { error: "Xəta baş verdi." };
  }
  return {};
}

const TYPE_COLORS: Record<number, string> = {
  1: "bg-indigo-50 text-indigo-700 border-indigo-200",
  2: "bg-emerald-50 text-emerald-700 border-emerald-200",
  3: "bg-amber-50 text-amber-700 border-amber-200",
};
const TYPE_DOT: Record<number, string> = {
  1: "bg-indigo-500",
  2: "bg-emerald-500",
  3: "bg-amber-500",
};

export default function ApplicantQuestionsPage() {
  const { exampage, group, subject, questions, counts, limits, exampageId, groupId, subjectId } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState<"type" | "form">("type");
  const [selectedType, setSelectedType] = useState<number>(1);
  const [addTitle, setAddTitle] = useState("");

  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");

  const [deletingQuestion, setDeletingQuestion] = useState<any>(null);

  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [addingOptionFor, setAddingOptionFor] = useState<number | null>(null);
  const [newOptionText, setNewOptionText] = useState("");
  const [newOptionIsTrue, setNewOptionIsTrue] = useState(false);
  const [editingOption, setEditingOption] = useState<any>(null);
  const [editOptionText, setEditOptionText] = useState("");
  const [editOptionIsTrue, setEditOptionIsTrue] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (actionData?.success) {
      setToast({ msg: actionData.success, type: "success" });
      setShowAddModal(false);
      setAddStep("type");
      setAddTitle("");
      setEditingQuestion(null);
      setDeletingQuestion(null);
      setAddingOptionFor(null);
      setNewOptionText("");
      setEditingOption(null);
    } else if (actionData?.error) {
      setToast({ msg: actionData.error, type: "error" });
    }
  }, [actionData]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  const grouped = {
    1: questions.filter((q: any) => q.question_type === 1),
    2: questions.filter((q: any) => q.question_type === 2),
    3: questions.filter((q: any) => q.question_type === 3),
  } as Record<number, any[]>;

  if (!exampage || !group || !subject) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Məlumat tapılmadı.</p>
        <Link to="/applicant-exampages" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">Geri qayıt</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl ${
          toast.type === "success" ? "bg-emerald-950/95 text-emerald-200 border-emerald-900/60" : "bg-red-950/95 text-red-200 border-red-900/60"
        }`}>
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
        <Link to="/applicant-exampages" className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors">Vərəqlər</Link>
        <span className="text-gray-300 text-xs">/</span>
        <Link to={`/applicant-exampages/${exampageId}/groups`} className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors">{exampage.title}</Link>
        <span className="text-gray-300 text-xs">/</span>
        <Link to={`/applicant-exampages/${exampageId}/groups/${groupId}/subjects`} className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors">Qrup {group.title}</Link>
        <span className="text-gray-300 text-xs">/</span>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-900">{subject.title}</h2>
          <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">Suallar</span>
        </div>
        <div className="ml-auto">
          <button onClick={() => { setShowAddModal(true); setAddStep("type"); setAddTitle(""); }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-sm cursor-pointer transition-all">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Sual Əlavə Et
          </button>
        </div>
      </div>

      {/* Type counters */}
      <div className="grid grid-cols-3 gap-4">
        {TYPE_INFO.map((t) => (
          <div key={t.type} className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">{t.label}</p>
              <p className="text-xl font-extrabold text-gray-900 mt-0.5">
                <span className={(counts as any)[t.type] >= t.max ? "text-red-500" : "text-gray-900"}>
                  {(counts as any)[t.type]}
                </span>
                <span className="text-xs font-semibold text-gray-400"> / {t.max}</span>
              </p>
            </div>
            <div className={`h-3 w-3 rounded-full ${TYPE_DOT[t.type]}`} />
          </div>
        ))}
      </div>

      {/* Questions by type */}
      {TYPE_INFO.map(({ type, label }) => (
        <section key={type}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-2.5 w-2.5 rounded-full ${TYPE_DOT[type]}`} />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{label}</h3>
            <span className="text-xs text-gray-400">({grouped[type].length} / {(limits as any)[type]})</span>
          </div>

          {grouped[type].length === 0 ? (
            <div className="py-8 text-center bg-white border border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs">
              Hələ sual yoxdur
            </div>
          ) : (
            <div className="space-y-3">
              {grouped[type].map((q: any, idx: number) => (
                <div key={q.id} className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all ${TYPE_COLORS[type]}`}>
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-white/80 text-xs font-bold text-gray-600 border border-current/20">
                        {idx + 1}
                      </span>
                      <div
                        className="text-sm font-medium text-gray-900 leading-relaxed [&_i]:italic [&_b]:font-bold [&_u]:underline whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: q.title }}
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {type === 1 && (
                        <button onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                          title="Cavabları idarə et"
                          className="rounded-lg p-1.5 text-current/60 hover:bg-white/50 transition-colors cursor-pointer text-xs font-bold">
                          {expandedQuestion === q.id ? "▲" : "▼"}
                        </button>
                      )}
                      <button onClick={() => { setEditingQuestion(q); setEditTitle(q.title); }}
                        className="rounded-lg p-1.5 text-current/60 hover:bg-white/50 transition-colors cursor-pointer">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeletingQuestion(q)}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 transition-colors cursor-pointer">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Options for type 1 */}
                  {type === 1 && expandedQuestion === q.id && (
                    <div className="border-t border-current/10 bg-white/60 p-4 space-y-2">
                      {(q.options ?? []).map((opt: any, oIdx: number) => (
                        <div key={opt.id} className={`flex items-start justify-between gap-2 px-3 py-2 rounded-xl border text-sm ${
                          opt.is_true ? "border-emerald-400 bg-emerald-50 font-semibold" : "border-gray-200 bg-white"
                        }`}>
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold ${
                              opt.is_true ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 text-gray-500"
                            }`}>
                              {OPTION_LABELS[oIdx] ?? oIdx + 1}
                            </span>
                            {editingOption?.id === opt.id ? (
                              <div className="flex-1 space-y-2">
                                <textarea value={editOptionText} onChange={(e) => setEditOptionText(e.target.value)} rows={2}
                                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-400" />
                                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                  <input type="checkbox" checked={editOptionIsTrue} onChange={(e) => setEditOptionIsTrue(e.target.checked)} className="accent-emerald-500" />
                                  Düzgün cavab
                                </label>
                                <div className="flex gap-2">
                                  <button onClick={() => {
                                    const fd = new FormData(); fd.append("intent", "update-option"); fd.append("question_id", String(q.id)); fd.append("option_id", String(opt.id)); fd.append("text", editOptionText); fd.append("is_true", String(editOptionIsTrue));
                                    submit(fd, { method: "post" });
                                  }} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg cursor-pointer">Yadda Saxla</button>
                                  <button onClick={() => setEditingOption(null)} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg cursor-pointer">İmtina</button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm leading-relaxed [&_i]:italic [&_b]:font-bold" dangerouslySetInnerHTML={{ __html: opt.text }} />
                            )}
                          </div>
                          {editingOption?.id !== opt.id && (
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => { setEditingOption(opt); setEditOptionText(opt.text); setEditOptionIsTrue(opt.is_true); }}
                                className="p-1 text-gray-400 hover:text-indigo-600 cursor-pointer">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => { const fd = new FormData(); fd.append("intent", "delete-option"); fd.append("question_id", String(q.id)); fd.append("option_id", String(opt.id)); submit(fd, { method: "post" }); }}
                                className="p-1 text-gray-400 hover:text-red-500 cursor-pointer">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add option inline */}
                      {addingOptionFor === q.id ? (
                        <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                          <textarea value={newOptionText} onChange={(e) => setNewOptionText(e.target.value)} rows={2} placeholder="Cavab mətni (HTML dəstəklənir)"
                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-400" />
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input type="checkbox" checked={newOptionIsTrue} onChange={(e) => setNewOptionIsTrue(e.target.checked)} className="accent-emerald-500" />
                            Düzgün cavab
                          </label>
                          <div className="flex gap-2">
                            <button onClick={() => {
                              const fd = new FormData(); fd.append("intent", "add-option"); fd.append("question_id", String(q.id)); fd.append("text", newOptionText); fd.append("is_true", String(newOptionIsTrue));
                              submit(fd, { method: "post" }); setNewOptionText(""); setNewOptionIsTrue(false);
                            }} disabled={!newOptionText.trim()} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg cursor-pointer disabled:opacity-50">Əlavə Et</button>
                            <button onClick={() => setAddingOptionFor(null)} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg cursor-pointer">İmtina</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setAddingOptionFor(q.id); setNewOptionText(""); setNewOptionIsTrue(false); }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1 cursor-pointer">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                          Cavab əlavə et
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* ── ADD QUESTION MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            {addStep === "type" ? (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-base font-bold text-gray-900">Sual Tipi Seçin</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                </div>
                <div className="space-y-3">
                  {TYPE_INFO.map((t) => {
                    const current = (counts as any)[t.type];
                    const full = current >= t.max;
                    return (
                      <button key={t.type} disabled={full}
                        onClick={() => { setSelectedType(t.type); setAddStep("form"); }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          full ? "border-gray-200 bg-gray-50" : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50"
                        }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${TYPE_DOT[t.type]}`} />
                            <p className="text-sm font-bold text-gray-900">{t.label}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 ml-4">{t.desc}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${full ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                          {current}/{t.max}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAddStep("type")} className="text-gray-400 hover:text-indigo-600 cursor-pointer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h3 className="text-base font-bold text-gray-900">
                      {TYPE_INFO.find(t => t.type === selectedType)?.label}
                    </h3>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Sualın Mətni {selectedType === 1 ? "" : "(HTML dəstəklənir)"}
                    </label>
                    <textarea value={addTitle} onChange={(e) => setAddTitle(e.target.value)} rows={5} required
                      placeholder="Sual mətni..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-mono resize-none" />
                    <p className="text-xs text-gray-400 mt-1">HTML teqləri: &lt;i&gt;, &lt;b&gt;, &lt;u&gt; dəstəklənir</p>
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddModal(false)}
                      className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
                    <button type="button" disabled={!addTitle.trim() || navigation.state === "submitting"}
                      onClick={() => {
                        const fd = new FormData(); fd.append("intent", "create-question"); fd.append("question_type", String(selectedType)); fd.append("title", addTitle);
                        submit(fd, { method: "post" });
                      }}
                      className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50">
                      {navigation.state === "submitting" ? "Əlavə edilir..." : "Əlavə Et"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── EDIT QUESTION MODAL ── */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Sualı Redaktə Et</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-4">
              <textarea value={editTitle} onChange={(e) => setEditTitle(e.target.value)} rows={5}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-mono resize-none" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setEditingQuestion(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
                <button disabled={!editTitle.trim() || navigation.state === "submitting"}
                  onClick={() => {
                    const fd = new FormData(); fd.append("intent", "update-question"); fd.append("question_id", String(editingQuestion.id)); fd.append("title", editTitle);
                    submit(fd, { method: "post" });
                  }}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50">Yadda Saxla</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE QUESTION CONFIRM ── */}
      {deletingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Sualı Sil</h3>
            <p className="text-sm text-gray-500">Bu sual{deletingQuestion.question_type === 1 ? " və bütün cavabları" : ""} silinəcək. Davam etmək istəyirsiniz?</p>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setDeletingQuestion(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
              <button onClick={() => { const fd = new FormData(); fd.append("intent", "delete-question"); fd.append("question_id", String(deletingQuestion.id)); submit(fd, { method: "post" }); }}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
