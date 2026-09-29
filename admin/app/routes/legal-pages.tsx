import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/legal-pages";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Hüquqi Səhifələr — İmtahanVer Admin" }];
}

const TABS = [
  { slug: "privacy", label: "Məxfilik Siyasəti" },
  { slug: "terms", label: "İstifadə Şərtləri" },
  { slug: "refund", label: "Ödəniş və Geri Qaytarma" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const res = await fetch("http://backend:80/api/adminapi/legal-pages", {
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
    return { pages: data.success ? data.data : [] };
  } catch (err) {
    console.error("Legal pages loader error:", err);
    return { pages: [] };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const slug = formData.get("slug") as string;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${session.token}`,
  };

  try {
    const res = await fetch(`http://backend:80/api/adminapi/legal-pages/${slug}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        heading: formData.get("heading"),
        body: formData.get("body"),
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || "Səhifə yenilənmədi.", slug };
    return { success: data.message || "Səhifə yeniləndi.", page: data.data, slug };
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.", slug };
  }
}

export default function LegalPagesPage() {
  const { pages } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();

  const [activeSlug, setActiveSlug] = useState(actionData?.slug ?? TABS[0].slug);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

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

  function pageFor(slug: string) {
    if (actionData?.slug === slug && actionData?.page) return actionData.page;
    return pages.find((p: any) => p.slug === slug);
  }

  const current = pageFor(activeSlug);
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
        <h2 className="text-lg font-bold text-gray-900">Hüquqi Səhifələr</h2>
        <p className="text-xs text-gray-500 mt-1">
          Sayt footerində linklənən Məxfilik Siyasəti, İstifadə Şərtləri və Ödəniş/Geri Qaytarma səhifələrinin məzmununu buradan idarə edin.
        </p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveSlug(tab.slug)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors ${
                activeSlug === tab.slug ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Form method="post" className="space-y-5 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm" key={activeSlug}>
        <input type="hidden" name="slug" value={activeSlug} />
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Başlıq</label>
          <input type="text" name="heading" defaultValue={current?.heading ?? ""} required className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mətn</label>
          <p className="text-xs text-gray-400 mb-1.5">
            Alt başlıq üçün sətri "## " ilə başladın (məs. "## Hansı şəxsi məlumatlar toplanır"). Abzasları ayırmaq üçün boş sətir buraxın.
          </p>
          <textarea name="body" defaultValue={current?.body ?? ""} required rows={16} className={`${inputClass} resize-y font-mono text-xs leading-relaxed`} />
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
