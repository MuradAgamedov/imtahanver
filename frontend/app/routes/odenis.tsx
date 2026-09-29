// Saxta/mock ödəniş səhifəsi — real ödəniş provayderi (bank/gateway) qoşulanda
// bu səhifə həmin provayderin hosted checkout səhifəsinə yönləndirmə ilə əvəz
// olunacaq, `mock-confirm` çağırışı isə provayderin return/webhook axını ilə.
import { useState } from "react";
import { Form, Link, useLoaderData, useActionData, redirect } from "react-router";
import type { Route } from "./+types/odenis";
import { sessionCookie, type UserSession } from "../lib/session";

const API_BASE = "http://backend:80";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Ödəniş — İmtahanVer" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const res = await fetch(`${API_BASE}/api/front/exam-registrations/${params.registrationId}`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
      Accept: "application/json",
    },
  });
  const data = await res.json();

  return { registration: data.success ? data.data : null };
}

export async function action({ request, params }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const res = await fetch(`${API_BASE}/api/front/exam-registrations/${params.registrationId}/mock-confirm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.token}`,
      Accept: "application/json",
    },
  });
  const data = await res.json();

  if (!res.ok) return { error: data.message || "Ödəniş təsdiqlənmədi." };

  const registration = data.data;
  const backTo = registration?.applicant_exampage_id ? "/applicant-exampages" : "/miq-exampages";
  return redirect(`${backTo}?paid=1`);
}

export default function OdenisPage() {
  const { registration } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center p-8 bg-paper rounded-2xl border border-ink/10 shadow-sm max-w-sm">
          <p className="text-sm font-semibold text-red-500">Qeydiyyat tapılmadı.</p>
          <Link to="/exams" className="mt-4 inline-block text-xs font-bold text-amber-brand-deep hover:underline">
            İmtahanlara qayıt
          </Link>
        </div>
      </div>
    );
  }

  const exampage = registration.miq_exampage || registration.applicant_exampage;
  const isPaid = registration.status === "paid";

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-paper p-8 shadow-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-lg font-bold text-ink">Ödəniş</h1>
        <p className="mt-1 text-sm text-ink-soft">{exampage?.title ?? "İmtahan"}</p>

        <div className="mt-5 rounded-xl bg-paper-2 border border-ink/10 p-4">
          <p className="text-xs text-ink-soft">Ödəniləcək məbləğ</p>
          <p className="text-2xl font-extrabold text-ink mt-1">{registration.amount ?? 0} AZN</p>
        </div>

        {actionData?.error && (
          <p className="mt-4 text-sm text-red-600 font-semibold">{actionData.error}</p>
        )}

        {isPaid ? (
          <div className="mt-6">
            <p className="text-sm font-semibold text-emerald-600 mb-4">Ödəniş artıq təsdiqlənib.</p>
            <Link
              to={registration.applicant_exampage_id ? "/applicant-exampages" : "/miq-exampages"}
              className="inline-block w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-3 transition-all"
            >
              İmtahanlara qayıt
            </Link>
          </div>
        ) : (
          <Form method="post" className="mt-6" onSubmit={() => setIsSubmitting(true)}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold py-3 transition-all cursor-pointer"
            >
              {isSubmitting ? "Ödəniş edilir..." : "Ödənişi təsdiqlə (demo)"}
            </button>
            <p className="mt-3 text-[11px] text-ink-soft/70">
              Bu, real ödəniş sistemi qoşulana qədər istifadə olunan demo təsdiqidir.
            </p>
          </Form>
        )}
      </div>
    </div>
  );
}
