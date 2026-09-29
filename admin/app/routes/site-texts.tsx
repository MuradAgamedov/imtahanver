import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/site-texts";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sayt Mətnləri — İmtahanVer Admin" }];
}

type FieldDef = { key: string; label: string; multiline?: boolean };
type GroupDef = { title: string; description: string; fields: FieldDef[] };

const GROUPS: GroupDef[] = [
  {
    title: "Başlıq (Header)",
    description: "Yuxarı zolaq və loqo yanındakı tagline.",
    fields: [
      { key: "topbar.tagline", label: "Üst zolaq mətni" },
      { key: "brand.tagline", label: "Loqo yanındakı tagline" },
    ],
  },
  {
    title: "Hero bölməsi",
    description: "Ana səhifənin ən yuxarı hissəsi.",
    fields: [
      { key: "hero.eyebrow_left", label: "Sol kiçik mətn" },
      { key: "hero.eyebrow_right", label: "Sağ kiçik mətn" },
      { key: "hero.subtitle", label: "Alt mətn", multiline: true },
      { key: "hero.cta_text", label: "Düymə mətni" },
    ],
  },
  {
    title: "Etibar zolağı",
    description: "Hero bölməsinin altındakı 3 tik-işarəli mətn.",
    fields: [
      { key: "trust.item1", label: "1-ci mətn" },
      { key: "trust.item2", label: "2-ci mətn" },
      { key: "trust.item3", label: "3-cü mətn" },
    ],
  },
  {
    title: "Necə işləyir",
    description: "3 addımlı bölmə.",
    fields: [
      { key: "steps.heading", label: "Bölmə başlığı" },
      { key: "steps.subtitle", label: "Bölmə alt mətni", multiline: true },
      { key: "steps.1_title", label: "1-ci addım başlığı" },
      { key: "steps.1_desc", label: "1-ci addım mətni", multiline: true },
      { key: "steps.2_title", label: "2-ci addım başlığı" },
      { key: "steps.2_desc", label: "2-ci addım mətni", multiline: true },
      { key: "steps.3_title", label: "3-cü addım başlığı" },
      { key: "steps.3_desc", label: "3-cü addım mətni", multiline: true },
    ],
  },
  {
    title: "Xüsusiyyətlər bölməsi başlığı",
    description: "Xüsusiyyət kartlarının siyahısı ayrıca 'Ana Səhifə → Xüsusiyyətlər' ekranından idarə olunur.",
    fields: [
      { key: "features.heading", label: "Bölmə başlığı" },
      { key: "features.subtitle", label: "Bölmə alt mətni", multiline: true },
    ],
  },
  {
    title: "Fənlər bölməsi",
    description: "MİQ fənn etiketləri 'MİQ Fənləri' ekranından idarə olunur (avtomatik gəlir).",
    fields: [
      { key: "fenler.heading", label: "Bölmə başlığı" },
      { key: "fenler.subtitle", label: "Bölmə alt mətni", multiline: true },
      { key: "fenler.soon_heading", label: "'Tezliklə gələcək' başlığı" },
      { key: "soon.1_title", label: "1-ci kart başlığı" },
      { key: "soon.1_desc", label: "1-ci kart mətni", multiline: true },
      { key: "soon.2_title", label: "2-ci kart başlığı" },
      { key: "soon.2_desc", label: "2-ci kart mətni", multiline: true },
      { key: "soon.3_title", label: "3-cü kart başlığı" },
      { key: "soon.3_desc", label: "3-cü kart mətni", multiline: true },
    ],
  },
  {
    title: "FAQ bölməsi başlığı",
    description: "Sualların siyahısı ayrıca 'Ana Səhifə → Suallar (FAQ)' ekranından idarə olunur.",
    fields: [
      { key: "faq.heading", label: "Bölmə başlığı" },
      { key: "faq.subtitle", label: "Bölmə alt mətni", multiline: true },
    ],
  },
  {
    title: "Son çağırış (CTA) zolağı",
    description: "Səhifələrin altındakı tünd banner.",
    fields: [
      { key: "cta.heading", label: "Başlıq" },
      { key: "cta.primary_text", label: "Əsas düymə mətni" },
      { key: "cta.secondary_text", label: "İkinci düymə mətni" },
    ],
  },
  {
    title: "Footer",
    description: "Sayt altlığı. Email/telefon 'Əlaqə Məlumatları' ekranından idarə olunur.",
    fields: [
      { key: "footer.tagline", label: "Marka təsviri", multiline: true },
      { key: "footer.copyright", label: "Müəllif hüququ mətni (il avtomatik əlavə olunur)" },
    ],
  },
  {
    title: "Əlaqə səhifəsi",
    description: "'/elaqe' səhifəsinin başlıq mətnləri.",
    fields: [
      { key: "contact.heading", label: "Başlıq" },
      { key: "contact.subtitle", label: "Alt mətn", multiline: true },
      { key: "contact.form_heading", label: "Form başlığı" },
    ],
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const res = await fetch("http://backend:80/api/adminapi/site-texts", {
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
    return { texts: data.success ? data.data : {} };
  } catch (err) {
    console.error("Site texts loader error:", err);
    return { texts: {} };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const texts: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    texts[key] = value as string;
  }

  try {
    const res = await fetch("http://backend:80/api/adminapi/site-texts", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ texts }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || "Mətnlər yenilənmədi." };
    return { success: data.message || "Mətnlər yeniləndi.", texts: data.data };
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın." };
  }
}

export default function SiteTextsPage() {
  const { texts } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();

  const current = actionData?.texts ?? texts;

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
        <h2 className="text-lg font-bold text-gray-900">Sayt Mətnləri</h2>
        <p className="text-xs text-gray-500 mt-1">
          Ana səhifə, Əlaqə səhifəsi və footerdəki bütün sabit mətnləri buradan idarə edin.
        </p>
      </div>

      <Form method="post" className="space-y-6">
        {GROUPS.map((group) => (
          <div key={group.title} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{group.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
            </div>
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {field.label}
                </label>
                {field.multiline ? (
                  <textarea
                    name={field.key}
                    defaultValue={current?.[field.key] ?? ""}
                    rows={2}
                    className={`${inputClass} resize-y`}
                  />
                ) : (
                  <input
                    type="text"
                    name={field.key}
                    defaultValue={current?.[field.key] ?? ""}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="flex justify-end sticky bottom-4">
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
          >
            Hamısını Yadda Saxla
          </button>
        </div>
      </Form>
    </div>
  );
}
