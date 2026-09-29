import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/home-about";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Haqqımızda — İmtahanVer Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const res = await fetch("http://backend:80/api/adminapi/home-about", {
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
    return { about: data.success ? data.data : null };
  } catch (err) {
    console.error("Home About loader error:", err);
    return { about: null };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${session.token}`,
  };

  try {
    const res = await fetch("http://backend:80/api/adminapi/home-about", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        heading: formData.get("heading"),
        intro: formData.get("intro"),
        body: formData.get("body"),
        mission_heading: formData.get("mission_heading"),
        mission_text: formData.get("mission_text"),
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || "Məlumatlar yenilənmədi." };
    return { success: data.message || "Haqqımızda bölməsi yeniləndi.", about: data.data };
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın." };
  }
}

export default function HomeAboutPage() {
  const { about } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const current = actionData?.about ?? about;

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setToastMessage(actionData.success);
        setToastType("success");
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

  const inputClass =
    "w-full bg-slate-50 border border-gray-250 rounded-xl px-4.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none";

  return (
    <div className="space-y-6 relative max-w-3xl">
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl animate-bounce ${
          toastType === "success"
            ? "bg-emerald-950/95 text-emerald-200 border-emerald-900/60"
            : "bg-red-950/95 text-red-200 border-red-900/60"
        }`}>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Haqqımızda</h2>
        <p className="text-xs text-gray-500 mt-1">
          Ana səhifədəki "/haqqimizda" səhifəsinin mətn məzmununu buradan idarə edin.
        </p>
      </div>

      <Form method="post" className="space-y-5 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Başlıq</label>
          <input type="text" name="heading" defaultValue={current?.heading ?? ""} required className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Giriş abzası
          </label>
          <textarea name="intro" defaultValue={current?.intro ?? ""} required rows={2} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Əsas mətn
          </label>
          <p className="text-xs text-gray-400 mb-1.5">Abzasları ayırmaq üçün boş sətir buraxın.</p>
          <textarea name="body" defaultValue={current?.body ?? ""} required rows={8} className={`${inputClass} resize-y`} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Missiya başlığı
          </label>
          <input type="text" name="mission_heading" defaultValue={current?.mission_heading ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Missiya mətni
          </label>
          <textarea name="mission_text" defaultValue={current?.mission_text ?? ""} rows={4} className={`${inputClass} resize-y`} />
        </div>
        <div className="flex justify-end pt-2">
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
  );
}
