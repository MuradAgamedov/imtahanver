import { Outlet } from "react-router";
import { Header } from "../components/layout/header";
import { Sidebar } from "../components/layout/sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="ml-60 pt-16">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
