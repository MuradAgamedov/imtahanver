import { useState, useEffect, useRef } from "react";
import { Link, Form, useLoaderData, useActionData, useNavigation, redirect } from "react-router";
import type { Route } from "./+types/miq-exampages";
import { sessionCookie, type UserSession } from "../lib/session";

const API_BASE = "http://backend:80";

export function meta({}: Route.MetaArgs) {
  return [{ title: "MİQ Vərəqləri — İmtahanVer" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    Accept: "application/json",
  };

  const [exampagesRes, sessionsRes, registrationsRes] = await Promise.all([
    fetch(`${API_BASE}/api/front/miq-exampages`),
    fetch(`${API_BASE}/api/front/exam-sessions`, { headers: authHeaders }),
    fetch(`${API_BASE}/api/front/exam-registrations`, { headers: authHeaders }),
  ]);

  const [exampagesData, sessionsData, registrationsData] = await Promise.all([
    exampagesRes.json(),
    sessionsRes.json(),
    registrationsRes.json(),
  ]);

  const rawExampages: any[] = exampagesData.success ? exampagesData.data : [];

  const miqExampages = await Promise.all(
    rawExampages.map(async (ep: any) => {
      const subRes = await fetch(`${API_BASE}/api/front/miq-exampages/${ep.id}/subjects`);
      const subData = await subRes.json();
      const subjects = subData.success ? subData.data.map((d: any) => d.subject).filter(Boolean) : [];
      return { ...ep, subjects };
    })
  );

  const sessions: any[] = sessionsData.success ? sessionsData.data : [];
  const sessionByExampage: Record<number, any> = sessions.reduce((acc, s) => {
    if (s.miq_exampage_id && !acc[s.miq_exampage_id]) acc[s.miq_exampage_id] = s;
    return acc;
  }, {});

  const registrations: any[] = registrationsData.success ? registrationsData.data : [];
  const registrationByExampage: Record<number, any> = registrations.reduce((acc, r) => {
    if (r.miq_exampage_id) acc[r.miq_exampage_id] = r;
    return acc;
  }, {});

  return { miqExampages, sessionByExampage, registrationByExampage };
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "register") {
    const exampageId = formData.get("exampage_id") as string;
    const res = await fetch(`${API_BASE}/api/front/exam-registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ exam_type: "miq", exampage_id: Number(exampageId) }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || "Qeydiyyat alınmadı." };
    return redirect(data.payment_redirect_url || "/miq-exampages");
  }

  if (intent === "cancel") {
    const registrationId = formData.get("registration_id") as string;
    const res = await fetch(`${API_BASE}/api/front/exam-registrations/${registrationId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || "Ləğv edilmədi." };
    return { success: data.message || "Qeydiyyat ləğv edildi." };
  }

  return {};
}

function useStartCountdown(startsAt: string | null, onReached?: () => void) {
  const target = startsAt ? new Date(startsAt).getTime() : 0;
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((target - Date.now()) / 1000)));
  const reachedRef = useRef(false);

  useEffect(() => {
    if (!startsAt) return;
    const id = setInterval(() => {
      const secs = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0 && !reachedRef.current) {
        reachedRef.current = true;
        clearInterval(id);
        if (onReached) onReached();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const formatted = days > 0
    ? `${days}g ${String(hours).padStart(2, "0")}s ${String(minutes).padStart(2, "0")}dəq`
    : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { remaining, formatted, isReady: remaining <= 0 };
}

const CANCELLATION_CUTOFF_SECONDS = 24 * 60 * 60;

function PaidExampageCard({ ep }: { ep: any }) {
  const countdown = useStartCountdown(ep.starts_at ?? null);
  const isPaid = ep.registration?.status === "paid";
  const canStart = isPaid && (!ep.starts_at || countdown.isReady);
  const canCancel = !ep.starts_at || countdown.remaining > CANCELLATION_CUTOFF_SECONDS;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <div className="flex flex-col rounded-2xl border border-violet-200 bg-paper p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2" />
            <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
          </svg>
        </div>
        {ep.price != null && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
            {ep.price} AZN
          </span>
        )}
      </div>

      <h4 className="text-base font-bold text-ink">{ep.title}</h4>
      <p className="mt-1.5 text-xs text-ink-soft">{ep.subjects.length} fənn mövcuddur</p>

      <div className="mt-4">
        {!ep.registration && (
          <Form method="post">
            <input type="hidden" name="intent" value="register" />
            <input type="hidden" name="exampage_id" value={ep.id} />
            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 transition-all cursor-pointer"
            >
              Qeydiyyatdan keç{ep.price != null ? ` (${ep.price} AZN)` : ""}
            </button>
          </Form>
        )}

        {ep.registration?.status === "pending_payment" && (
          <Link
            to={`/odenis/${ep.registration.id}`}
            className="block text-center w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 transition-all"
          >
            Ödənişi tamamla
          </Link>
        )}

        {isPaid && !canStart && (
          <div className="rounded-xl bg-paper-2 border border-ink/10 py-2.5 text-center">
            <p className="text-xs text-ink-soft">Başlamasına qalıb:</p>
            <p className="text-sm font-bold text-violet-700 tabular-nums">{countdown.formatted}</p>
          </div>
        )}

        {ep.registration && !canStart && canCancel && (
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="mt-2 w-full rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold py-2 transition-all cursor-pointer"
          >
            Qeydiyyatı ləğv et
          </button>
        )}

        {ep.registration && !canStart && !canCancel && (
          <p className="mt-2 text-[11px] text-ink-soft/70 text-center">
            İmtahana 1 gündən az qalıb, qeydiyyat ləğv edilə bilməz.
          </p>
        )}

        {isPaid && canStart && (
          <Link
            to={`/miq-exampages/${ep.id}/subjects`}
            className="block text-center w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 transition-all"
          >
            Başla →
          </Link>
        )}
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper border border-ink/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-ink">Qeydiyyatı ləğv et</h3>
            <p className="text-sm text-ink-soft mt-2">
              <strong className="text-ink">{ep.title}</strong> imtahanına qeydiyyatınızı ləğv etmək istədiyinizə əminsiniz?
              {ep.registration?.status === "paid" ? " Ödəniş geri qaytarılacaq." : ""}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-ink/10 hover:bg-paper-2 text-ink text-xs font-bold rounded-xl cursor-pointer"
              >
                İmtina
              </button>
              <Form method="post" className="flex-1">
                <input type="hidden" name="intent" value="cancel" />
                <input type="hidden" name="registration_id" value={ep.registration.id} />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Bəli, ləğv et
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DemoExampageCard({ ep, existingSession }: { ep: any; existingSession: any }) {
  const isParticipated = !!existingSession;
  const href = isParticipated
    ? `/exam/${existingSession.miq_exampage_id}/${existingSession.miq_subject_id}?session_id=${existingSession.id}`
    : `/miq-exampages/${ep.id}/subjects`;

  return (
    <Link
      to={href}
      className={`group flex flex-col rounded-2xl border bg-paper p-6 shadow-sm transition-all duration-300 ${
        isParticipated
          ? "border-ink/15 hover:border-emerald-300 hover:shadow-lg"
          : "border-ink/10 hover:shadow-xl hover:border-amber-brand/30"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          isParticipated
            ? "bg-emerald-50 text-emerald-600"
            : "bg-amber-brand/10 text-amber-brand-deep"
        }`}>
          {isParticipated ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>
        {isParticipated ? (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            existingSession.status === "completed"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600 animate-pulse"
          }`}>
            {existingSession.status === "completed" ? "Tamamlanıb" : "Davam edir"}
          </span>
        ) : (
          <svg className="w-5 h-5 text-ink-soft/40 group-hover:text-amber-brand-deep transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      <h4 className={`text-base font-bold text-ink transition-colors ${
        isParticipated
          ? "group-hover:text-emerald-600"
          : "group-hover:text-amber-brand-deep"
      }`}>
        {ep.title}
      </h4>

      {isParticipated ? (
        <p className="mt-1.5 text-xs text-ink-soft">
          Fənn: <span className="font-semibold text-ink">{existingSession.subject?.title ?? "—"}</span>
          {existingSession.status === "completed" && (
            <> · Bal: <span className="font-bold text-emerald-600">{existingSession.score}</span></>
          )}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-ink-soft">
          {ep.subjects.length} fənn mövcuddur
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {isParticipated ? (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            existingSession.status === "completed"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}>
            {existingSession.status === "completed" ? "Nəticəyə bax →" : "Davam et →"}
          </span>
        ) : (
          <>
            {ep.subjects.slice(0, 4).map((s: any) => (
              <span key={s.id} className="rounded-full bg-amber-brand/10 px-2.5 py-0.5 text-xs font-medium text-amber-brand-deep">
                {s.title}
              </span>
            ))}
            {ep.subjects.length > 4 && (
              <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                +{ep.subjects.length - 4}
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  );
}

export default function MiqExampagesPage() {
  const { miqExampages, sessionByExampage, registrationByExampage } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;

  const demoExams = miqExampages.filter((ep: any) => ep.is_demo !== false);
  const paidExams = miqExampages.filter((ep: any) => ep.is_demo === false);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans pb-16">
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper/80 border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            to="/exams"
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-amber-brand-deep transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </Link>
          <div className="h-4 w-px bg-ink/15" />
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Link to="/exams" className="hover:text-amber-brand-deep transition-colors">İmtahanlar</Link>
            <span>›</span>
            <span className="font-semibold text-ink">MİQ İmtahanı</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 mt-10">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">
            Vərəq Seçimi
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            İmtahan vərəqini seçin.
          </p>
          {actionData?.error && (
            <p className="mt-3 text-sm text-red-600 font-semibold">{actionData.error}</p>
          )}
          {actionData?.success && (
            <p className="mt-3 text-sm text-emerald-600 font-semibold">{actionData.success}</p>
          )}
        </div>

        {miqExampages.length === 0 ? (
          <div className="text-center py-20 text-ink-soft/70">
            <p className="text-sm">Vərəq tapılmadı.</p>
          </div>
        ) : (
          <>
            {demoExams.length > 0 && (
              <section className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-soft mb-4">
                  Özünü indi sına
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {demoExams.map((ep: any) => (
                    <DemoExampageCard key={ep.id} ep={ep} existingSession={sessionByExampage[ep.id]} />
                  ))}
                </div>
              </section>
            )}

            {paidExams.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-soft mb-4">
                  Gələcək imtahanlardan qeydiyyatdan keç
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paidExams.map((ep: any) => (
                    <PaidExampageCard key={ep.id} ep={{ ...ep, registration: registrationByExampage[ep.id] }} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
