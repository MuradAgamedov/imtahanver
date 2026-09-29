import type { Route } from "./+types/api.users-search";
import { sessionCookie, type AdminSession } from "../lib/session";

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session?.token) {
    return new Response(JSON.stringify({ success: false, data: [] }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";

  const res = await fetch(`http://backend:80/api/adminapi/users/search?q=${encodeURIComponent(q)}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.token}`,
    },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
