import { useState, useEffect } from "react";
import { Form, Link, redirect, useLoaderData, useActionData, useNavigation, useSubmit } from "react-router";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: any) {
  return [{ title: "Buraxılış Vərəqləri — İmtahanVer Admin" }];
}

export async function loader({ request }: any) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const headers = { Accept: "application/json", Authorization: `Bearer ${session.token}` };

  try {
    const backendUrl = search
      ? `http://backend:80/api/adminapi/buraxilis-exampages?search=${encodeURIComponent(search)}`
      : "http://backend:80/api/adminapi/buraxilis-exampages";

    const [epRes, subjRes] = await Promise.all([
      fetch(backendUrl, { headers }),
      fetch("http://backend:80/api/adminapi/buraxilis-subjects", { headers }),
    ]);

    if (epRes.status === 401) {
      return redirect("/login", {
        headers: { "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }) },
      });
    }

    const [epData, subjData] = await Promise.all([epRes.json(), subjRes.json()]);

    return {
      exampages: epData.success ? epData.data : [],
      allSubjects: subjData.success ? subjData.data : [],
      search,
    };
  } catch {
    return { exampages: [], allSubjects: [], search };
  }
}

export async function action({ request }: any) {
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
      const res = await fetch("http://backend:80/api/adminapi/buraxilis-exampages", {
        method: "POST", headers, body: JSON.stringify({ exam_duration: 180 }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "İmtahan vərəqi yaradıla bilmədi." };
      return { success: data.message || "Yeni imtahan vərəqi uğurla yaradıldı." };
    }

    if (intent === "update") {
      const id = formData.get("id") as string;
      const is_demo = formData.get("is_demo") === "on";
      const starts_at = formData.get("starts_at") as string;
      const price = formData.get("price") as string;
      const res = await fetch(`http://backend:80/api/adminapi/buraxilis-exampages/${id}`, {
        method: "PUT", headers,
        body: JSON.stringify({
          title: formData.get("title"),
          exam_duration: Number(formData.get("exam_duration")),
          is_demo,
          starts_at: is_demo ? null : (starts_at || null),
          price: is_demo ? null : (price || null),
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Vərəq yenilənmədi." };
      return { success: data.message || "Vərəq uğurla yeniləndi.", intent: "update" };
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/buraxilis-exampages/${id}`, {
        method: "DELETE", headers,
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "İmtahan vərəqi silinmədi." };
      return { success: data.message || "İmtahan vərəqi uğurla silindi." };
    }

    if (intent === "sync-subjects") {
      const id = formData.get("id") as string;
      const subjectIds = JSON.parse(formData.get("subject_ids") as string);
      const res = await fetch(`http://backend:80/api/adminapi/buraxilis-exampages/${id}/subjects`, {
        method: "PUT", headers,
        body: JSON.stringify({ subject_ids: subjectIds }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Fənlər yenilənmədi." };
      return { success: data.message || "Fənlər uğurla yeniləndi.", intent: "sync-subjects" };
    }
  } catch {
    return { error: "Xəta baş verdi. Yenidən yoxlayın." };
  }

  return {};
}

function toDatetimeLocal(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BuraxılışExampagesPage() {
  const { exampages, allSubjects, search: initialSearch } = useLoaderData<any>();
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [search, setSearch] = useState(initialSearch);
  const [selectedExampage, setSelectedExampage] = useState<any | null>(null);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState("180");
  const [editIsDemo, setEditIsDemo] = useState(true);
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    if (actionData?.success && (actionData.intent === "sync-subjects" || actionData.intent === "update")) {
      setShowSubjectsModal(false);
      setShowEditModal(false);
      setSelectedExampage(null);
    }
  }, [actionData]);

  const handleOpenSubjectsModal = (ep: any) => {
    setSelectedExampage(ep);
    const currentIds = (ep.subjects ?? []).map((s: any) => s.id);
    setSelectedSubjectIds(currentIds);
    setShowSubjectsModal(true);
  };

  const handleOpenEditModal = (ep: any) => {
    setSelectedExampage(ep);
    setEditTitle(ep.title || "");
    setEditDuration(String(ep.exam_duration || 180));
    setEditIsDemo(ep.is_demo ?? true);
    setEditStartsAt(toDatetimeLocal(ep.starts_at));
    setEditPrice(ep.price != null ? String(ep.price) : "");
    setShowEditModal(true);
  };

  const handleToggleSubject = (subjectId: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Buraxılış İmtahan Vərəqləri</h2>
          <p className="text-xs text-gray-500 mt-1">
            Dövlət İmtahan Mərkəzi (DİM) standartı: Qrup yoxdur. Standart 3 fənn (Məntiq, İnformatika, Xarici dil).
          </p>
        </div>
        <Form method="post">
          <input type="hidden" name="intent" value="create" />
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Yeni Vərəq Əlavə Et
          </button>
        </Form>
      </div>

      {actionData?.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-medium text-red-700">
          {actionData.error}
        </div>
      )}
      {actionData?.success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-700">
          {actionData.success}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <Form method="get" className="relative flex-1 max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Vərəq axtar..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none transition-all"
            />
          </Form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-150 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Başlıq</th>
                <th className="py-3.5 px-6">Müddət</th>
                <th className="py-3.5 px-6">Növ</th>
                <th className="py-3.5 px-6">Fənlər</th>
                <th className="py-3.5 px-6 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exampages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Vərəq tapılmadı.
                  </td>
                </tr>
              ) : (
                exampages.map((ep: any) => {
                  const subjectList = ep.subjects ?? [];
                  const isDemo = ep.is_demo ?? true;
                  return (
                    <tr key={ep.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-gray-400">#{ep.id}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">{ep.title}</td>
                      <td className="py-4 px-6 text-gray-600">{ep.exam_duration || 180} dəqiqə</td>
                      <td className="py-4 px-6">
                        {isDemo ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                            Demo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700">
                            Pullu ({ep.price ? `${ep.price} ₼` : "Qiymətsiz"})
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/buraxilis-exampages/${ep.id}/subjects`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                          >
                            <span>Fənlər ({subjectList.length})</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenSubjectsModal(ep)}
                            className="text-gray-400 hover:text-indigo-600 text-xs font-semibold underline cursor-pointer"
                          >
                            Seç
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(ep)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Düzəliş et"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSelectedExampage(ep); setShowDeleteConfirm(true); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SUBJECTS MODAL ── */}
      {showSubjectsModal && selectedExampage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">Fənləri Tənzimlə</h3>
            <p className="text-xs text-gray-500 mb-4">{selectedExampage.title} üçün imtahan fənlərini seçin:</p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {allSubjects.length === 0 ? (
                <p className="text-xs text-gray-400">Heç bir fənn yaradılmayıb. Əvvəlcə Fənlər bölməsindən fənn əlavə edin.</p>
              ) : (
                allSubjects.map((s: any) => {
                  const isChecked = selectedSubjectIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      onClick={() => handleToggleSubject(s.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked ? "border-indigo-600 bg-indigo-50/50" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{s.title}</p>
                        <p className="text-[11px] text-gray-400">{s.identify === 'mentiq' ? '50 sual' : '25 sual'}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={() => { setShowSubjectsModal(false); setSelectedExampage(null); }}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                İmtina
              </button>
              <button
                type="button"
                disabled={navigation.state === "submitting"}
                onClick={() => {
                  const fd = new FormData();
                  fd.append("intent", "sync-subjects");
                  fd.append("id", String(selectedExampage.id));
                  fd.append("subject_ids", JSON.stringify(selectedSubjectIds));
                  submit(fd, { method: "post" });
                }}
                className="py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                Yadda Saxla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && selectedExampage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-4">Vərəqi Düzəliş Et</h3>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={selectedExampage.id} />
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Başlıq</label>
                <input
                  type="text"
                  name="title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">İmtahan Müddəti (dəqiqə)</label>
                <input
                  type="number"
                  name="exam_duration"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  min="1"
                  max="600"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Növ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsDemo(true)}
                    className={`py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      editIsDemo ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsDemo(false)}
                    className={`py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      !editIsDemo ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Pullu
                  </button>
                </div>
                <input type="hidden" name="is_demo" value={editIsDemo ? "on" : "off"} />
              </div>
              {!editIsDemo && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Başlama Tarixi və Saatı</label>
                    <input
                      type="datetime-local"
                      name="starts_at"
                      value={editStartsAt}
                      onChange={(e) => setEditStartsAt(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Qiymət (AZN)</label>
                    <input
                      type="number"
                      name="price"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedExampage(null); }}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  Yadda Saxla
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {showDeleteConfirm && selectedExampage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">İmtahan Vərəqini Sil</h3>
            <p className="text-xs text-gray-500">
              <strong>{selectedExampage.title}</strong> vərəqini silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={selectedExampage.id} />
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedExampage(null); }}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                İmtina
              </button>
              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="py-2 px-4 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
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
