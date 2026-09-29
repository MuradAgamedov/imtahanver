import { useState, useEffect, useRef, Fragment } from "react";
import { Form, Link, redirect, useLoaderData, useActionData, useNavigation, useSubmit, useParams } from "react-router";
import { sessionCookie, type AdminSession } from "../lib/session";

const isProd = typeof window !== "undefined"
  ? window.location.hostname.endsWith("imtahanver.online")
  : true;
const STORAGE_BASE = isProd ? "https://api.imtahanver.online" : "http://localhost:8000";

export function meta() {
  return [{ title: "Sualları İdarə Et — İmtahanVer Admin" }];
}

export async function loader({ params, request }: { params: any; request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const exampageId = params.id;
  const questionTypeId = params.qtId;
  const subjectId = params.subjectId ?? "null";

  try {
    const [res, paRes] = await Promise.all([
      fetch(
        `http://backend:80/api/adminapi/miq-exampages/${exampageId}/question-types/${questionTypeId}/subjects/${subjectId}/questions`,
        {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${session.token}`
          }
        }
      ),
      fetch(
        `http://backend:80/api/adminapi/miq-exampages/${exampageId}/question-types/${questionTypeId}/subjects/${subjectId}/passages`,
        {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${session.token}`
          }
        }
      ),
    ]);

    if (res.status === 401) {
      return redirect("/login", {
        headers: {
          "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 })
        }
      });
    }

    const data = await res.json();
    const paData = await paRes.json();
    const questions = data.success ? data.data : [];
    const exampage = data.success ? data.exampage : null;
    const questionType = data.success ? data.question_type : null;
    const subject = data.success ? data.subject : null;
    const passages = paData.success ? paData.data : [];

    return {
      questions,
      exampage,
      questionType,
      subject,
      passages,
      session
    };
  } catch (err) {
    console.error("Miq questions loader error:", err);
    return redirect("/miq-exampages");
  }
}

export async function action({ params, request }: { params: any; request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const exampageId = params.id;
  const questionTypeId = params.qtId;
  const subjectId = params.subjectId ?? "null";

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const token = session.token;

  try {
    if (intent === "reorder") {
      const idsStr = formData.get("ids") as string;
      const ids = JSON.parse(idsStr);

      const res = await fetch(
        `http://backend:80/api/adminapi/miq-exampages/${exampageId}/question-types/${questionTypeId}/subjects/${subjectId}/questions/reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ ids })
        }
      );

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sıralama yadda saxlanmadı." };
      return { success: data.message || "Sıralama yeniləndi." };
    }

    if (intent === "create") {
      const text = formData.get("text") as string;
      const image = formData.get("image") as File;
      const audio = formData.get("audio") as File;
      const passageId = formData.get("miq_question_passage_id") as string;

      const apiFormData = new FormData();
      if (text) apiFormData.append("text", text);
      if (image && image.size > 0) {
        apiFormData.append("image", image);
      }
      if (audio && audio.size > 0) {
        apiFormData.append("audio", audio);
      }
      if (passageId) apiFormData.append("miq_question_passage_id", passageId);

      const res = await fetch(
        `http://backend:80/api/adminapi/miq-exampages/${exampageId}/question-types/${questionTypeId}/subjects/${subjectId}/questions`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: apiFormData
        }
      );

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual əlavə edilə bilmədi." };
      return { success: data.message || "Sual uğurla əlavə olundu." };
    }

    if (intent === "update") {
      const id = formData.get("id") as string;
      const text = formData.get("text") as string;
      const image = formData.get("image") as File;
      const imageRemoved = formData.get("image_removed") as string;
      const audio = formData.get("audio") as File;
      const audioRemoved = formData.get("audio_removed") as string;
      const passageId = formData.get("miq_question_passage_id") as string;

      const apiFormData = new FormData();
      if (text) apiFormData.append("text", text);
      if (image && image.size > 0) {
        apiFormData.append("image", image);
      }
      if (imageRemoved) {
        apiFormData.append("image_removed", imageRemoved);
      }
      if (audio && audio.size > 0) {
        apiFormData.append("audio", audio);
      }
      if (audioRemoved) {
        apiFormData.append("audio_removed", audioRemoved);
      }
      apiFormData.append("miq_question_passage_id", passageId || "");

      const res = await fetch(
        `http://backend:80/api/adminapi/miq-exampages/${exampageId}/question-types/${questionTypeId}/subjects/${subjectId}/questions/${id}`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: apiFormData
        }
      );

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual yenilənmədi." };
      return { success: data.message || "Sual uğurla yeniləndi." };
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;

      const res = await fetch(
        `http://backend:80/api/adminapi/miq-exampages/${exampageId}/question-types/${questionTypeId}/subjects/${subjectId}/questions/${id}`,
        {
          method: "DELETE",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sual silinmədi." };
      return { success: data.message || "Sual uğurla silindi." };
    }

    const passageBase = `http://backend:80/api/adminapi/miq-exampages/${exampageId}/question-types/${questionTypeId}/subjects/${subjectId}/passages`;

    if (intent === "create-passage") {
      const text = formData.get("text") as string;
      const audio = formData.get("audio") as File;
      const apiFormData = new FormData();
      apiFormData.append("text", text);
      if (audio && audio.size > 0) apiFormData.append("audio", audio);

      const res = await fetch(passageBase, {
        method: "POST",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: apiFormData,
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Keçid əlavə edilmədi." };
      return { success: data.message || "Keçid əlavə edildi." };
    }

    if (intent === "update-passage") {
      const id = formData.get("id") as string;
      const text = formData.get("text") as string;
      const audio = formData.get("audio") as File;
      const audioRemoved = formData.get("audio_removed") as string;
      const apiFormData = new FormData();
      apiFormData.append("text", text);
      if (audio && audio.size > 0) apiFormData.append("audio", audio);
      if (audioRemoved) apiFormData.append("audio_removed", audioRemoved);

      const res = await fetch(`${passageBase}/${id}`, {
        method: "POST",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: apiFormData,
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Keçid yenilənmədi." };
      return { success: data.message || "Keçid yeniləndi." };
    }

    if (intent === "delete-passage") {
      const id = formData.get("id") as string;
      const res = await fetch(`${passageBase}/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Keçid silinmədi." };
      return { success: data.message || "Keçid silindi." };
    }
  } catch (err) {
    console.error("Questions action error:", err);
    return { error: "Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın." };
  }

  return {};
}

export default function MiqQuestionsPage() {
  const { questions, exampage, questionType, subject, passages } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();
  const params = useParams();

  const [localQuestions, setLocalQuestions] = useState<any[]>(questions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addPassageId, setAddPassageId] = useState("");
  const [editPassageId, setEditPassageId] = useState("");

  const [showPassageModal, setShowPassageModal] = useState(false);
  const [editingPassage, setEditingPassage] = useState<any>(null);
  const [passageTextValue, setPassageTextValue] = useState("");
  const [passageAudioPreview, setPassageAudioPreview] = useState<string | null>(null);
  const [passageAudioRemoved, setPassageAudioRemoved] = useState(false);
  const [deletingPassage, setDeletingPassage] = useState<any>(null);

  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Rich Text Markup helper states
  const [editorText, setEditorText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // File Upload Preview States
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImageRemoved, setEditImageRemoved] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [editAudioRemoved, setEditAudioRemoved] = useState(false);

  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setToastMessage(actionData.success);
        setToastType("success");
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteConfirm(false);
        setSelectedQuestion(null);
        setImagePreview(null);
        setEditImageRemoved(false);
        setAudioPreview(null);
        setEditAudioRemoved(false);
        setEditorText("");
        setAddPassageId("");
        setEditPassageId("");
        setShowPassageModal(false);
        setEditingPassage(null);
        setPassageTextValue("");
        setPassageAudioPreview(null);
        setPassageAudioRemoved(false);
        setDeletingPassage(null);
      } else if (actionData.error) {
        setToastMessage(actionData.error);
        setToastType("error");
      }
    }
  }, [actionData]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-40");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newList = [...localQuestions];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setLocalQuestions(newList);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-40");
    setDraggedIndex(null);

    const orderedIds = localQuestions.map((q) => q.id);
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("ids", JSON.stringify(orderedIds));
    submit(fd, { method: "post" });
  };

  // Rich Text formatting injection helpers
  const insertMarkup = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let replacement = "";
    if (tag === "br") {
      replacement = "<br/>";
    } else {
      replacement = `<${tag}>${selected}</${tag}>`;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setEditorText(newValue);

    setTimeout(() => {
      textarea.focus();
      if (tag === "br") {
        textarea.setSelectionRange(start + 5, start + 5);
      } else {
        textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + selected.length);
      }
    }, 0);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setEditImageRemoved(false);
    }
  };

  const handlePassageAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPassageAudioPreview(URL.createObjectURL(file));
      setPassageAudioRemoved(false);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioPreview(URL.createObjectURL(file));
      setEditAudioRemoved(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl animate-bounce ${
          toastType === "success" 
            ? "bg-emerald-950/95 text-emerald-200 border-emerald-900/60" 
            : "bg-red-950/95 text-red-200 border-red-900/60"
        }`}>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Back Link */}
      <div className="space-y-4">
        <Link 
          to={subject ? `/miq-exampages/${exampage?.id}/question-types/${questionType?.id}/subjects` : `/miq-exampages/${exampage?.id}/question-types`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri Qayıt
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {exampage?.title} — {questionType?.title}
              {subject && <span className="text-indigo-650 font-extrabold ml-1.5">({subject.title})</span>}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Bu bölməyə aid sualların siyahısı, yenilənməsi və sürükləyərək sıralanması paneli.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingPassage(null);
                setPassageTextValue("");
                setPassageAudioPreview(null);
                setPassageAudioRemoved(false);
                setShowPassageModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 px-4 py-3 text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Yeni Keçid
            </button>
            <button
              onClick={() => {
                setEditorText("");
                setImagePreview(null);
                setEditImageRemoved(false);
                setAudioPreview(null);
                setEditAudioRemoved(false);
                setAddPassageId("");
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Sual Əlavə Et
            </button>
          </div>
        </div>
      </div>

      {/* Keçidlər (passages) */}
      {passages.length > 0 && (
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Keçidlər (mətn/audio bir neçə suala bağlı ola bilər)</h3>
          <div className="space-y-2">
            {passages.map((p: any) => (
              <div key={p.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-150 bg-gray-50/60">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-2">{p.text}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {p.audio && (
                      <audio controls src={`${STORAGE_BASE}${p.audio}`} className="h-8 max-w-xs" />
                    )}
                    <span className="text-[11px] font-semibold text-gray-400">{p.questions_count ?? 0} suala bağlı</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => {
                    setEditingPassage(p);
                    setPassageTextValue(p.text);
                    setPassageAudioPreview(p.audio ? `${STORAGE_BASE}${p.audio}` : null);
                    setPassageAudioRemoved(false);
                    setShowPassageModal(true);
                  }}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-50 hover:text-indigo-600 cursor-pointer">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeletingPassage(p)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Count Summary */}
      <p className="text-xs font-medium text-gray-450 uppercase tracking-wider">
        Mövcud sual sayısı: <strong className="text-gray-900">{localQuestions.length}</strong>
      </p>

      {/* Reorderable List of Questions */}
      <div className="space-y-4">
        {localQuestions.map((q, index) => {
          const prevPassageId = index > 0 ? localQuestions[index - 1].miq_question_passage_id : null;
          const showPassageHeader = q.passage && q.miq_question_passage_id !== prevPassageId;
          return (
          <Fragment key={q.id}>
          {showPassageHeader && (
            <div className="rounded-2xl border border-indigo-150 bg-indigo-50/50 p-5 space-y-2">
              <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider">Keçid</span>
              <p className="text-sm text-gray-800">{q.passage.text}</p>
              {q.passage.audio && (
                <audio controls src={`${STORAGE_BASE}${q.passage.audio}`} className="h-8 max-w-xs" />
              )}
            </div>
          )}
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing select-none relative group"
          >
            <div className="flex items-start gap-4 flex-1">
              {/* Drag Indicator */}
              <div className="text-gray-300 group-hover:text-indigo-500 transition-colors mt-1">
                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" />
                </svg>
              </div>

              {/* Number Badge */}
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-600 shrink-0">
                {index + 1}
              </div>

              {/* Question Text / Image Display */}
              <div className="space-y-3 flex-1">
                {q.text ? (
                  <div 
                    className="text-gray-900 text-sm font-semibold max-w-2xl leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: q.text }}
                  />
                ) : (
                  <p className="text-sm italic text-gray-400">Sual mətni daxil edilməyib</p>
                )}

                {q.image && (
                  <div className="relative inline-block rounded-xl overflow-hidden border border-gray-200 max-w-xs bg-slate-50">
                    <img
                      src={`${STORAGE_BASE}${q.image}`}
                      alt="Sual Şəkli"
                      className="max-h-36 object-contain"
                    />
                  </div>
                )}
                {q.audio && (
                  <audio controls src={`${STORAGE_BASE}${q.audio}`} className="h-8 max-w-xs" />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 md:mt-0 pl-12 md:pl-4 justify-end flex-wrap">
              {/* Options (Cavablar) Link */}
              <Link
                to={params.subjectId
                  ? `/miq-exampages/${params.id}/question-types/${params.qtId}/subjects/${params.subjectId}/questions/${q.id}/options`
                  : `/miq-exampages/${params.id}/question-types/${params.qtId}/questions/${q.id}/options`
                }
                title="Cavablara bax"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Cavablar
              </Link>
              <button
                onClick={() => {
                  setSelectedQuestion(q);
                  setEditorText(q.text || "");
                  setImagePreview(q.image ? `${STORAGE_BASE}${q.image}` : null);
                  setEditImageRemoved(false);
                  setAudioPreview(q.audio ? `${STORAGE_BASE}${q.audio}` : null);
                  setEditAudioRemoved(false);
                  setEditPassageId(q.miq_question_passage_id ? String(q.miq_question_passage_id) : "");
                  setShowEditModal(true);
                }}
                title="Redaktə et"
                className="rounded-lg p-2 text-gray-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setSelectedQuestion(q);
                  setShowDeleteConfirm(true);
                }}
                title="Sil"
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          </Fragment>
          );
        })}


        {localQuestions.length === 0 && (
          <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-3 text-sm text-gray-450 font-semibold">Bu bölmədə hələ sual yoxdur</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Sual Əlavə Et</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <Form method="post" encType="multipart/form-data" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              
              {/* Text Area with Rich Text Editor simulation helpers */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sualın Mətni (HTML dəstəkləyir)</label>
                
                {/* Editor Bar */}
                <div className="flex flex-wrap gap-1 bg-slate-100 border border-b-0 border-gray-250 rounded-t-xl p-1.5">
                  <button 
                    type="button" 
                    onClick={() => insertMarkup("b")}
                    className="px-2.5 py-1 text-xs font-bold rounded hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Bold / Qalın"
                  >
                    B
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkup("i")}
                    className="px-2.5 py-1 text-xs italic rounded hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Italic / Kursiv"
                  >
                    I
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkup("u")}
                    className="px-2.5 py-1 text-xs underline rounded hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Underline / Altı cızıqlı"
                  >
                    U
                  </button>
                  <div className="w-px h-5 bg-gray-300 mx-1 align-middle inline-block self-center" />
                  <button 
                    type="button" 
                    onClick={() => insertMarkup("h3")}
                    className="px-2 py-1 text-xs font-extrabold rounded hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Heading 3 / Başlıq"
                  >
                    H3
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkup("p")}
                    className="px-2 py-1 text-xs rounded hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Paragraph / Paraqraf"
                  >
                    P
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkup("br")}
                    className="px-2 py-1 text-xs font-mono rounded hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Line Break / Alt Sətir"
                  >
                    Enter
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  name="text"
                  rows={5}
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder="Sual mətni yazın və ya yuxarıdakı format düymələrindən istifadə edin..."
                  className="w-full bg-slate-50 border border-gray-250 rounded-b-xl px-4.5 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none"
                />
              </div>

              {/* Image Input & Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sualın Şəkli</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-gray-250 border-dashed rounded-xl p-4.5">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white max-w-[120px] max-h-[80px]">
                      <img src={imagePreview} alt="Preview" className="object-contain w-full h-full" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          const input = document.querySelector('input[type="file"][name="image"]') as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[8px] leading-none hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Audio Input & Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sualın Audiosu</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-gray-250 border-dashed rounded-xl p-4.5">
                  <input
                    type="file"
                    name="audio"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {audioPreview && (
                    <div className="flex items-center gap-2">
                      <audio controls src={audioPreview} className="h-8" />
                      <button
                        type="button"
                        onClick={() => {
                          setAudioPreview(null);
                          const input = document.querySelector('input[type="file"][name="audio"]') as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {passages.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bağlı Keçid (İstəyə bağlı)</label>
                  <select name="miq_question_passage_id" value={addPassageId} onChange={(e) => setAddPassageId(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none cursor-pointer">
                    <option value="">Yoxdur</option>
                    {passages.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.text.slice(0, 60)}{p.text.length > 60 ? "…" : ""}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  İmtina
                </button>
                <button 
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                >
                  Əlavə Et
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Sualı Redaktə Et</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedQuestion(null);
                }}
                className="text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <Form method="post" encType="multipart/form-data" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={selectedQuestion.id} />
              <input type="hidden" name="image_removed" value={editImageRemoved ? "true" : "false"} />
              <input type="hidden" name="audio_removed" value={editAudioRemoved ? "true" : "false"} />

              {/* Text Area with Rich Text Editor simulation helpers */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sualın Mətni (HTML dəstəkləyir)</label>

                {/* Editor Bar */}
                <div className="flex flex-wrap gap-1 bg-slate-100 border border-b-0 border-gray-250 rounded-t-xl p-1.5">
                  <button
                    type="button"
                    onClick={() => insertMarkup("b")}
                    className="px-2.5 py-1 text-xs font-bold rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkup("i")}
                    className="px-2.5 py-1 text-xs italic rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkup("u")}
                    className="px-2.5 py-1 text-xs underline rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    U
                  </button>
                  <div className="w-px h-5 bg-gray-300 mx-1 align-middle inline-block self-center" />
                  <button
                    type="button"
                    onClick={() => insertMarkup("h3")}
                    className="px-2 py-1 text-xs font-extrabold rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkup("p")}
                    className="px-2 py-1 text-xs rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    P
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkup("br")}
                    className="px-2 py-1 text-xs font-mono rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Enter
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  name="text"
                  rows={5}
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder="Sual mətni..."
                  className="w-full bg-slate-50 border border-gray-250 rounded-b-xl px-4.5 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none"
                />
              </div>

              {/* Image Input & Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sualın Şəkli</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-gray-250 border-dashed rounded-xl p-4.5">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white max-w-[120px] max-h-[80px]">
                      <img src={imagePreview} alt="Preview" className="object-contain w-full h-full" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setEditImageRemoved(true);
                          const input = document.querySelector('input[type="file"][name="image"]') as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[8px] leading-none hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Audio Input & Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sualın Audiosu</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-gray-250 border-dashed rounded-xl p-4.5">
                  <input
                    type="file"
                    name="audio"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {audioPreview && (
                    <div className="flex items-center gap-2">
                      <audio controls src={audioPreview} className="h-8" />
                      <button
                        type="button"
                        onClick={() => {
                          setAudioPreview(null);
                          setEditAudioRemoved(true);
                          const input = document.querySelector('input[type="file"][name="audio"]') as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {passages.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bağlı Keçid (İstəyə bağlı)</label>
                  <select name="miq_question_passage_id" value={editPassageId} onChange={(e) => setEditPassageId(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none cursor-pointer">
                    <option value="">Yoxdur</option>
                    {passages.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.text.slice(0, 60)}{p.text.length > 60 ? "…" : ""}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedQuestion(null);
                  }}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  İmtina
                </button>
                <button 
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                >
                  Yadda Saxla
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Sualı Sil</h3>
            <p className="text-sm text-gray-500">
              Bu sualı silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>

            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={selectedQuestion.id} />
              <button 
                type="button" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedQuestion(null);
                }}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                İmtina
              </button>
              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
              >
                Sil
              </button>
            </Form>
          </div>
        </div>
      )}

      {/* PASSAGE ADD/EDIT MODAL */}
      {showPassageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">{editingPassage ? "Keçidi Redaktə Et" : "Yeni Keçid"}</h3>
              <button onClick={() => setShowPassageModal(false)} className="text-gray-400 hover:text-gray-650 transition-colors cursor-pointer">✕</button>
            </div>

            <Form method="post" encType="multipart/form-data" className="space-y-4">
              <input type="hidden" name="intent" value={editingPassage ? "update-passage" : "create-passage"} />
              {editingPassage && <input type="hidden" name="id" value={editingPassage.id} />}
              <input type="hidden" name="audio_removed" value={passageAudioRemoved ? "true" : "false"} />

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mətn (oxu/dinləmə parçası)</label>
                <textarea
                  name="text"
                  rows={6}
                  value={passageTextValue}
                  onChange={(e) => setPassageTextValue(e.target.value)}
                  placeholder="Keçidin mətnini daxil edin..."
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Audio (İstəyə bağlı)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-gray-250 border-dashed rounded-xl p-4.5">
                  <input
                    type="file"
                    name="audio"
                    accept="audio/*"
                    onChange={handlePassageAudioChange}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {passageAudioPreview && (
                    <div className="flex items-center gap-2">
                      <audio controls src={passageAudioPreview} className="h-8" />
                      <button type="button"
                        onClick={() => { setPassageAudioPreview(null); setPassageAudioRemoved(true); }}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer">Sil</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowPassageModal(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer">İmtina</button>
                <button type="submit" disabled={navigation.state === "submitting" || !passageTextValue.trim()}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer disabled:opacity-50">
                  Yadda Saxla
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* DELETE PASSAGE CONFIRM */}
      {deletingPassage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Keçidi Sil</h3>
            <p className="text-sm text-gray-500">
              Bu keçid silinəcək. Ona bağlı {deletingPassage.questions_count ?? 0} sual keçidsiz (müstəqil) sual olaraq qalacaq, silinməyəcək.
            </p>
            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete-passage" />
              <input type="hidden" name="id" value={deletingPassage.id} />
              <button type="button" onClick={() => setDeletingPassage(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer">İmtina</button>
              <button type="submit" disabled={navigation.state === "submitting"}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer">Sil</button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
