import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation, useSubmit } from "react-router";
import type { Route } from "./+types/applicant-exampages";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Abituriyent Vərəqləri — İmtahanVer Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";

  try {
    const backendUrl = search
      ? `http://backend:80/api/adminapi/applicant-exampages?search=${encodeURIComponent(search)}`
      : "http://backend:80/api/adminapi/applicant-exampages";

    const res = await fetch(backendUrl, {
      headers: { Accept: "application/json", Authorization: `Bearer ${session.token}` },
    });

    if (res.status === 401) {
      return redirect("/login", {
        headers: { "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }) },
      });
    }

    const data = await res.json();
    return { exampages: data.success ? data.data : [], search };
  } catch {
    return { exampages: [], search };
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
      const res = await fetch("http://backend:80/api/adminapi/applicant-exampages", {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "İmtahan vərəqi yaradıla bilmədi." };
      return { success: data.message || "Yeni imtahan vərəqi uğurla yaradıldı." };
    }

    if (intent === "update") {
      const id = formData.get("id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/applicant-exampages/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: formData.get("title"),
          exam_duration: Number(formData.get("exam_duration")),
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Vərəq yenilənmədi." };
      return { success: data.message || "Vərəq uğurla yeniləndi.", intent: "update" };
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;
      const res = await fetch(`http://backend:80/api/adminapi/applicant-exampages/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "İmtahan vərəqi silinmədi." };
      return { success: data.message || "İmtahan vərəqi uğurla silindi." };
    }
  } catch {
    return { error: "Xəta baş verdi. Yenidən yoxlayın." };
  }

  return {};
}

export default function ApplicantExampagesPage() {
  const { exampages, search } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();

  const [searchQuery, setSearchQuery] = useState(search);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedExampage, setSelectedExampage] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

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
        setShowDeleteConfirm(false);
        setShowEditModal(false);
        setSelectedExampage(null);
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
          <h2 className="text-lg font-bold text-gray-900">Abituriyent İmtahan Vərəqləri</h2>
          <p className="text-xs text-gray-500 mt-1">Platformadakı abituriyent imtahan vərəqlərinin siyahısı və yaradılması.</p>
        </div>
        <Form method="post">
          <input type="hidden" name="intent" value="create" />
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Yeni Vərəq Yarat
          </button>
        </Form>
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
          placeholder="Başlıq üzrə axtarış..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-250 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none transition-all"
        />
      </div>

      <p className="text-xs font-medium text-gray-450 uppercase tracking-wider">
        Tapılan vərəq sayı: <strong className="text-gray-900">{exampages.length}</strong>
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exampages.map((ep: any) => (
          <div key={ep.id} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 mb-2">
                  ID: #{ep.id}
                </span>
                <h3 className="text-base font-bold text-gray-900">{ep.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-gray-400">
                    {ep.created_at ? new Date(ep.created_at).toLocaleString("az-AZ") : "-"}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {ep.exam_duration ?? 150} dəq
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedExampage(ep);
                    setEditTitle(ep.title || "");
                    setEditDuration(String(ep.exam_duration ?? 150));
                    setShowEditModal(true);
                  }}
                  title="Düzəliş et"
                  className="rounded-xl p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => { setSelectedExampage(ep); setShowDeleteConfirm(true); }}
                  title="Sil"
                  className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {exampages.length === 0 && (
        <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-3 text-sm text-gray-400 font-semibold">Heç bir vərəq tapılmadı</p>
        </div>
      )}

      {/* EDIT MODAL */}
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedExampage(null); }}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  Yadda Saxla
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && selectedExampage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">İmtahan Vərəqini Sil</h3>
            <p className="text-sm text-gray-500">
              <strong>{selectedExampage.title}</strong> vərəqini silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={selectedExampage.id} />
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedExampage(null); }}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer"
              >
                İmtina
              </button>
              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer"
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
