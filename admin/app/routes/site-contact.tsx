import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/site-contact";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Əlaqə Məlumatları — İmtahanVer Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const res = await fetch("http://backend:80/api/adminapi/site-contact", {
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
    return { contact: data.success ? data.data : null };
  } catch (err) {
    console.error("Site contact loader error:", err);
    return { contact: null };
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
    const res = await fetch("http://backend:80/api/adminapi/site-contact", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        email: formData.get("email"),
        phone: formData.get("phone"),
        whatsapp: formData.get("whatsapp"),
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || "Məlumatlar yenilənmədi." };
    return { success: data.message || "Əlaqə məlumatları yeniləndi.", contact: data.data };
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın." };
  }
}

export default function SiteContactPage() {
  const { contact } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const current = actionData?.contact ?? contact;

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
    <div className="space-y-6 relative max-w-2xl">
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
        <h2 className="text-lg font-bold text-gray-900">Əlaqə Məlumatları</h2>
        <p className="text-xs text-gray-500 mt-1">
          "/elaqe" səhifəsində göstərilən email, telefon və WhatsApp nömrəsini buradan idarə edin.
        </p>
      </div>

      <Form method="post" className="space-y-5 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
          <input type="email" name="email" defaultValue={current?.email ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Telefon nömrəsi
          </label>
          <p className="text-xs text-gray-400 mb-1.5">Boş buraxılsa, əlaqə səhifəsində telefon nömrəsi göstərilmir.</p>
          <input type="text" name="phone" defaultValue={current?.phone ?? ""} placeholder="+994 XX XXX XX XX" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            WhatsApp nömrəsi
          </label>
          <p className="text-xs text-gray-400 mb-1.5">
            Ölkə kodu ilə daxil edin (məs. +994501234567). Ana səhifədəki mesaj ikonu və əlaqə səhifəsi buna göndəriləcək.
          </p>
          <input type="text" name="whatsapp" defaultValue={current?.whatsapp ?? ""} placeholder="+994501234567" className={inputClass} />
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
