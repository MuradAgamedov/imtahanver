import { useState, useEffect, useRef } from "react";
import { Link, Form, useLoaderData, useActionData, redirect } from "react-router";
import { sessionCookie, type UserSession } from "../lib/session";

const API_BASE = "http://backend:80";

export function meta() {
  return [{ title: "Buraxılış İmtahanı — İmtahanVer" }];
}

export async function loader({ request }: any) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    Accept: "application/json",
  };

  const [exampagesRes, sessionsRes, registrationsRes] = await Promise.all([
    fetch(`${API_BASE}/api/front/buraxilis-exampages`),
    fetch(`${API_BASE}/api/front/exam-sessions`, { headers: authHeaders }),
    fetch(`${API_BASE}/api/front/exam-registrations`, { headers: authHeaders }),
  ]);

  const [exampagesData, sessionsData, registrationsData] = await Promise.all([
    exampagesRes.json(),
    sessionsRes.json(),
    registrationsRes.json(),
  ]);

  const rawExampages: any[] = exampagesData.success ? exampagesData.data : [];

  const buraxilisExampages = await Promise.all(
    rawExampages.map(async (ep: any) => {
      try {
        const subjRes = await fetch(`${API_BASE}/api/front/buraxilis-exampages/${ep.id}/subjects`);
        const subjData = await subjRes.json();
        const subjects = subjData.success ? subjData.data : [];
        return { ...ep, subjects };
      } catch {
        return { ...ep, subjects: [] };
      }
    })
  );

  const sessions: any[] = sessionsData.success ? sessionsData.data : [];
  const buraxilisSessions = sessions.filter(s => s.buraxilis_exampage_id !== null);

  const registrations: any[] = registrationsData.success ? registrationsData.data : [];
  const registrationByExampage: Record<number, any> = registrations.reduce((acc, r) => {
    if (r.buraxilis_exampage_id) acc[r.buraxilis_exampage_id] = r;
    return acc;
  }, {});

  return { buraxilisExampages, buraxilisSessions, registrationByExampage };
}

export async function action({ request }: any) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const exampageId = formData.get("exampage_id") as string;
  const registrationId = formData.get("registration_id") as string;

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  try {
    if (intent === "register") {
      const res = await fetch(`${API_BASE}/api/front/exam-registrations`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ buraxilis_exampage_id: Number(exampageId) }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Qeydiyyat baş tutmadı." };
      return redirect(`/odenis/${data.data.id}`);
    }

    if (intent === "cancel") {
      const res = await fetch(`${API_BASE}/api/front/exam-registrations/${registrationId}/cancel`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Ləğv edilmədi." };
      return { success: data.message || "Qeydiyyat ləğv edildi." };
    }
  } catch {
    return { error: "Xəta baş verdi. Yenidən cəhd edin." };
  }

  return {};
}

