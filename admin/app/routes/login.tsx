import { useState } from "react";
import { Form, Link, useNavigation, useActionData, redirect } from "react-router";
import type { Route } from "./+types/login";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Giriş — İmtahanVer" },
    { name: "description", content: "İmtahanVer Admin İdarəetmə Panelinə Giriş" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (session && session.token) {
    return redirect("/");
  }

  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === 'logout') {
    const clearCookie = await sessionCookie.serialize("", {
      maxAge: 0,
    });
    return redirect("/login", {
      headers: {
        "Set-Cookie": clearCookie,
      },
    });
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch("http://backend:80/api/adminapi/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Giriş uğursuz oldu." };
    }

    const sessionData: AdminSession = {
      token: data.token,
      admin: data.admin,
    };

    const cookieHeader = await sessionCookie.serialize(sessionData);

    return redirect("/", {
      headers: {
        "Set-Cookie": cookieHeader,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return { error: "Server ilə əlaqə qurulmadı." };
  }
}

export default function Login() {
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
      
      <div className="relative w-full max-w-md space-y-8 rounded-3xl border border-slate-900 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M7 9h14M7 14h10M7 19h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="21" cy="19" r="3" fill="#fff" opacity=".95" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">İmtahanVer</h2>
          <p className="mt-1.5 text-sm text-slate-400">Admin İdarəetmə Panelinə Giriş</p>
        </div>

        {actionData?.error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-950/40 bg-red-950/20 p-4 text-sm font-medium text-red-400 animate-pulse">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{actionData.error}</span>
          </div>
        )}

        <Form method="post" className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-poçt ünvanı</label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@imtahanver.az"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Şifrə</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all cursor-pointer text-sm"
          >
            {isSubmitting ? "Daxil olunur..." : "Daxil ol"}
          </button>
        </Form>
      </div>
    </div>
  );
}
