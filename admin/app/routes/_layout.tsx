import { useState } from "react";
import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/_layout";
import { Header } from "../components/layout/header";
import { Sidebar } from "../components/layout/sidebar";
import { sessionCookie, type AdminSession } from "../lib/session";

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  return { session };
}

export default function AdminLayout() {
  const { session } = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar session={session} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header session={session} onMenuClick={() => setSidebarOpen(true)} />
      <main className="lg:ml-60 pt-16">
        <div className="p-4 lg:p-6">
          <Outlet context={{ session }} />
        </div>
      </main>
    </div>
  );
}
