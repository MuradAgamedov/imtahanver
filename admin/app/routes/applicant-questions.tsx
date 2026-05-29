import { useState, useEffect, useRef } from "react";
import { Link, useLoaderData, useActionData, useNavigation, useSubmit, redirect } from "react-router";
import type { Route } from "./+types/applicant-questions";
import { sessionCookie, type AdminSession } from "../lib/session";
import { RichTextEditor } from "../components/RichTextEditor";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

const TYPE_INFO = [
  { type: 1, label: "Qapalı tip",                  desc: "Cavab variantları olan sual",     max: 22, dot: "bg-indigo-500",  badge: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { type: 2, label: "Kodlaşdırıla bilən açıq",      desc: "Cavab yoxdur, yalnız sual mətni", max: 5,  dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { type: 3, label: "Yazılı açıq tipli",            desc: "Cavab yoxdur, yalnız sual mətni", max: 3,  dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700 border-amber-200" },
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
  const isProd = true;
  const storageBase = isProd ? "https://api.imtahanver.online" : "http://localhost:8000";

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
    exampage, group, subject,
    questions: qData.success ? qData.data : [],
    counts: qData.counts ?? { 1: 0, 2: 0, 3: 0 },
    limits: qData.limits ?? { 1: 22, 2: 5, 3: 3 },
    exampageId: id, groupId, subjectId,
    storageBase,
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
        body: JSON.stringify({
          question_type: Number(formData.get("question_type")),
          title: formData.get("title"),
          image: formData.get("image") || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual əlavə edilmədi." };
      return { success: "Sual uğurla əlavə edildi.", intent };
    }
    if (intent === "update-question") {
      const qId = formData.get("question_id") as string;
      const res = await fetch(`${base}/${qId}`, {
        method: "POST", headers,
        body: JSON.stringify({ title: formData.get("title"), image: formData.get("image") || null }),
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

function ImageUploader({ storageBase, current, onChange }: {
  storageBase: string; current: string; onChange: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      // Upload through admin server to avoid CORS
      const res = await fetch("/api/upload-applicant-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) onChange(data.path);
    } catch { /* noop */ }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Şəkil (İstəyə bağlı)</label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 transition-all cursor-pointer disabled:opacity-50">
          <svg className={`h-4 w-4 ${uploading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {uploading
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            }
          </svg>
          {uploading ? "Yüklənir..." : current ? "Dəyiş" : "Şəkil seç"}
        </button>
        {current && (
          <button type="button" onClick={() => onChange("")}
            className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer">Sil</button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      </div>
      {current && (
        <img src={`${storageBase}/${current.replace(/^\/+/, "")}`} alt="Sual şəkli"
          className="mt-2 max-h-40 rounded-xl border border-gray-200 object-contain bg-gray-50" />
      )}
    </div>
  );
}

export default function ApplicantQuestionsPage() {
  const { exampage, group, subject, questions, counts, limits, exampageId, groupId, subjectId, storageBase } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState<"type" | "form">("type");
  const [selectedType, setSelectedType] = useState(1);
  const [addTitle, setAddTitle] = useState("");
  const [addImage, setAddImage] = useState("");

  const [editingQ, setEditingQ] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editImage, setEditImage] = useState("");

  const [deletingQ, setDeletingQ] = useState<any>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [addingOptionFor, setAddingOptionFor] = useState<number | null>(null);
  const [newOptText, setNewOptText] = useState("");
  const [newOptTrue, setNewOptTrue] = useState(false);
  const [editingOpt, setEditingOpt] = useState<any>(null);
  const [editOptText, setEditOptText] = useState("");
  const [editOptTrue, setEditOptTrue] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (actionData?.success) {
      setToast({ msg: actionData.success, type: "success" });
      setShowAddModal(false); setAddStep("type"); setAddTitle(""); setAddImage("");
      setEditingQ(null); setDeletingQ(null);
      setAddingOptionFor(null); setNewOptText(""); setEditingOpt(null);
    } else if (actionData?.error) {
      setToast({ msg: actionData.error, type: "error" });
    }
  }, [actionData]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  const grouped: Record<number, any[]> = {
    1: questions.filter((q: any) => q.question_type === 1),
    2: questions.filter((q: any) => q.question_type === 2),
    3: questions.filter((q: any) => q.question_type === 3),
  };

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
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border shadow-xl text-sm font-semibold ${
          toast.type === "success" ? "bg-emerald-950/95 text-emerald-200 border-emerald-900/60" : "bg-red-950/95 text-red-200 border-red-900/60"
        }`}>{toast.msg}</div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
        <Link to="/applicant-exampages" className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors">Vərəqlər</Link>
        <span className="text-gray-300 text-xs">/</span>
        <Link to={`/applicant-exampages/${exampageId}/groups`} className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors">{exampage.title}</Link>
        <span className="text-gray-300 text-xs">/</span>
        <Link to={`/applicant-exampages/${exampageId}/groups/${groupId}/subjects`} className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors">Qrup {group.title}</Link>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-xs font-bold text-gray-900">{subject.title}</span>
        <div className="ml-auto">
          <button onClick={() => { setShowAddModal(true); setAddStep("type"); setAddTitle(""); setAddImage(""); }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-sm cursor-pointer transition-all">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Sual Əlavə Et
          </button>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-4">
        {TYPE_INFO.map((t) => (
          <div key={t.type} className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 leading-tight">{t.label}</p>
              <p className="text-xl font-extrabold mt-0.5">
                <span className={(counts as any)[t.type] >= t.max ? "text-red-500" : "text-gray-900"}>
                  {(counts as any)[t.type]}
                </span>
                <span className="text-xs font-semibold text-gray-400"> / {t.max}</span>
              </p>
            </div>
            <div className={`h-3 w-3 rounded-full ${t.dot}`} />
          </div>
        ))}
      </div>

      {/* Questions by type */}
      {TYPE_INFO.map(({ type, label, dot, badge }) => (
        <section key={type}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-2.5 w-2.5 rounded-full ${dot}`} />
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
                <div key={q.id} className={`rounded-2xl border bg-white shadow-sm overflow-hidden`}>
                  <div className={`flex items-start justify-between gap-3 p-4 border-l-4 ${
                    type === 1 ? "border-l-indigo-400" : type === 2 ? "border-l-emerald-400" : "border-l-amber-400"
                  }`}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 leading-relaxed [&_i]:italic [&_b]:font-bold [&_u]:underline"
                          dangerouslySetInnerHTML={{ __html: q.title }} />
                        {q.image && (
                          <img src={`${storageBase}/${q.image.replace(/^\/+/, "")}`} alt=""
                            className="mt-2 max-h-36 rounded-xl border border-gray-100 object-contain bg-gray-50" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {type === 1 && (
                        <button onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)} title="Cavabları göstər"
                          className="rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-500 hover:bg-indigo-50 cursor-pointer">
                          {expandedQ === q.id ? "▲" : "▼"}
                        </button>
                      )}
                      <button onClick={() => { setEditingQ(q); setEditTitle(q.title); setEditImage(q.image ?? ""); }}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-50 hover:text-indigo-600 cursor-pointer">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeletingQ(q)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Options for type 1 */}
                  {type === 1 && expandedQ === q.id && (
                    <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-2">
                      {(q.options ?? []).map((opt: any, oIdx: number) => (
                        <div key={opt.id} className={`flex items-start justify-between gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                          opt.is_true ? "border-emerald-300 bg-emerald-50 font-semibold" : "border-gray-200 bg-white"
                        }`}>
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold mt-0.5 ${
                              opt.is_true ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 text-gray-500"
                            }`}>{OPTION_LABELS[oIdx] ?? oIdx + 1}</span>
                            {editingOpt?.id === opt.id ? (
                              <div className="flex-1 space-y-2">
                                <textarea value={editOptText} onChange={(e) => setEditOptText(e.target.value)} rows={2}
                                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none resize-none" />
                                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                  <input type="checkbox" checked={editOptTrue} onChange={(e) => setEditOptTrue(e.target.checked)} className="accent-emerald-500" />
                                  Düzgün cavab
                                </label>
                                <div className="flex gap-2">
                                  <button onClick={() => { const fd = new FormData(); fd.append("intent","update-option"); fd.append("question_id",String(q.id)); fd.append("option_id",String(opt.id)); fd.append("text",editOptText); fd.append("is_true",String(editOptTrue)); submit(fd,{method:"post"}); }}
                                    className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg cursor-pointer">Saxla</button>
                                  <button onClick={() => setEditingOpt(null)} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg cursor-pointer">İmtina</button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm leading-relaxed [&_i]:italic [&_b]:font-bold" dangerouslySetInnerHTML={{ __html: opt.text }} />
                            )}
                          </div>
                          {editingOpt?.id !== opt.id && (
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => { setEditingOpt(opt); setEditOptText(opt.text); setEditOptTrue(opt.is_true); }}
                                className="p-1 text-gray-400 hover:text-indigo-600 cursor-pointer">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => { const fd = new FormData(); fd.append("intent","delete-option"); fd.append("question_id",String(q.id)); fd.append("option_id",String(opt.id)); submit(fd,{method:"post"}); }}
                                className="p-1 text-gray-400 hover:text-red-500 cursor-pointer">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {addingOptionFor === q.id ? (
                        <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                          <textarea value={newOptText} onChange={(e) => setNewOptText(e.target.value)} rows={2}
                            placeholder="Cavab mətni (HTML dəstəklənir)"
                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none resize-none" />
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input type="checkbox" checked={newOptTrue} onChange={(e) => setNewOptTrue(e.target.checked)} className="accent-emerald-500" />
                            Düzgün cavab
                          </label>
                          <div className="flex gap-2">
                            <button onClick={() => { const fd = new FormData(); fd.append("intent","add-option"); fd.append("question_id",String(q.id)); fd.append("text",newOptText); fd.append("is_true",String(newOptTrue)); submit(fd,{method:"post"}); setNewOptText(""); setNewOptTrue(false); }}
                              disabled={!newOptText.trim()}
                              className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg cursor-pointer disabled:opacity-50">Əlavə Et</button>
                            <button onClick={() => setAddingOptionFor(null)} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg cursor-pointer">İmtina</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setAddingOptionFor(q.id); setNewOptText(""); setNewOptTrue(false); }}
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
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            {addStep === "type" ? (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-base font-bold text-gray-900">Sual Tipi Seçin</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                </div>
                <div className="space-y-3">
                  {TYPE_INFO.map((t) => {
                    const curr = (counts as any)[t.type];
                    const full = curr >= t.max;
                    return (
                      <button key={t.type} disabled={full}
                        onClick={() => { setSelectedType(t.type); setAddStep("form"); }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          full ? "border-gray-200 bg-gray-50" : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50"
                        }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
                            <p className="text-sm font-bold text-gray-900">{t.label}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 ml-4">{t.desc}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${full ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                          {curr}/{t.max}
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
                    <h3 className="text-base font-bold text-gray-900">{TYPE_INFO.find(t => t.type === selectedType)?.label}</h3>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sualın Mətni</label>
                    <RichTextEditor value={addTitle} onChange={setAddTitle} placeholder="Sual mətni..." />
                  </div>
                  <ImageUploader storageBase={storageBase} current={addImage} onChange={setAddImage} />
                  <div className="flex gap-3 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddModal(false)}
                      className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
                    <button type="button" disabled={!addTitle.trim() || navigation.state === "submitting"}
                      onClick={() => { const fd = new FormData(); fd.append("intent","create-question"); fd.append("question_type",String(selectedType)); fd.append("title",addTitle); fd.append("image",addImage); submit(fd,{method:"post"}); }}
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
      {editingQ && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Sualı Redaktə Et</h3>
              <button onClick={() => setEditingQ(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sualın Mətni</label>
                <RichTextEditor value={editTitle} onChange={setEditTitle} />
              </div>
              <ImageUploader storageBase={storageBase} current={editImage} onChange={setEditImage} />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setEditingQ(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
                <button disabled={!editTitle.trim() || navigation.state === "submitting"}
                  onClick={() => { const fd = new FormData(); fd.append("intent","update-question"); fd.append("question_id",String(editingQ.id)); fd.append("title",editTitle); fd.append("image",editImage); submit(fd,{method:"post"}); }}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50">Yadda Saxla</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deletingQ && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Sualı Sil</h3>
            <p className="text-sm text-gray-500">Bu sual{deletingQ.question_type === 1 ? " və bütün cavabları" : ""} silinəcək.</p>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setDeletingQ(null)} className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
              <button onClick={() => { const fd = new FormData(); fd.append("intent","delete-question"); fd.append("question_id",String(deletingQ.id)); submit(fd,{method:"post"}); }}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
