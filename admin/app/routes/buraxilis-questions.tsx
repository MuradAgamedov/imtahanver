import { CopyQuestionsModal } from "../components/CopyQuestionsModal";
import { useState, useEffect, useRef, Fragment } from "react";
import { Link, useLoaderData, useActionData, useNavigation, useSubmit, redirect } from "react-router";
import { sessionCookie, type AdminSession } from "../lib/session";
import { RichTextEditor } from "../components/RichTextEditor";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

const TYPE_INFO = [
  { type: 1, label: "Qapalı tip",                  desc: "Cavab variantları olan sual",     max: 50, dot: "bg-indigo-500",  badge: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { type: 2, label: "Kodlaşdırıla bilən açıq",      desc: "Cavab yoxdur, yalnız sual mətni", max: 10, dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { type: 3, label: "Yazılı açıq tipli",            desc: "Cavab yoxdur, yalnız sual mətni", max: 5,  dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700 border-amber-200" },
];

export function meta({ data }: any) {
  const d = data as any;
  return [{ title: d?.subject ? `${d.subject.title} — Suallar` : "Suallar — Admin" }];
}

export async function loader({ request, params }: any) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const { id, subjectId } = params;
  const headers = { Accept: "application/json", Authorization: `Bearer ${session.token}` };
  const isProd = true;
  const storageBase = isProd ? "https://api.imtahanver.online" : "http://localhost:8000";

  const [epRes, subjRes, qRes, paRes] = await Promise.all([
    fetch("http://backend:80/api/adminapi/buraxilis-exampages", { headers }),
    fetch("http://backend:80/api/adminapi/buraxilis-subjects", { headers }),
    fetch(`http://backend:80/api/adminapi/buraxilis-exampages/${id}/subjects/${subjectId}/questions`, { headers }),
    fetch(`http://backend:80/api/adminapi/buraxilis-exampages/${id}/subjects/${subjectId}/passages`, { headers }),
  ]);

  const [epData, subjData, qData, paData] = await Promise.all([epRes.json(), subjRes.json(), qRes.json(), paRes.json()]);

  const exampage = epData.success ? epData.data.find((e: any) => e.id === Number(id)) ?? null : null;
  const subject = subjData.success ? subjData.data.find((s: any) => s.id === Number(subjectId)) ?? null : null;

  return {
    exampage, subject, allExampages: epData.success ? epData.data : [],
    questions: qData.success ? qData.data : [],
    counts: qData.counts ?? { 1: 0, 2: 0, 3: 0 },
    limits: qData.limits ?? { 1: 50, 2: 10, 3: 5 },
    passages: paData.success ? paData.data : [],
    exampageId: id, subjectId,
    storageBase,
  };
}

export async function action({ request, params }: any) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const { id, subjectId } = params;
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const headers = { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${session.token}` };
  const base = `http://backend:80/api/adminapi/buraxilis-exampages/${id}/subjects/${subjectId}/questions`;
  const passageBase = `http://backend:80/api/adminapi/buraxilis-exampages/${id}/subjects/${subjectId}/passages`;

  try {
    
    if (intent === "copy-questions") {
      const qIds = JSON.parse(formData.get("question_ids") as string);
      const res = await fetch(`http://backend:80/api/adminapi/buraxilis-exampages/${id}/subjects/${subjectId}/copy-questions`, {
        method: "POST", headers,
        body: JSON.stringify({ question_ids: qIds }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Suallar kopyalanmadı." };
      return { success: data.message || "Suallar kopyalandı.", intent };
    }

    if (intent === "create-question") {
      const passageId = formData.get("buraxilis_question_passage_id") as string;
      const res = await fetch(base, {
        method: "POST", headers,
        body: JSON.stringify({
          question_type: Number(formData.get("question_type")),
          title: formData.get("title"),
          image: formData.get("image") || null,
          audio: formData.get("audio") || null,
          buraxilis_question_passage_id: passageId ? Number(passageId) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual əlavə edilmədi." };
      return { success: "Sual uğurla əlavə edildi.", intent };
    }
    if (intent === "update-question") {
      const qId = formData.get("question_id") as string;
      const passageId = formData.get("buraxilis_question_passage_id") as string;
      const res = await fetch(`${base}/${qId}`, {
        method: "POST", headers,
        body: JSON.stringify({
          title: formData.get("title"),
          image: formData.get("image") || null,
          audio: formData.get("audio") || null,
          buraxilis_question_passage_id: passageId ? Number(passageId) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual yenilənmədi." };
      return { success: "Sual yeniləndi.", intent };
    }
    if (intent === "create-passage") {
      const res = await fetch(passageBase, {
        method: "POST", headers,
        body: JSON.stringify({ text: formData.get("text"), audio: formData.get("audio") || null }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Keçid əlavə edilmədi." };
      return { success: "Keçid əlavə edildi.", intent };
    }
    if (intent === "update-passage") {
      const pId = formData.get("passage_id") as string;
      const res = await fetch(`${passageBase}/${pId}`, {
        method: "PUT", headers,
        body: JSON.stringify({ text: formData.get("text"), audio: formData.get("audio") || null }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Keçid yenilənmədi." };
      return { success: "Keçid yeniləndi.", intent };
    }
    if (intent === "delete-passage") {
      const pId = formData.get("passage_id") as string;
      const res = await fetch(`${passageBase}/${pId}`, { method: "DELETE", headers });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Keçid silinmədi." };
      return { success: "Keçid silindi.", intent };
    }
    if (intent === "delete-question") {
      const qId = formData.get("question_id") as string;
      const res = await fetch(`${base}/${qId}`, { method: "DELETE", headers });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual silinmədi." };
      return { success: "Sual silindi.", intent };
    }
    if (intent === "reorder") {
      const ids = JSON.parse(formData.get("ids") as string);
      const res = await fetch(`${base}/reorder`, {
        method: "PUT", headers,
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sıralama yadda saxlanmadı." };
      return { success: "Sıralama yeniləndi.", intent };
    }
    if (intent === "add-option") {
      const qId = formData.get("question_id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/buraxilis-questions/${qId}/options`, {
        method: "POST", headers,
        body: JSON.stringify({
          text: formData.get("text"),
          is_true: formData.get("is_true") === "true",
          image: formData.get("image") || null
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Cavab əlavə edilmədi." };
      return { success: "Cavab əlavə edildi.", intent };
    }
    if (intent === "update-option") {
      const qId = formData.get("question_id") as string;
      const oId = formData.get("option_id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/buraxilis-questions/${qId}/options/${oId}`, {
        method: "PUT", headers,
        body: JSON.stringify({
          text: formData.get("text"),
          is_true: formData.get("is_true") === "true",
          image: formData.get("image") || null
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Cavab yenilənmədi." };
      return { success: "Cavab yeniləndi.", intent };
    }
    if (intent === "delete-option") {
      const qId = formData.get("question_id") as string;
      const oId = formData.get("option_id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/buraxilis-questions/${qId}/options/${oId}`, {
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
      const res = await fetch("/api/upload-buraxilis-image", {
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

function AudioUploader({ storageBase, current, onChange }: {
  storageBase: string; current: string; onChange: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("audio", file);
    try {
      const res = await fetch("/api/upload-buraxilis-audio", {
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
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Audio (Dinləmə mətni üçün)</label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 transition-all cursor-pointer disabled:opacity-50">
          <svg className={`h-4 w-4 ${uploading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          {uploading ? "Yüklənir..." : current ? "Dəyiş" : "Audio seç"}
        </button>
        {current && (
          <button type="button" onClick={() => onChange("")}
            className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer">Sil</button>
        )}
        <input ref={inputRef} type="file" accept="audio/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      </div>
      {current && (
        <audio controls src={`${storageBase}/${current.replace(/^\/+/, "")}`} className="mt-2 w-full max-w-md" />
      )}
    </div>
  );
}

export default function BuraxılışQuestionsPage() {
  const { exampage, subject, allExampages, questions, counts, limits, passages, exampageId, subjectId, storageBase } = useLoaderData<any>();
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [localGrouped, setLocalGrouped] = useState<Record<number, any[]>>({
    1: questions.filter((q: any) => q.question_type === 1),
    2: questions.filter((q: any) => q.question_type === 2),
    3: questions.filter((q: any) => q.question_type === 3),
  });
  const dragInfo = useRef<{ type: number; index: number } | null>(null);

  useEffect(() => {
    setLocalGrouped({
      1: questions.filter((q: any) => q.question_type === 1),
      2: questions.filter((q: any) => q.question_type === 2),
      3: questions.filter((q: any) => q.question_type === 3),
    });
  }, [questions]);

  const handleDragStart = (e: React.DragEvent, type: number, index: number) => {
    dragInfo.current = { type, index };
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-40");
  };

  const handleDragOver = (e: React.DragEvent, type: number, index: number) => {
    e.preventDefault();
    const currentDrag = dragInfo.current;
    if (!currentDrag || currentDrag.type !== type || currentDrag.index === index) return;

    const list = [...localGrouped[type]];
    const item = list[currentDrag.index];
    list.splice(currentDrag.index, 1);
    list.splice(index, 0, item);

    dragInfo.current = { type, index };
    setLocalGrouped(prev => ({ ...prev, [type]: list }));
  };

  const handleDragEnd = (e: React.DragEvent, type: number) => {
    e.currentTarget.classList.remove("opacity-40");
    if (dragInfo.current && dragInfo.current.type === type) {
      const fd = new FormData();
      fd.append("intent", "reorder");
      fd.append("ids", JSON.stringify(localGrouped[type].map((q: any) => q.id)));
      submit(fd, { method: "post" });
    }
    dragInfo.current = null;
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [addStep, setAddStep] = useState<"type" | "form">("type");
  const [selectedType, setSelectedType] = useState(1);
  const [addTitle, setAddTitle] = useState("");
  const [addImage, setAddImage] = useState("");
  const [addAudio, setAddAudio] = useState("");
  const [addPassageId, setAddPassageId] = useState("");

  const [editingQ, setEditingQ] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editAudio, setEditAudio] = useState("");
  const [editPassageId, setEditPassageId] = useState("");

  const [deletingQ, setDeletingQ] = useState<any>(null);

  const [showPassageModal, setShowPassageModal] = useState(false);
  const [editingPassage, setEditingPassage] = useState<any>(null);
  const [passageText, setPassageText] = useState("");
  const [passageAudio, setPassageAudio] = useState("");
  const [deletingPassage, setDeletingPassage] = useState<any>(null);

  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [addingOptionFor, setAddingOptionFor] = useState<number | null>(null);
  const [newOptText, setNewOptText] = useState("");
  const [newOptTrue, setNewOptTrue] = useState(false);
  const [newOptImage, setNewOptImage] = useState("");
  const [editingOpt, setEditingOpt] = useState<any>(null);
  const [editOptText, setEditOptText] = useState("");
  const [editOptTrue, setEditOptTrue] = useState(false);
  const [editOptImage, setEditOptImage] = useState("");

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (actionData?.success) {
      setToast({ msg: actionData.success, type: "success" });
      setShowAddModal(false); setAddStep("type"); setAddTitle(""); setAddImage(""); setAddAudio(""); setAddPassageId("");
      setEditingQ(null); setDeletingQ(null); setEditPassageId(""); setEditAudio("");
      setAddingOptionFor(null); setNewOptText(""); setNewOptImage(""); setEditingOpt(null); setEditOptImage("");
      setShowPassageModal(false); setEditingPassage(null); setPassageText(""); setPassageAudio(""); setDeletingPassage(null);
    } else if (actionData?.error) {
      setToast({ msg: actionData.error, type: "error" });
    }
  }, [actionData]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  if (!exampage || !subject) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Məlumat tapılmadı.</p>
        <Link to="/buraxilis-exampages" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">Geri qayıt</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border shadow-xl text-xs font-semibold ${
          toast.type === "success" ? "bg-emerald-950/95 text-emerald-200 border-emerald-900/60" : "bg-red-950/95 text-red-200 border-red-900/60"
        }`}>{toast.msg}</div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
        <Link to="/buraxilis-exampages" className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors">Vərəqlər</Link>
        <span className="text-gray-300 text-xs">/</span>
        <Link to={`/buraxilis-exampages/${exampageId}/subjects`} className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors">{exampage.title}</Link>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-xs font-bold text-gray-900">{subject.title}</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { setShowPassageModal(true); setEditingPassage(null); setPassageText(""); setPassageAudio(""); }}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 px-4 py-2 text-xs font-bold shadow-sm cursor-pointer transition-all">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Yeni Keçid (Mətn/Audio)
          </button>
          
          <button onClick={() => setShowCopyModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 px-4 py-2 text-xs font-bold shadow-sm cursor-pointer transition-all">
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Vərəqdən Sual Kopyala
          </button>
          <button onClick={() => { setShowAddModal(true); setAddStep("type"); setAddTitle(""); setAddImage(""); setAddAudio(""); setAddPassageId(""); }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-sm cursor-pointer transition-all">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Sual Əlavə Et
          </button>
        </div>
      </div>

      {/* Keçidlər (passages) */}
      {passages.length > 0 && (
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ümumi Keçidlər ({passages.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {passages.map((p: any) => (
              <div key={p.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/75 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: p.text || "(Mətn yoxdur)" }} />
                  {p.audio && (
                    <audio controls src={`${storageBase}/${p.audio.replace(/^\/+/, "")}`} className="mt-2 h-7 w-full max-w-xs" />
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingPassage(p); setPassageText(p.text || ""); setPassageAudio(p.audio || ""); setShowPassageModal(true); }}
                    className="p-1 text-gray-400 hover:text-indigo-600 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => setDeletingPassage(p)} className="p-1 text-gray-400 hover:text-red-600 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sual növləri üzrə bloklar */}
      {TYPE_INFO.map(ti => {
        const list = localGrouped[ti.type] || [];
        return (
          <div key={ti.type} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${ti.dot}`} />
                <h3 className="text-sm font-bold text-gray-900">{ti.label}</h3>
                <span className="text-xs text-gray-400">({list.length} sual)</span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${ti.badge}`}>
                {ti.desc}
              </span>
            </div>

            {list.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4">Bu növdə sual əlavə edilməyib.</p>
            ) : (
              <div className="space-y-3">
                {list.map((q: any, idx: number) => {
                  const isExpanded = expandedQ === q.id;
                  const opts = q.options || [];
                  return (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ti.type, idx)}
                      onDragOver={(e) => handleDragOver(e, ti.type, idx)}
                      onDragEnd={(e) => handleDragEnd(e, ti.type)}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="shrink-0 w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="text-xs text-gray-900 font-medium" dangerouslySetInnerHTML={{ __html: q.title || "(Başlıq yoxdur)" }} />
                            {q.image && (
                              <img src={`${storageBase}/${q.image.replace(/^\/+/, "")}`} alt="Sual" className="max-h-32 rounded-lg border border-gray-200 object-contain bg-white" />
                            )}
                            {q.audio && (
                              <audio controls src={`${storageBase}/${q.audio.replace(/^\/+/, "")}`} className="h-8 max-w-sm" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {ti.type === 1 && (
                            <button
                              onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                            >
                              Variantlar ({opts.length})
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingQ(q);
                              setEditTitle(q.title || "");
                              setEditImage(q.image || "");
                              setEditAudio(q.audio || "");
                              setEditPassageId(q.buraxilis_question_passage_id ? String(q.buraxilis_question_passage_id) : "");
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={() => setDeletingQ(q)}
                            className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Variantlar bölməsi (yalnız qapalı suallar) */}
                      {ti.type === 1 && isExpanded && (
                        <div className="pt-3 border-t border-gray-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-bold text-gray-500 uppercase">Cavab Variantları</h5>
                            {opts.length < 5 && (
                              <button
                                onClick={() => { setAddingOptionFor(q.id); setNewOptText(""); setNewOptTrue(false); setNewOptImage(""); }}
                                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                              >
                                + Variant əlavə et
                              </button>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            {opts.map((opt: any, oIdx: number) => (
                              <div key={opt.id} className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                                opt.is_true ? "border-emerald-300 bg-emerald-50/60 font-semibold text-emerald-950" : "border-gray-200 bg-white text-gray-700"
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[11px]">
                                    {OPTION_LABELS[oIdx] || oIdx + 1}
                                  </span>
                                  <span>{opt.text}</span>
                                  {opt.is_true && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">Düzgün</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      const fd = new FormData();
                                      fd.append("intent", "delete-option");
                                      fd.append("question_id", String(q.id));
                                      fd.append("option_id", String(opt.id));
                                      submit(fd, { method: "post" });
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {addingOptionFor === q.id && (
                            <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2 mt-2">
                              <input
                                type="text"
                                value={newOptText}
                                onChange={(e) => setNewOptText(e.target.value)}
                                placeholder="Variantın mətni..."
                                className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white outline-none focus:border-indigo-600"
                              />
                              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newOptTrue}
                                  onChange={(e) => setNewOptTrue(e.target.checked)}
                                  className="rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                Düzgün cavabdır
                              </label>
                              <div className="flex gap-2 justify-end pt-1">
                                <button onClick={() => setAddingOptionFor(null)} className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer">İmtina</button>
                                <button
                                  onClick={() => {
                                    const fd = new FormData();
                                    fd.append("intent", "add-option");
                                    fd.append("question_id", String(q.id));
                                    fd.append("text", newOptText);
                                    fd.append("is_true", String(newOptTrue));
                                    submit(fd, { method: "post" });
                                  }}
                                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                                >
                                  Əlavə et
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* ── MODALS (ADD QUESTION, EDIT QUESTION, DELETE, PASSAGES) ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">Yeni Sual Əlavə Et</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sualın Növü</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_INFO.map(ti => (
                    <button
                      key={ti.type}
                      type="button"
                      onClick={() => setSelectedType(ti.type)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedType === ti.type ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {ti.label}
                    </button>
                  ))}
                </div>
              </div>

              {passages.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Keçidə Bağla (İstəyə bağlı)</label>
                  <select
                    value={addPassageId}
                    onChange={(e) => setAddPassageId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-indigo-600"
                  >
                    <option value="">(Keçid yoxdur)</option>
                    {passages.map((p: any) => (
                      <option key={p.id} value={p.id}>Keçid #{p.id} - {p.text?.replace(/<[^>]+>/g, '').slice(0, 50)}...</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sualın Mətni</label>
                <RichTextEditor value={addTitle} onChange={setAddTitle} placeholder="Sualın mətnini yazın..." />
              </div>

              <ImageUploader storageBase={storageBase} current={addImage} onChange={setAddImage} />
              <AudioUploader storageBase={storageBase} current={addAudio} onChange={setAddAudio} />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">İmtina</button>
              <button
                disabled={navigation.state === "submitting"}
                onClick={() => {
                  const fd = new FormData();
                  fd.append("intent", "create-question");
                  fd.append("question_type", String(selectedType));
                  fd.append("title", addTitle);
                  if (addImage) fd.append("image", addImage);
                  if (addAudio) fd.append("audio", addAudio);
                  if (addPassageId) fd.append("buraxilis_question_passage_id", addPassageId);
                  submit(fd, { method: "post" });
                }}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                Əlavə Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQ && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">Sualı Düzəliş Et</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sualın Mətni</label>
                <RichTextEditor value={editTitle} onChange={setEditTitle} />
              </div>

              {passages.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Keçidə Bağla</label>
                  <select
                    value={editPassageId}
                    onChange={(e) => setEditPassageId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-indigo-600"
                  >
                    <option value="">(Keçid yoxdur)</option>
                    {passages.map((p: any) => (
                      <option key={p.id} value={p.id}>Keçid #{p.id} - {p.text?.replace(/<[^>]+>/g, '').slice(0, 50)}...</option>
                    ))}
                  </select>
                </div>
              )}

              <ImageUploader storageBase={storageBase} current={editImage} onChange={setEditImage} />
              <AudioUploader storageBase={storageBase} current={editAudio} onChange={setEditAudio} />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
              <button onClick={() => setEditingQ(null)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">İmtina</button>
              <button
                disabled={navigation.state === "submitting"}
                onClick={() => {
                  const fd = new FormData();
                  fd.append("intent", "update-question");
                  fd.append("question_id", String(editingQ.id));
                  fd.append("title", editTitle);
                  if (editImage) fd.append("image", editImage);
                  if (editAudio) fd.append("audio", editAudio);
                  if (editPassageId) fd.append("buraxilis_question_passage_id", editPassageId);
                  submit(fd, { method: "post" });
                }}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                Yadda Saxla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE QUESTION MODAL */}
      {deletingQ && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">Sualı Sil</h3>
            <p className="text-xs text-gray-500 mb-6">Bu sualı və ona aid bütün variantları silmək istədiyinizə əminsiniz?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeletingQ(null)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">İmtina</button>
              <button
                onClick={() => {
                  const fd = new FormData();
                  fd.append("intent", "delete-question");
                  fd.append("question_id", String(deletingQ.id));
                  submit(fd, { method: "post" });
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 cursor-pointer"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSAGE MODAL */}
      {showPassageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">{editingPassage ? "Keçidi Redaktə Et" : "Yeni Keçid Əlavə Et"}</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mətn</label>
              <RichTextEditor value={passageText} onChange={setPassageText} placeholder="Mətni daxil edin..." />
            </div>
            <AudioUploader storageBase={storageBase} current={passageAudio} onChange={setPassageAudio} />
            <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
              <button onClick={() => setShowPassageModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">İmtina</button>
              <button
                onClick={() => {
                  const fd = new FormData();
                  fd.append("intent", editingPassage ? "update-passage" : "create-passage");
                  if (editingPassage) fd.append("passage_id", String(editingPassage.id));
                  fd.append("text", passageText);
                  if (passageAudio) fd.append("audio", passageAudio);
                  submit(fd, { method: "post" });
                }}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 cursor-pointer"
              >
                {editingPassage ? "Yadda Saxla" : "Əlavə Et"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CopyQuestionsModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        onSubmitCopy={(qIds) => {
          submit(
            { intent: "copy-questions", question_ids: JSON.stringify(qIds) },
            { method: "POST" }
          );
          setShowCopyModal(false);
        }}
        isSubmitting={navigation.state === "submitting"}
        examType="buraxilis"
        allExampages={allExampages}
        currentExampageId={exampageId}
        subjectId={subjectId}
        storageBase={storageBase}
      />
    </div>
  );
}