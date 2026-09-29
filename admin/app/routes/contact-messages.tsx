import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useActionData, useNavigation, useSubmit } from "react-router";
import type { Route } from "./+types/contact-messages";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Əlaqə Mesajları — İmtahanVer Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const res = await fetch("http://backend:80/api/adminapi/contact-messages", {
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
    return { messages: data.success ? data.data : [] };
  } catch (err) {
    console.error("Contact messages loader error:", err);
    return { messages: [] };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${session.token}`,
  };

  try {
    if (intent === "mark-read") {
      const res = await fetch(`http://backend:80/api/adminapi/contact-messages/${id}/read`, { method: "PUT", headers });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Yenilənmədi." };
      return { success: data.message };
    }

    if (intent === "mark-unread") {
      const res = await fetch(`http://backend:80/api/adminapi/contact-messages/${id}/unread`, { method: "PUT", headers });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Yenilənmədi." };
      return { success: data.message };
    }

    if (intent === "delete") {
      const res = await fetch(`http://backend:80/api/adminapi/contact-messages/${id}`, { method: "DELETE", headers });
      const data = await res.json();
      if (!res.ok) return { error: data.message || "Silinmədi." };
      return { success: data.message };
    }
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın." };
  }

  return {};
}

export default function ContactMessagesPage() {
  const { messages } = useLoaderData<typeof loader>();
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const submit = useSubmit();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setToastMessage(actionData.success);
        setToastType("success");
        setShowDeleteConfirm(false);
      } else if (actionData.error) {
        setToastMessage(actionData.error);
        setToastType("error");
      }
    }
  }, [actionData]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const unreadCount = messages.filter((m: any) => !m.is_read).length;
  const visibleMessages = filter === "unread" ? messages.filter((m: any) => !m.is_read) : messages;

  function toggleRead(msg: any) {
    const fd = new FormData();
    fd.append("intent", msg.is_read ? "mark-unread" : "mark-read");
    fd.append("id", msg.id);
    submit(fd, { method: "post" });
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage({ ...msg, is_read: !msg.is_read });
    }
  }

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
          <h2 className="text-lg font-bold text-gray-900">Əlaqə Mesajları</h2>
          <p className="text-xs text-gray-500 mt-1">
            "/elaqe" səhifəsindəki əlaqə formundan göndərilən mesajlar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors ${filter === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Hamısı ({messages.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors ${filter === "unread" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Oxunmamış ({unreadCount})
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {visibleMessages.map((msg: any) => (
          <div
            key={msg.id}
            onClick={() => setSelectedMessage(msg)}
            className={`flex items-center justify-between bg-white border rounded-2xl p-4.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer ${
              msg.is_read ? "border-gray-150" : "border-indigo-200 bg-indigo-50/30"
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {!msg.is_read && <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{msg.name}</h4>
                  <span className="text-xs text-gray-400">{msg.email}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xl">{msg.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 pl-4">
              <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString("az-AZ")}</span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleRead(msg); }}
                title={msg.is_read ? "Oxunmamış et" : "Oxunmuş et"}
                className="rounded-lg p-2 text-gray-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {msg.is_read ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M22 12.5V18a2 2 0 01-2 2H4a2 2 0 01-2-2v-5.5M22 12.5L13.4 7.3a2.5 2.5 0 00-2.8 0L2 12.5M22 12.5L14.5 17M2 12.5L9.5 17" />
                  )}
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedMessage(msg); setShowDeleteConfirm(true); }}
                title="Sil"
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {visibleMessages.length === 0 && (
          <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400 font-semibold">Mesaj tapılmadı</p>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedMessage && !showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white border border-gray-150 rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedMessage.name}</h3>
                <a href={`mailto:${selectedMessage.email}`} className="text-sm text-indigo-600 hover:underline">{selectedMessage.email}</a>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-650 cursor-pointer">✕</button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
            <p className="text-xs text-gray-400 mt-4">{new Date(selectedMessage.created_at).toLocaleString("az-AZ")}</p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => toggleRead(selectedMessage)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer"
              >
                {selectedMessage.is_read ? "Oxunmamış et" : "Oxunmuş et"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl cursor-pointer"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">Mesajı Sil</h3>
            <p className="text-sm text-gray-500">
              <strong>{selectedMessage.name}</strong> tərəfindən göndərilən mesajı silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <Form method="post" className="flex gap-3 justify-end mt-6">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={selectedMessage.id} />
              <button type="button" onClick={() => { setShowDeleteConfirm(false); setSelectedMessage(null); }}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">İmtina</button>
              <button type="submit" disabled={navigation.state === "submitting"}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow cursor-pointer">Sil</button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
