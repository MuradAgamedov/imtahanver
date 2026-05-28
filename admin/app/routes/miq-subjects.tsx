import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation, useSubmit } from "react-router";
import type { Route } from "./+types/miq-subjects";
import { cn } from "../lib/utils";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "MİQ Fənləri — İmtahanVer Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const res = await fetch("http://backend:80/api/adminapi/miq-subjects", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    if (res.status === 401) {
      return redirect("/login", {
        headers: {
          "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 })
        }
      });
    }

    const data = await res.json();
    const subjects = data.success ? data.data : [];

    return { subjects, session };
  } catch (err) {
    console.error("Miq subjects loader error:", err);
    return { subjects: [], session };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const token = session.token;

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`
  };

  try {
    if (intent === "create") {
      const title = formData.get("title") as string;
      const identify = formData.get("identify") as string || null;

      const res = await fetch("http://backend:80/api/adminapi/miq-subjects", {
        method: "POST",
        headers,
        body: JSON.stringify({ title, identify })
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Fənn yaradıla bilmədi." };
      return { success: data.message || "Fənn uğurla əlavə olundu." };
    }

    if (intent === "update") {
      const id = formData.get("id") as string;
      const title = formData.get("title") as string;
      const identify = formData.get("identify") as string || null;

      const res = await fetch(`http://backend:80/api/adminapi/miq-subjects/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ title, identify })
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Məlumatlar yenilənmədi." };
      return { success: data.message || "Məlumatlar uğurla yeniləndi." };
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;

      const res = await fetch(`http://backend:80/api/adminapi/miq-subjects/${id}`, {
        method: "DELETE",
        headers
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Fənn silinmədi." };
      return { success: data.message || "Fənn uğurla silindi." };
    }

    if (intent === "reorder") {
      const idsStr = formData.get("ids") as string;
      const ids = JSON.parse(idsStr);

      const res = await fetch("http://backend:80/api/adminapi/miq-subjects/reorder", {
        method: "PUT",
        headers,
        body: JSON.stringify({ ids })
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sıralama yadda saxlanmadı." };
      return { success: data.message || "Sıralama uğurla yeniləndi." };
    }
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın." };
  }

  return {};
}

export default function MiqSubjectsPage() {
  const { subjects, session } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();

  const [localSubjects, setLocalSubjects] = useState<any[]>(subjects);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Keep local subjects synchronized with loader data
  useEffect(() => {
    setLocalSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setToastMessage(actionData.success);
        setToastType("success");
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteConfirm(false);
        setSelectedSubject(null);
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
    // For transparent look when dragging
    e.currentTarget.classList.add("opacity-40");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Rearrange local list order
    const newList = [...localSubjects];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setLocalSubjects(newList);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-40");
    setDraggedIndex(null);

    // Save order to backend
    const orderedIds = localSubjects.map((s) => s.id);
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("ids", JSON.stringify(orderedIds));
    submit(fd, { method: "post" });
  };

  const filteredSubjects = localSubjects.filter((s: any) => {
    const matchesSearch = (s.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (s.identify || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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

      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">MİQ Fənləri</h2>
          <p className="text-xs text-gray-500 mt-1">Müəllimlərin İşə Qəbulu (MİQ) fənlərinin sıralanması və idarəedilməsi paneli. Sürüşdürərək sıralamanı dəyişə bilərsiniz.</p>
        </div>
        <button
          onClick={() => {
            setSelectedSubject(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Fənn Əlavə Et
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs w-full">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Fənn adı və ya eyniləşdirici..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-250 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none transition-all"
          />
        </div>
      </div>

      {/* Count Summary */}
      <p className="text-xs font-medium text-gray-450 uppercase tracking-wider">
        Tapılan fənn sayı: <strong className="text-gray-900">{filteredSubjects.length}</strong>
      </p>

      {/* Reorderable Drag and Drop List */}
      <div className="space-y-3">
        {filteredSubjects.map((subject, index) => (
          <div
            key={subject.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="flex items-center justify-between bg-white border border-gray-150 rounded-2xl p-4.5 shadow-sm hover:shadow transition-all duration-200 cursor-grab active:cursor-grabbing group relative select-none"
          >
            <div className="flex items-center gap-4">
              {/* Drag Handle Indicator */}
              <div className="text-gray-300 group-hover:text-indigo-500 transition-colors">
                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" />
                </svg>
              </div>

              {/* Number Badge */}
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50/70 text-xs font-bold text-indigo-600">
                {index + 1}
              </div>

              {/* Title & Slug */}
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{subject.title}</h4>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{subject.identify}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedSubject(subject);
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
                  setSelectedSubject(subject);
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
        ))}

        {filteredSubjects.length === 0 && (
          <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400 font-semibold">MİQ fənni tapılmadı</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Fənn Əlavə Et</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fənnin Adı</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  placeholder="Məs. Riyaziyyat"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Eyniləşdirici / Slug (Boş buraxıla bilər)</label>
                <input 
                  type="text" 
                  name="identify" 
                  placeholder="Məs. riyaziyyat (boş qalsa avtomatik yaradılacaq)"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none font-mono"
                />
              </div>

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
      {showEditModal && selectedSubject && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Fənni Redaktə Et</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSubject(null);
                }}
                className="text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={selectedSubject.id} />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fənnin Adı</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={selectedSubject.title}
                  required
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Eyniləşdirici / Slug (Boş buraxıla bilər)</label>
                <input 
                  type="text" 
                  name="identify" 
                  defaultValue={selectedSubject.identify}
                  placeholder="Boş qalsa avtomatik yaradılacaq"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none font-mono"
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSubject(null);
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
      {showDeleteConfirm && selectedSubject && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Fənni Sil</h3>
            <p className="text-sm text-gray-500">
              Siz həqiqətən də <strong>{selectedSubject.title}</strong> fənnini silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>

            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={selectedSubject.id} />
              <button 
                type="button" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedSubject(null);
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
    </div>
  );
}
