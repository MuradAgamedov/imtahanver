import { useState, useEffect, useRef } from "react";
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation, useSubmit } from "react-router";
import type { Route } from "./+types/exam-registrations";
import { sessionCookie, type AdminSession } from "../lib/session";
import { cn } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Qeydiyyatlar — İmtahanVer Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const url = new URL(request.url);
  const examType = url.searchParams.get("exam_type") || "miq";
  const exampageId = url.searchParams.get("exampage_id") || "";
  const title = url.searchParams.get("title") || "";
  const search = url.searchParams.get("search") || "";

  if (!exampageId) {
    return { registrations: [], examType, exampageId, title, search };
  }

  try {
    const params = new URLSearchParams({ exam_type: examType, exampage_id: exampageId });
    if (search) params.set("search", search);

    const res = await fetch(`http://backend:80/api/adminapi/exam-registrations?${params.toString()}`, {
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
    return { registrations: data.success ? data.data : [], examType, exampageId, title, search };
  } catch (err) {
    console.error("Exam registrations loader error:", err);
    return { registrations: [], examType, exampageId, title, search };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "add-person") {
    const res = await fetch("http://backend:80/api/adminapi/exam-registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        exam_type: formData.get("exam_type"),
        exampage_id: Number(formData.get("exampage_id")),
        user_id: Number(formData.get("user_id")),
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || "Əlavə edilmədi." };
    return { success: data.message || "İstifadəçi qeydiyyata əlavə edildi." };
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;
    const res = await fetch(`http://backend:80/api/adminapi/exam-registrations/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || "Silinmədi." };
    return { success: data.message || "Qeydiyyat silindi." };
  }

  return {};
}

function AddPersonWidget({ examType, exampageId }: { examType: string; exampageId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const submit = useSubmit();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users-search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.success ? data.data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const addUser = (userId: number) => {
    const fd = new FormData();
    fd.append("intent", "add-person");
    fd.append("exam_type", examType);
    fd.append("exampage_id", exampageId);
    fd.append("user_id", String(userId));
    submit(fd, { method: "post" });
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative max-w-sm w-full">
      <input
        type="text"
        placeholder="ID, ad və ya soyada görə axtar..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-xl border border-gray-250 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none transition-all"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-gray-150 bg-white shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <p className="p-3 text-xs text-gray-400">Axtarılır...</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-xs text-gray-400">Nəticə tapılmadı.</p>
          ) : (
            results.map((u: any) => (
              <button
                key={u.id}
                type="button"
                onClick={() => addUser(u.id)}
                className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
              >
                <p className="text-sm font-semibold text-gray-900">{u.first_name} {u.last_name}</p>
                <p className="text-xs text-gray-400">#{u.user_code} · {u.email}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ExamRegistrationsPage() {
  const { registrations, examType, exampageId, title, search } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();

  const [searchQuery, setSearchQuery] = useState(search);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

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
        setDeleteTarget(null);
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

  const backTo = examType === "applicant" ? "/applicant-exampages" : "/miq-exampages";
  const paidCount = registrations.filter((r: any) => r.status === "paid").length;

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl animate-bounce ${
          toastType === "success"
            ? "bg-emerald-950/95 text-emerald-200 border-emerald-900/60"
            : "bg-red-950/95 text-red-200 border-red-900/60"
        }`}>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div>
          <Link to={backTo} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 mb-2">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Vərəqlərə qayıt
          </Link>
          <h2 className="text-lg font-bold text-gray-900">
            Qeydiyyatlar {title ? `— ${title}` : ""}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ödənilib: <strong className="text-gray-900">{paidCount}</strong> / {registrations.length} (son 10 nəticə göstərilir)
          </p>
        </div>

        <AddPersonWidget examType={examType} exampageId={exampageId} />
      </div>

      <div className="relative max-w-xs w-full">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="search"
          placeholder="ID, ad və ya soyada görə axtar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-250 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none transition-all"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">İstifadəçi</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">Qeydiyyat tarixi</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">Ödəniş statusu</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">Məbləğ</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">Ödəniş tarixi</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-450">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {registrations.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{r.user?.first_name} {r.user?.last_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">#{r.user?.user_code} · {r.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {r.created_at ? new Date(r.created_at).toLocaleString("az-AZ") : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border",
                        r.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : r.status === "cancelled"
                          ? "bg-gray-100 text-gray-500 border-gray-200"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      )}
                    >
                      {r.status === "paid" ? "Ödənilib" : r.status === "cancelled" ? "Ləğv edilib" : "Gözlənilir"}
                    </span>
                    {r.payment_reference === "ADMIN-MANUAL" && (
                      <span className="ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        Admin əlavə edib
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{r.amount != null ? `${r.amount} AZN` : "-"}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {r.paid_at ? new Date(r.paid_at).toLocaleString("az-AZ") : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeleteTarget(r)}
                      title="Sil"
                      className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {registrations.length === 0 && (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
            </svg>
            <p className="mt-3 text-sm text-gray-400 font-semibold">
              {search ? "Axtarışa uyğun qeydiyyat tapılmadı" : "Hələ heç kim qeydiyyatdan keçməyib"}
            </p>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Qeydiyyatı Sil</h3>
            <p className="text-sm text-gray-500">
              <strong>{deleteTarget.user?.first_name} {deleteTarget.user?.last_name}</strong> istifadəçisinin bu imtahana qeydiyyatını silmək istəyirsiniz?
            </p>
            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={deleteTarget.id} />
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
              <button type="submit" disabled={navigation.state === "submitting"}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer disabled:opacity-50">Sil</button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
