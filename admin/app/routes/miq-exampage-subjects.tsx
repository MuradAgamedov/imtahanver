import { useState, useEffect } from "react";
import { Form, Link, redirect, useLoaderData, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/miq-exampage-subjects";
import { cn } from "../lib/utils";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Fənn Proqramları Fənləri — İmtahanVer Admin" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const exampageId = params.id;

  try {
    // 1. Fetch currently associated subjects
    const resAssoc = await fetch(`http://backend:80/api/adminapi/miq-exampages/${exampageId}/subjects`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    if (resAssoc.status === 401) {
      return redirect("/login", {
        headers: {
          "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 })
        }
      });
    }

    const dataAssoc = await resAssoc.json();
    const associations = dataAssoc.success ? dataAssoc.data : [];
    const exampage = dataAssoc.success ? dataAssoc.exampage : null;

    // 2. Fetch all MIQ subjects to populate the select dropdown
    const resAll = await fetch("http://backend:80/api/adminapi/miq-subjects", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const dataAll = await resAll.json();
    const allSubjects = dataAll.success ? dataAll.data : [];

    return { 
      exampage, 
      associations, 
      allSubjects,
      session 
    };
  } catch (err) {
    console.error("Miq exampage subjects loader error:", err);
    return redirect("/miq-exampages");
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const exampageId = params.id;
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const token = session.token;

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`
  };

  try {
    if (intent === "associate") {
      const miqSubjectId = formData.get("miq_subject_id") as string;

      const res = await fetch(`http://backend:80/api/adminapi/miq-exampages/${exampageId}/subjects`, {
        method: "POST",
        headers,
        body: JSON.stringify({ miq_subject_id: parseInt(miqSubjectId, 10) })
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Fənn əlavə edilə bilmədi." };
      return { success: data.message || "Fənn uğurla əlavə olundu." };
    }

    if (intent === "dissociate") {
      const subjectId = formData.get("subject_id") as string;

      const res = await fetch(`http://backend:80/api/adminapi/miq-exampages/${exampageId}/subjects/${subjectId}`, {
        method: "DELETE",
        headers
      });

      const data = await res.json();
      if (!res.ok) return { error: data.message || "Fənn silinə bilmədi." };
      return { success: data.message || "Fənn uğurla silindi." };
    }
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın." };
  }

  return {};
}

export default function MiqExampageSubjectsPage() {
  const { exampage, associations, allSubjects } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<any>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setToastMessage(actionData.success);
        setToastType("success");
        setShowAddModal(false);
        setShowDeleteConfirm(false);
        setSelectedAssociation(null);
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

  // Filter out subjects that are already associated
  const associatedSubjectIds = associations.map((assoc: any) => assoc.miq_subject_id);
  const availableSubjects = allSubjects.filter(
    (subj: any) => !associatedSubjectIds.includes(subj.id)
  );

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

      {/* Back link & Header */}
      <div className="space-y-4">
        <Link 
          to={`/miq-exampages/${exampage?.id}/question-types`} 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Sual Növlərinə Qayıt
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{exampage?.title || "Vərəq"} — Fənn Proqramları</h2>
            <p className="text-xs text-gray-500 mt-1">Bu vərəqin "Fənn proqramları" (ixtisas) sual növü üçün əlaqələndirilmiş fənlərin siyahısı.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Fənn Əlavə Et
          </button>
        </div>
      </div>

      {/* Count Summary */}
      <p className="text-xs font-medium text-gray-450 uppercase tracking-wider">
        Əlaqəli fənn sayı: <strong className="text-gray-900">{associations.length}</strong>
      </p>

      {/* Associations Table */}
      <div className="overflow-hidden bg-white border border-gray-150 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-gray-150">
              <tr>
                <th className="px-6 py-4">Fənnin Adı</th>
                <th className="px-6 py-4">Eyniləşdirici (Slug)</th>
                <th className="px-6 py-4">Əlaqələndirilmə Tarixi</th>
                <th className="px-6 py-4 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {associations.map((assoc: any) => (
                <tr key={assoc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4.5 font-bold text-gray-900">
                    {assoc.subject?.title || "Naməlum Fənn"}
                  </td>
                  <td className="px-6 py-4.5 font-mono text-xs text-gray-400">
                    {assoc.subject?.identify || "-"}
                  </td>
                  <td className="px-6 py-4.5 text-gray-500">
                    {assoc.created_at ? new Date(assoc.created_at).toLocaleString("az-AZ") : "-"}
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="flex items-center justify-end gap-3.5">
                      <Link
                        to={`/miq-exampages/${exampage?.id}/question-types/1/subjects/${assoc.miq_subject_id}/questions`}
                        className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Sualları İdarə Et &rarr;
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedAssociation(assoc);
                          setShowDeleteConfirm(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-655 hover:text-red-800 transition-colors cursor-pointer"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {associations.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-400 font-semibold">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Hələ heç bir fənn əlaqələndirilməyib
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
              <input type="hidden" name="intent" value="associate" />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fənn Seçin</label>
                <select 
                  name="miq_subject_id" 
                  required
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none"
                >
                  <option value="">-- Siyahıdan seçin --</option>
                  {availableSubjects.map((subj: any) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.title}
                    </option>
                  ))}
                </select>
                {availableSubjects.length === 0 && (
                  <p className="text-xs text-red-500 mt-2 font-medium">Bütün mövcud fənlər artıq əlavə edilib.</p>
                )}
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
                  disabled={navigation.state === "submitting" || availableSubjects.length === 0}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  Əlavə Et
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && selectedAssociation && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Fənni Sil</h3>
            <p className="text-sm text-gray-500">
              Siz həqiqətən də <strong>{selectedAssociation.subject?.title}</strong> fənninin bu vərəq ilə olan əlaqəsini silmək istəyirsiniz?
            </p>

            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="dissociate" />
              <input type="hidden" name="subject_id" value={selectedAssociation.miq_subject_id} />
              <button 
                type="button" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAssociation(null);
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
