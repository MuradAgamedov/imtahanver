import { sessionCookie } from "../lib/session";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ success: false, message: "Yanlış metod." }, { status: 405 });
  }

  let credential: string | undefined;
  try {
    const body = await request.json();
    credential = body?.credential;
  } catch {
    return Response.json({ success: false, message: "Yanlış sorğu." }, { status: 400 });
  }

  if (!credential) {
    return Response.json({ success: false, message: "Google girişi doğrulanmadı." }, { status: 400 });
  }

  try {
    const res = await fetch("http://backend:80/api/front/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id_token: credential }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return Response.json({ success: false, message: data.message || "Google ilə giriş uğursuz oldu." }, { status: res.status || 401 });
    }

    const cookieHeader = await sessionCookie.serialize({
      token: data.token,
      user: data.user,
    });

    return Response.json(
      { success: true },
      { headers: { "Set-Cookie": cookieHeader } }
    );
  } catch (err) {
    console.error("Google auth error:", err);
    return Response.json({ success: false, message: "Server ilə əlaqə qurulmadı." }, { status: 502 });
  }
}