function useStartCountdown(startsAt: string | null) {
  const [remaining, setRemaining] = useState<number>(() => {
    if (!startsAt) return 0;
    const diff = Math.floor((new Date(startsAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (!startsAt) return;
    const tick = () => {
      const diff = Math.floor((new Date(startsAt).getTime() - Date.now()) / 1000);
      setRemaining(Math.max(0, diff));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatted = days > 0
    ? `${days} gün ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { remaining, isReady: remaining === 0, formatted };
}

export default function BuraxılışExampages() {
  const { buraxilisExampages, buraxilisSessions, registrationByExampage } = useLoaderData<any>();
  const actionData = useActionData<any>();

  const demoPages = buraxilisExampages.filter((ep: any) => ep.is_demo);
  const paidPages = buraxilisExampages
    .filter((ep: any) => !ep.is_demo)
    .map((ep: any) => ({
      ...ep,
      registration: registrationByExampage[ep.id] ?? null,
    }));

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper/80 border-b border-ink/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/exams"
            className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-emerald-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            İmtahan Növlərinə Qayıt
          </Link>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Buraxılış İmtahanı (DİM)
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            DİM STANDARTI
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Buraxılış Qəbul İmtahanı
          </h1>
          <p className="text-sm text-ink-soft">
            Qrup bölgüsü yoxdur. İmtahan standart 3 fəndən ibarətdir: <strong>Məntiqi təfəkkür (50 bal)</strong>, <strong>İnformatika (25 bal)</strong> və <strong>Xarici dil (25 bal)</strong>. Maksimum nəticə: 100 bal.
          </p>
        </div>

        {actionData?.error && (
          <div className="max-w-2xl mx-auto rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
            {actionData.error}
          </div>
        )}
        {actionData?.success && (
          <div className="max-w-2xl mx-auto rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-700">
            {actionData.success}
          </div>
        )}

        {/* DEMO İMTAHANLAR */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-ink">Demo Sınaqlar</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Ödənişsiz</span>
          </div>

          {demoPages.length === 0 ? (
            <div className="rounded-2xl border border-ink/10 bg-paper-2 p-8 text-center text-sm text-ink-soft">
              Hazırda aktiv demo imtahan vərəqi yoxdur.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoPages.map((ep: any) => (
                <DemoExampageCard key={ep.id} ep={ep} buraxilisSessions={buraxilisSessions} />
              ))}
            </div>
          )}
        </section>

        {/* PULLU / PLANLI İMTAHANLAR */}
        {paidPages.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-ink">Rəsmi / Planlı Sınaqlar</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">Ödənişli</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidPages.map((ep: any) => (
                <PaidExampageCard key={ep.id} ep={ep} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function DemoExampageCard({ ep, buraxilisSessions }: { ep: any; buraxilisSessions: any[] }) {
  const pageSessions = buraxilisSessions.filter((s) => s.buraxilis_exampage_id === ep.id);
  const activeSession = pageSessions.find((s) => s.status === "active");

  const href = `/exam/buraxilis/${ep.id}`;
  const subjects = ep.subjects || [];

  return (
    <Link
      to={href}
      className="group flex flex-col justify-between rounded-2xl border bg-paper p-6 shadow-sm transition-all duration-300 border-ink/10 hover:shadow-xl hover:border-emerald-200"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          {activeSession ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 animate-pulse">
              Davam edir
            </span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
              Demo Sınaq
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-ink group-hover:text-emerald-600 transition-colors">
          {ep.title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {subjects.length > 0 ? (
            subjects.map((s: any) => (
              <span key={s.id} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-paper-2 text-ink-soft border border-ink/5">
                {s.title}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-ink-soft italic">Məntiq, İnformatika, Xarici dil</span>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-ink/5 flex items-center justify-between">
        <span className="text-xs text-ink-soft">Müddət: {ep.exam_duration || 180} dəqiqə</span>
        <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          {activeSession ? "Davam et" : "İmtahana Başla"} →
        </span>
      </div>
    </Link>
  );
}

function PaidExampageCard({ ep }: { ep: any }) {
  const countdown = useStartCountdown(ep.starts_at);
  const isPaid = ep.registration?.status === "paid";
  const canStart = !ep.starts_at || countdown.isReady;
  const canCancel = countdown.remaining > 86400;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <div className="flex flex-col justify-between rounded-2xl border bg-paper p-6 shadow-sm border-ink/10">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
            {ep.price ? `${ep.price} AZN` : "Ödənişli"}
          </span>
          {ep.starts_at && (
            <span className="text-xs text-ink-soft font-mono">
              {new Date(ep.starts_at).toLocaleDateString("az-AZ")}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-ink">{ep.title}</h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(ep.subjects || []).map((s: any) => (
            <span key={s.id} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-paper-2 text-ink-soft">
              {s.title}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-ink/5 space-y-2">
        {!ep.registration && (
          <Form method="post">
            <input type="hidden" name="intent" value="register" />
            <input type="hidden" name="exampage_id" value={ep.id} />
            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 transition-colors cursor-pointer"
            >
              Qeydiyyatdan keç və Ödə
            </button>
          </Form>
        )}

        {ep.registration && !isPaid && (
          <Link
            to={`/odenis/${ep.registration.id}`}
            className="block text-center w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 transition-colors"
          >
            Ödənişi tamamla
          </Link>
        )}

        {isPaid && !canStart && (
          <div className="text-center py-2 bg-paper-2 rounded-xl text-xs text-ink-soft">
            Başlamasına qalıb: <strong className="text-violet-600">{countdown.formatted}</strong>
          </div>
        )}

        {isPaid && canStart && (
          <Link
            to={`/exam/buraxilis/${ep.id}`}
            className="block text-center w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 transition-colors"
          >
            İmtahana Başla →
          </Link>
        )}
      </div>
    </div>
  );
}
