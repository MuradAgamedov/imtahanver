import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation, Link } from "react-router";
import type { Route } from "./+types/miq-exampages";
import { cn } from "../lib/utils";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "MİQ Vərəqləri — İmtahanVer Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const res = await fetch("http://backend:80/api/adminapi/miq-exampages", {
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
    const exampages = data.success ? data.data : [];

    return { exampages, session };
  } catch (err) {
    console.error("Miq exampages loader error:", err);
    return { exampages: [], session };
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
      const res = await fetch("http://backend:80/api/adminapi/miq-exampages", {
        method: "POST",
        headers,
        body: JSON.stringify({})
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message || "İmtahan vərəqi yaradıla bilmədi." };
      return { success: data.message || "Yeni imtahan vərəqi uğurla yaradıldı." };
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;

      const res = await fetch(`http://backend:80/api/adminapi/miq-exampages/${id}`, {
        method: "DELETE",
        headers
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message || "İmtahan vərəqi silinmədi." };
      return { success: data.message || "İmtahan vərəqi uğurla silindi." };
    }
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın." };
  }

  return {};
}

export default function MiqExampagesPage() {
  const { exampages } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedExampage, setSelectedExampage] = useState<any>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setToastMessage(actionData.success);
        setToastType("success");
        setShowDeleteConfirm(false);
        setSelectedExampage(null);
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

  const filteredExampages = exampages.filter((ep: any) => {
    const matchesSearch = (ep.title || "").toLowerCase().includes(searchQuery.toLowerCase());
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
          <h2 className="text-lg font-bold text-gray-900">MİQ İmtahan Vərəqləri</h2>
          <p className="text-xs text-gray-500 mt-1">Platformadakı MİQ imtahan vərəqlərinin (exam sheets) siyahısı və yaradılması.</p>
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
            Yeni İmtahan Vərəqi Yarat
          </button>
        </Form>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      </div>

      {/* Count Summary */}
      <p className="text-xs font-medium text-gray-450 uppercase tracking-wider">
        Tapılan vərəq sayı: <strong className="text-gray-900">{filteredExampages.length}</strong>
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExampages.map((ep: any) => (
          <div key={ep.id} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-600 mb-2">
                  ID: #{ep.id}
                </span>
                <h3 className="text-base font-bold text-gray-900">{ep.title}</h3>
                <p className="text-xs text-gray-400 mt-1">Yaradılıb: {ep.created_at ? new Date(ep.created_at).toLocaleString("az-AZ") : "-"}</p>
              </div>

              <button
                onClick={() => {
                  setSelectedExampage(ep);
                  setShowDeleteConfirm(true);
                }}
                title="Sil"
                className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="pt-2">
              <Link
                to={`/miq-exampages/${ep.id}/question-types`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-gray-250 text-slate-700 px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer text-center"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Sual Növlərinə Bax
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredExampages.length === 0 && (
        <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-3 text-sm text-gray-400 font-semibold">Heç bir imtahan vərəqi tapılmadı</p>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && selectedExampage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">İmtahan Vərəqini Sil</h3>
            <p className="text-sm text-gray-500">
              Siz həqiqətən də <strong>{selectedExampage.title}</strong> imtahan vərəqini silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>

            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={selectedExampage.id} />
              <button 
                type="button" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedExampage(null);
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
