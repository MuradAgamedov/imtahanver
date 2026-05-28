import { useState, useEffect } from "react";
import { Form, Link, redirect, useLoaderData, useActionData, useNavigation, useSubmit } from "react-router";
import type { Route } from "./+types/miq-question-options";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Cavab Variantları — İmtahanVer Admin" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) return redirect("/login");

  const questionId = params.questionId;

  const res = await fetch(
    `http://backend:80/api/adminapi/miq-direct-questions/${questionId}/options`,
    {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    }
  );

  if (res.status === 401) {
    return redirect("/login", {
      headers: { "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }) }
    });
  }

  const data = await res.json();
  return {
    options: data.success ? data.data : [],
    question: data.success ? data.question : null,
    params,
    session
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const questionId = params.questionId;
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const token = session.token;

  try {
    if (intent === "reorder") {
      const ids = JSON.parse(formData.get("ids") as string);
      const res = await fetch(
        `http://backend:80/api/adminapi/miq-direct-questions/${questionId}/options/reorder`,
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
      const isTrue = formData.get("is_true") === "true";

      const res = await fetch(
        `http://backend:80/api/adminapi/miq-direct-questions/${questionId}/options`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ text, is_true: isTrue })
        }
      );

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Cavab əlavə edilmədi." };
      return { success: "Cavab uğurla əlavə olundu." };
    }

    if (intent === "update") {
      const id = formData.get("id") as string;
      const text = formData.get("text") as string;
      const isTrue = formData.get("is_true") === "true";

      const res = await fetch(
        `http://backend:80/api/adminapi/miq-direct-questions/${questionId}/options/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ text, is_true: isTrue })
        }
      );

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Cavab yenilənmədi." };
      return { success: "Cavab uğurla yeniləndi." };
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;

      const res = await fetch(
        `http://backend:80/api/adminapi/miq-direct-questions/${questionId}/options/${id}`,
        {
          method: "DELETE",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Cavab silinmədi." };
      return { success: "Cavab uğurla silindi." };
    }
  } catch (err) {
    return { error: "Xəta baş verdi." };
  }

  return {};
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function MiqQuestionOptionsPage() {
  const { options, question, params } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();

  const [localOptions, setLocalOptions] = useState<any[]>(options);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Form states
  const [addText, setAddText] = useState("");
  const [addIsTrue, setAddIsTrue] = useState(false);
  const [editText, setEditText] = useState("");
  const [editIsTrue, setEditIsTrue] = useState(false);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  useEffect(() => {
    if (actionData?.success) {
      setToastMessage(actionData.success);
      setToastType("success");
      setShowAddModal(false);
      setShowEditModal(false);
      setShowDeleteConfirm(false);
      setSelected(null);
      setAddText("");
      setAddIsTrue(false);
      setEditText("");
      setEditIsTrue(false);
    } else if (actionData?.error) {
      setToastMessage(actionData.error);
      setToastType("error");
    }
  }, [actionData]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-40");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newList = [...localOptions];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setLocalOptions(newList);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-40");
    setDraggedIndex(null);

    const orderedIds = localOptions.map((o) => o.id);
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("ids", JSON.stringify(orderedIds));
    submit(fd, { method: "post" });
  };

  // Build back URL
  const backUrl = `/miq-exampages/${params.id}/question-types/${params.qtId}/questions`;

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

      {/* Header */}
      <div className="space-y-4">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri Qayıt
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
          <div className="flex-1">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Sual</p>
            {question?.text ? (
              <div
                className="text-gray-900 text-sm font-semibold leading-relaxed max-w-2xl"
                dangerouslySetInnerHTML={{ __html: question.text }}
              />
            ) : (
              <p className="text-sm italic text-gray-400">Sual mətni yoxdur</p>
            )}
            {question?.image && (
              <img
                src={`http://localhost:8000${question.image}`}
                alt="Sual şəkli"
                className="mt-3 max-h-32 rounded-xl border border-gray-200 object-contain"
              />
            )}
          </div>
          <button
            onClick={() => {
              setAddText("");
              setAddIsTrue(false);
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Cavab Əlavə Et
          </button>
        </div>
      </div>

      {/* Count + hint */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-450 uppercase tracking-wider">
          Mövcud cavab sayısı: <strong className="text-gray-900">{localOptions.length}</strong>
        </p>
        {localOptions.length > 1 && (
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Sürükləyərək sıralamaq mümkündür
          </p>
        )}
      </div>

      {/* Options List — Drag & Drop */}
      <div className="space-y-3">
        {localOptions.map((opt, index) => (
          <div
            key={opt.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl p-5 border shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing select-none group ${
              opt.is_true
                ? "bg-emerald-50 border-emerald-200"
                : "bg-white border-gray-150 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              {/* Drag handle */}
              <div className="text-gray-300 group-hover:text-indigo-400 transition-colors mt-0.5 shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" />
                </svg>
              </div>

              {/* Label Badge */}
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold shrink-0 ${
                opt.is_true
                  ? "bg-emerald-500 text-white"
                  : "bg-indigo-50 text-indigo-600"
              }`}>
                {OPTION_LABELS[index] ?? index + 1}
              </div>

              {/* Text */}
              <div className="flex-1">
                {opt.text ? (
                  <div
                    className="text-gray-900 text-sm font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: opt.text }}
                  />
                ) : (
                  <p className="text-sm italic text-gray-400">Cavab mətni yoxdur</p>
                )}
              </div>

              {/* Correct Badge */}
              {opt.is_true && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-bold px-3 py-1 shrink-0">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Düzgün
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:pl-4 justify-end">
              <button
                onClick={() => {
                  setSelected(opt);
                  setEditText(opt.text || "");
                  setEditIsTrue(opt.is_true);
                  setShowEditModal(true);
                }}
                title="Redaktə et"
                className="rounded-lg p-2 text-gray-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setSelected(opt);
                  setShowDeleteConfirm(true);
                }}
                title="Sil"
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {localOptions.length === 0 && (
          <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-3 text-sm text-gray-450 font-semibold">Bu sual üçün hələ cavab əlavə edilməyib</p>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Cavab Əlavə Et</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <input type="hidden" name="is_true" value={addIsTrue ? "true" : "false"} />

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Cavabın Mətni
                </label>
                <textarea
                  name="text"
                  rows={4}
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  placeholder="Cavab mətni daxil edin..."
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Cavabın Statusu
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAddIsTrue(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      addIsTrue
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                        : "bg-white border-gray-250 text-gray-500 hover:bg-slate-50"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Düzgün
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddIsTrue(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      !addIsTrue
                        ? "bg-red-500 border-red-500 text-white shadow-sm"
                        : "bg-white border-gray-250 text-gray-500 hover:bg-slate-50"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Yanlış
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">
                  İmtina
                </button>
                <button type="submit" disabled={navigation.state === "submitting"}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer">
                  Əlavə Et
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Cavabı Redaktə Et</h3>
              <button onClick={() => { setShowEditModal(false); setSelected(null); }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={selected.id} />
              <input type="hidden" name="is_true" value={editIsTrue ? "true" : "false"} />

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Cavabın Mətni
                </label>
                <textarea
                  name="text"
                  rows={4}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Cavab mətni daxil edin..."
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Cavabın Statusu
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditIsTrue(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      editIsTrue
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                        : "bg-white border-gray-250 text-gray-500 hover:bg-slate-50"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Düzgün
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsTrue(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      !editIsTrue
                        ? "bg-red-500 border-red-500 text-white shadow-sm"
                        : "bg-white border-gray-250 text-gray-500 hover:bg-slate-50"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Yanlış
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setSelected(null); }}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">
                  İmtina
                </button>
                <button type="submit" disabled={navigation.state === "submitting"}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer">
                  Yadda Saxla
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">Cavabı Sil</h3>
            <p className="text-sm text-gray-500">Bu cavabı silmək istədiyinizdən əminsiniz?</p>
            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={selected.id} />
              <button type="button" onClick={() => { setShowDeleteConfirm(false); setSelected(null); }}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">
                İmtina
              </button>
              <button type="submit" disabled={navigation.state === "submitting"}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer">
                Sil
              </button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
