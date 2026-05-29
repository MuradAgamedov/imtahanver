import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation, useSubmit } from "react-router";
import type { Route } from "./+types/applicant-groups";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Abituriyent Qrupları — İmtahanVer Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";

  const headers = { Accept: "application/json", Authorization: `Bearer ${session.token}` };

  try {
    const backendUrl = search
      ? `http://backend:80/api/adminapi/applicant-groups?search=${encodeURIComponent(search)}`
      : "http://backend:80/api/adminapi/applicant-groups";

    const [groupsRes, subjectsRes] = await Promise.all([
      fetch(backendUrl, { headers }),
      fetch("http://backend:80/api/adminapi/applicant-subjects", { headers }),
    ]);

    if (groupsRes.status === 401) {
      return redirect("/login", {
        headers: { "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }) },
      });
    }

    const [groupsData, subjectsData] = await Promise.all([groupsRes.json(), subjectsRes.json()]);

    return {
      groups: groupsData.success ? groupsData.data : [],
      allSubjects: subjectsData.success ? subjectsData.data : [],
      search,
    };
  } catch (err) {
    console.error("Loader error:", err);
    return { groups: [], allSubjects: [], search };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${session.token}`,
  };

  try {
    if (intent === "create") {
      const res = await fetch("http://backend:80/api/adminapi/applicant-groups", {
        method: "POST",
        headers,
        body: JSON.stringify({ title: formData.get("title"), identify: formData.get("identify") || null }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Qrup yaradıla bilmədi." };
      return { success: data.message || "Qrup uğurla əlavə olundu." };
    }

    if (intent === "update") {
      const id = formData.get("id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/applicant-groups/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ title: formData.get("title"), identify: formData.get("identify") || null }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Məlumatlar yenilənmədi." };
      return { success: data.message || "Qrup uğurla yeniləndi." };
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/applicant-groups/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Qrup silinmədi." };
      return { success: data.message || "Qrup uğurla silindi." };
    }

    if (intent === "reorder") {
      const ids = JSON.parse(formData.get("ids") as string);
      const res = await fetch("http://backend:80/api/adminapi/applicant-groups/reorder", {
        method: "PUT",
        headers,
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Sıralama yadda saxlanmadı." };
      return { success: data.message || "Sıralama yeniləndi." };
    }

    if (intent === "sync-subjects") {
      const id = formData.get("id") as string;
      const subjectIds = JSON.parse(formData.get("subject_ids") as string);
      const res = await fetch(`http://backend:80/api/adminapi/applicant-groups/${id}/subjects`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ subject_ids: subjectIds }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Fənlər yenilənmədi." };
      return { success: data.message || "Fənlər uğurla yeniləndi.", intent: "sync-subjects" };
    }
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Xəta baş verdi. Yenidən yoxlayın." };
  }

  return {};
}

