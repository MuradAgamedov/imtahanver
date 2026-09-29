import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation, useSubmit } from "react-router";
import type { Route } from "./+types/home-features";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Ana Səhifə Xüsusiyyətləri — İmtahanVer Admin" }];
}

const ICON_OPTIONS = [
  { key: "clock", label: "Saat" },
  { key: "bolt", label: "Qrafik (sürətli)" },
  { key: "chart", label: "Siyahı / Tarixçə" },
  { key: "document", label: "Kitab / Sənəd" },
  { key: "shield", label: "Cədvəl / Rəsmi" },
  { key: "heart", label: "Kart / Pulsuz" },
  { key: "sun", label: "Günəş" },
  { key: "globe", label: "Qlobus" },
] as const;

const ICON_PATHS: Record<string, string> = {
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>',
  bolt: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  chart: '<path d="M3 7h18M3 12h18M3 17h12"/>',
  document: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  shield: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18"/><path d="M8 4v5"/>',
  heart: '<rect x="2" y="6" width="20" height="13" rx="1.5"/><path d="M2 10h20"/><circle cx="17" cy="14.5" r="1.2" fill="currentColor" stroke="none"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z"/>',
};

function IconPreview({ iconKey, className }: { iconKey: string; className?: string }) {
  return (
    <svg
      className={className ?? "h-5 w-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[iconKey] ?? ICON_PATHS.shield }}
    />
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const res = await fetch("http://backend:80/api/adminapi/home-features", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (res.status === 401) {
      return redirect("/login", {
        headers: { "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }) },
      });
    }

    const data = await res.json();
    return { features: data.success ? data.data : [] };
  } catch (err) {
    console.error("Home features loader error:", err);
    return { features: [] };
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
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${session.token}`,
  };

  try {
    if (intent === "create") {
      const res = await fetch("http://backend:80/api/adminapi/home-features", {
        method: "POST",
        headers,
        body: JSON.stringify({
          icon: formData.get("icon"),
          title: formData.get("title"),
          description: formData.get("description"),
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Xüsusiyyət yaradıla bilmədi." };
      return { success: data.message || "Xüsusiyyət uğurla əlavə olundu." };
    }

    if (intent === "update") {
      const id = formData.get("id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/home-features/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          icon: formData.get("icon"),
          title: formData.get("title"),
          description: formData.get("description"),
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Məlumatlar yenilənmədi." };
      return { success: data.message || "Məlumatlar uğurla yeniləndi." };
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/home-features/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Xüsusiyyət silinmədi." };
      return { success: data.message || "Xüsusiyyət uğurla silindi." };
    }

    if (intent === "reorder") {
      const ids = JSON.parse(formData.get("ids") as string);
      const res = await fetch("http://backend:80/api/adminapi/home-features/reorder", {
        method: "PUT",
        headers,
        body: JSON.stringify({ ids }),
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

export default function HomeFeaturesPage() {
  const { features } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();

  const [localFeatures, setLocalFeatures] = useState<any[]>(features);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => { setLocalFeatures(features); }, [features]);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setToastMessage(actionData.success);
        setToastType("success");
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteConfirm(false);
        setSelectedFeature(null);
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
    const newList = [...localFeatures];
    const item = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, item);
    setDraggedIndex(index);
    setLocalFeatures(newList);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-40");
    setDraggedIndex(null);
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("ids", JSON.stringify(localFeatures.map((f) => f.id)));
    submit(fd, { method: "post" });
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
          <h2 className="text-lg font-bold text-gray-900">Ana Səhifə Xüsusiyyətləri</h2>
          <p className="text-xs text-gray-500 mt-1">
            "Platformanın əsas xüsusiyyətləri" bölməsində göstərilən kartların idarə edilməsi. Sürüşdürərək sıralamanı dəyişə bilərsiniz.
          </p>
        </div>
        <button
          onClick={() => { setSelectedFeature(null); setShowAddModal(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Xüsusiyyət Əlavə Et
        </button>
      </div>

      <p className="text-xs font-medium text-gray-450 uppercase tracking-wider">
        Xüsusiyyət sayı: <strong className="text-gray-900">{localFeatures.length}</strong>
      </p>

      {/* Draggable List */}
      <div className="space-y-3">
        {localFeatures.map((feature, index) => (
          <div
            key={feature.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="flex items-center justify-between bg-white border border-gray-150 rounded-2xl p-4.5 shadow-sm hover:shadow transition-all duration-200 cursor-grab active:cursor-grabbing group select-none"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0">
                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50/70 text-indigo-600">
                <IconPreview iconKey={feature.icon} />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{feature.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">{feature.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setSelectedFeature(feature); setShowEditModal(true); }}
                title="Redaktə et"
                className="rounded-lg p-2 text-gray-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => { setSelectedFeature(feature); setShowDeleteConfirm(true); }}
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

        {localFeatures.length === 0 && (
          <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400 font-semibold">Xüsusiyyət tapılmadı</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Xüsusiyyət Əlavə Et</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">✕</button>
            </div>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">İkon</label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <label key={opt.key} className="cursor-pointer">
                      <input type="radio" name="icon" value={opt.key} defaultChecked={opt.key === "shield"} className="peer sr-only" />
                      <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-250 p-2.5 text-gray-500 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/60 peer-checked:text-indigo-600 transition-all">
                        <IconPreview iconKey={opt.key} className="h-5 w-5" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Başlıq</label>
                <input type="text" name="title" required placeholder="Məs. Anlıq nəticə"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Təsvir</label>
                <textarea name="description" required rows={3} placeholder="Qısa izah..."
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none resize-none" />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
                <button type="submit" disabled={navigation.state === "submitting"}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50">Əlavə Et</button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedFeature && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Xüsusiyyəti Redaktə Et</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedFeature(null); }} className="text-gray-400 hover:text-gray-650 cursor-pointer">✕</button>
            </div>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={selectedFeature.id} />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">İkon</label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <label key={opt.key} className="cursor-pointer">
                      <input type="radio" name="icon" value={opt.key} defaultChecked={opt.key === selectedFeature.icon} className="peer sr-only" />
                      <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-250 p-2.5 text-gray-500 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/60 peer-checked:text-indigo-600 transition-all">
                        <IconPreview iconKey={opt.key} className="h-5 w-5" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Başlıq</label>
                <input type="text" name="title" defaultValue={selectedFeature.title} required
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Təsvir</label>
                <textarea name="description" defaultValue={selectedFeature.description} required rows={3}
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none resize-none" />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedFeature(null); }}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
                <button type="submit" disabled={navigation.state === "submitting"}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50">Yadda Saxla</button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && selectedFeature && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Xüsusiyyəti Sil</h3>
            <p className="text-sm text-gray-500">
              Siz həqiqətən də <strong>{selectedFeature.title}</strong> xüsusiyyətini silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={selectedFeature.id} />
              <button type="button" onClick={() => { setShowDeleteConfirm(false); setSelectedFeature(null); }}
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
