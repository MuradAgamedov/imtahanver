import type { Route } from "./+types/api.upload-applicant-image";
import { sessionCookie, type AdminSession } from "../lib/session";

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session?.token) {
    return new Response(JSON.stringify({ success: false, message: "Giriş tələb olunur." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return new Response(JSON.stringify({ success: false, message: "Şəkil tapılmadı." }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Forward to backend via internal Docker network (no CORS issue)
  const fd = new FormData();
  fd.append("image", file, file.name);

  const res = await fetch("http://backend:80/api/adminapi/applicant-questions/upload-image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.token}`,
      Accept: "application/json",
    },
    body: fd,
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