export default function ApplicantGroupsPage() {
  const { groups, allSubjects, search } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();

  const [localGroups, setLocalGroups] = useState<any[]>(groups);
  const [searchQuery, setSearchQuery] = useState(search);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => { setLocalGroups(groups); }, [groups]);
  useEffect(() => { setSearchQuery(search); }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search) {
        const sp = new URLSearchParams(window.location.search);
        if (searchQuery) sp.set("search", searchQuery);
        else sp.delete("search");
        submit(sp, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, search, submit]);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setToastMessage(actionData.success);
        setToastType("success");
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteConfirm(false);
        setSelectedGroup(null);
        if (actionData.intent === "sync-subjects") setShowSubjectsModal(false);
      } else if (actionData.error) {
        setToastMessage(actionData.error);
        setToastType("error");
      }
    }
  }, [actionData]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-40");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newList = [...localGroups];
    const item = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, item);
    setDraggedIndex(index);
    setLocalGroups(newList);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-40");
    setDraggedIndex(null);
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("ids", JSON.stringify(localGroups.map((g) => g.id)));
    submit(fd, { method: "post" });
  };

  const openSubjectsModal = (group: any) => {
    setSelectedGroup(group);
    setSelectedSubjectIds((group.subjects ?? []).map((s: any) => s.id));
    setShowSubjectsModal(true);
  };

  const toggleSubject = (id: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Abituriyent Qrupları</h2>
          <p className="text-xs text-gray-500 mt-1">Qrupları idarə edin və hər qrupa fənn təyin edin. Sürüşdürərək sıralamanı dəyişə bilərsiniz.</p>
        </div>
        <button
          onClick={() => { setSelectedGroup(null); setShowAddModal(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Qrup Əlavə Et
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs w-full">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Qrup adı..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-250 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none transition-all"
        />
      </div>

      <p className="text-xs font-medium text-gray-450 uppercase tracking-wider">
        Tapılan qrup sayı: <strong className="text-gray-900">{localGroups.length}</strong>
      </p>

      {/* Draggable list */}
      <div className="space-y-3">
        {localGroups.map((group, index) => (
          <div
            key={group.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-200 cursor-grab active:cursor-grabbing group select-none gap-4"
          >
            {/* Left */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0">
                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50/70 text-xs font-bold text-indigo-600 flex-shrink-0">
                {index + 1}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{group.title}</h4>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{group.identify}</p>
              </div>
            </div>

            {/* Subjects badges */}
            <div className="flex flex-wrap gap-1.5 flex-1 px-2">
              {(group.subjects ?? []).length === 0 ? (
                <span className="text-xs text-gray-400 italic">Fənn əlavə edilməyib</span>
              ) : (
                (group.subjects ?? []).slice(0, 5).map((s: any) => (
                  <span key={s.id} className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {s.title}
                  </span>
                ))
              )}
              {(group.subjects ?? []).length > 5 && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                  +{(group.subjects ?? []).length - 5}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openSubjectsModal(group)}
                title="Fənləri idarə et"
                className="rounded-lg p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </button>
              <button
                onClick={() => { setSelectedGroup(group); setShowEditModal(true); }}
                title="Redaktə et"
                className="rounded-lg p-2 text-gray-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => { setSelectedGroup(group); setShowDeleteConfirm(true); }}
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

        {localGroups.length === 0 && (
          <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="mt-3 text-sm text-gray-400 font-semibold">Qrup tapılmadı</p>
          </div>
        )}
      </div>

      {/* ── CREATE MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Qrup Əlavə Et</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Qrupun Adı</label>
                <input type="text" name="title" required placeholder="Məs. Humanitar qrup"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Eyniləşdirici / Slug (Boş buraxıla bilər)</label>
                <input type="text" name="identify" placeholder="Avtomatik yaradılacaq"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none font-mono" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
                <button type="submit" disabled={navigation.state === "submitting"}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50">Əlavə Et</button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Qrupu Redaktə Et</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedGroup(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={selectedGroup.id} />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Qrupun Adı</label>
                <input type="text" name="title" defaultValue={selectedGroup.title} required
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Eyniləşdirici / Slug</label>
                <input type="text" name="identify" defaultValue={selectedGroup.identify}
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none font-mono" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedGroup(null); }}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
                <button type="submit" disabled={navigation.state === "submitting"}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50">Yadda Saxla</button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* ── SUBJECTS MODAL ── */}
      {showSubjectsModal && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <div>
                <h3 className="text-base font-bold text-gray-900">Fənləri Seçin</h3>
                <p className="text-xs text-gray-500 mt-0.5">Qrup: <strong>{selectedGroup.title}</strong></p>
              </div>
              <button onClick={() => { setShowSubjectsModal(false); setSelectedGroup(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-2 mt-3 mb-4 p-3 bg-indigo-50 rounded-xl">
              <svg className="h-4 w-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-indigo-700 font-semibold">
                {selectedSubjectIds.length} fənn seçilib / {allSubjects.length} mövcud
              </p>
            </div>

            {/* Subject checklist */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {allSubjects.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Hələ fənn əlavə edilməyib.</p>
              ) : (
                allSubjects.map((subject: any) => {
                  const isChecked = selectedSubjectIds.includes(subject.id);
                  return (
                    <label
                      key={subject.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "border-indigo-400 bg-indigo-50/70"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => toggleSubject(subject.id)}
                    >
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                        isChecked ? "border-indigo-600 bg-indigo-600" : "border-gray-300"
                      }`}>
                        {isChecked && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{subject.title}</p>
                        <p className="text-xs font-mono text-slate-400">{subject.identify}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={() => { setShowSubjectsModal(false); setSelectedGroup(null); }}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer"
              >
                İmtina
              </button>
              <button
                type="button"
                disabled={navigation.state === "submitting"}
                onClick={() => {
                  const fd = new FormData();
                  fd.append("intent", "sync-subjects");
                  fd.append("id", String(selectedGroup.id));
                  fd.append("subject_ids", JSON.stringify(selectedSubjectIds));
                  submit(fd, { method: "post" });
                }}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {navigation.state === "submitting" ? "Saxlanılır..." : "Yadda Saxla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {showDeleteConfirm && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Qrupu Sil</h3>
            <p className="text-sm text-gray-500">
              <strong>{selectedGroup.title}</strong> qrupunu silmək istəyirsiniz? Qrupla bağlı fənn təyinatları da silinəcək.
            </p>
            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={selectedGroup.id} />
              <button type="button" onClick={() => { setShowDeleteConfirm(false); setSelectedGroup(null); }}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
              <button type="submit" disabled={navigation.state === "submitting"}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer">Sil</button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
