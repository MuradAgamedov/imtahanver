import { useState, useEffect } from "react";
import { Form, redirect, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/results";
import { sessionCookie, type AdminSession } from "../lib/session";
import { cn } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Nəticələr — İmtahanVer Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  // Parse query parameters
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const page = url.searchParams.get("page") || "1";

  try {
    let apiPath = `http://backend:80/api/adminapi/exam-results?page=${page}`;
    if (search) apiPath += `&search=${encodeURIComponent(search)}`;
    if (status) apiPath += `&status=${encodeURIComponent(status)}`;

    const res = await fetch(apiPath, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${session.token}`,
      },
    });

    if (res.status === 401) {
      return redirect("/login", {
        headers: {
          "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }),
        },
      });
    }

    const data = await res.json();
    const results = data.success ? data.data : { data: [], current_page: 1, last_page: 1, total: 0 };

    return { results, search, status, page, session };
  } catch (err) {
    console.error("Results loader error:", err);
    return {
      results: { data: [], current_page: 1, last_page: 1, total: 0 },
      search,
      status,
      page,
      session,
    };
  }
}

export default function ResultsPage() {
  const { results, search, status } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState(search);
  const [statusFilter, setStatusFilter] = useState(status);

  // Sync state with loaders
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  useEffect(() => {
    setStatusFilter(status);
  }, [status]);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">İmtahan Nəticələri</h2>
          <p className="text-xs text-gray-500 mt-1">
            İstifadəçilərin başladığı və yekunlaşdırdığı MİQ sınaq imtahanlarının nəticələri və statistikası.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Form method="get" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-xs w-full">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              name="search"
              placeholder="Ad, soyad və ya email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-250 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <select
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-250 bg-white py-2 pl-4 pr-10 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 outline-none cursor-pointer appearance-none"
            >
              <option value="">Bütün Statuslar</option>
              <option value="active">Aktiv</option>
              <option value="completed">Yekunlaşmış</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow"
          >
            Axtar
          </button>
        </div>
      </Form>

      {/* Results Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">İstifadəçi</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">İmtahan Vərəqi & Fənn</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">Tarix</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">İxtisas (D/S)</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450">Metodika (D/S)</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-450 text-right">Toplanmış Bal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.data.map((sess: any) => {
                const started = new Date(sess.started_at);
                const completed = sess.completed_at ? new Date(sess.completed_at) : null;
                return (
                  <tr key={sess.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {sess.user?.first_name} {sess.user?.last_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{sess.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{sess.exampage?.title}</p>
                        <p className="text-xs text-indigo-600 font-semibold mt-0.5">{sess.subject?.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">
                        <p>Başlama: {started.toLocaleString("az-AZ")}</p>
                        {completed && <p className="mt-0.5">Bitmə: {completed.toLocaleString("az-AZ")}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            sess.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                          )}
                        >
                          {sess.status === "completed" ? "Yekunlaşıb" : "Aktiv"}
                        </span>
                        {sess.status === "completed" && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border",
                              sess.passed
                                ? "bg-teal-50 text-teal-700 border-teal-150"
                                : "bg-rose-50 text-rose-700 border-rose-150"
                            )}
                          >
                            {sess.passed ? "Keçdi" : "Kəsildi"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {sess.status === "completed" ? (
                        <div className="text-xs">
                          <span className="text-emerald-600">{sess.correct_specialty_count} D</span>
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-red-500">{sess.incorrect_specialty_count} S</span>
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5">Bal: {sess.specialty_score}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {sess.status === "completed" ? (
                        <div className="text-xs">
                          <span className="text-emerald-600">{sess.correct_pedagogy_count} D</span>
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-red-500">{sess.incorrect_pedagogy_count} S</span>
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5">Bal: {sess.pedagogy_score}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sess.status === "completed" ? (
                        <span className="inline-flex items-center rounded-xl bg-indigo-50 px-3 py-1.5 text-sm font-extrabold text-indigo-600 border border-indigo-100">
                          {sess.score} / 100
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Davam edir</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {results.data.length === 0 && (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400 font-semibold">Nəticə tapılmadı</p>
          </div>
        )}

        {/* Pagination */}
        {results.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-gray-150 bg-white px-6 py-4">
            <div className="flex flex-1 justify-between sm:hidden">
              {results.current_page > 1 && (
                <Form method="get">
                  <input type="hidden" name="search" value={search} />
                  <input type="hidden" name="status" value={status} />
                  <input type="hidden" name="page" value={results.current_page - 1} />
                  <button type="submit" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Əvvəlki
                  </button>
                </Form>
              )}
              {results.current_page < results.last_page && (
                <Form method="get">
                  <input type="hidden" name="search" value={search} />
                  <input type="hidden" name="status" value={status} />
                  <input type="hidden" name="page" value={results.current_page + 1} />
                  <button type="submit" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Növbəti
                  </button>
                </Form>
              )}
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-500">
                  Ümumi <strong className="font-semibold text-gray-900">{results.total}</strong> nəticədən səhifə{" "}
                  <strong className="font-semibold text-gray-900">{results.current_page}</strong> (cəmi {results.last_page} səhifə)
                </p>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: results.last_page }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Form key={pageNum} method="get">
                      <input type="hidden" name="search" value={search} />
                      <input type="hidden" name="status" value={status} />
                      <input type="hidden" name="page" value={pageNum} />
                      <button
                        type="submit"
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-bold border cursor-pointer",
                          results.current_page === pageNum
                            ? "bg-indigo-600 text-white border-transparent"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {pageNum}
                      </button>
                    </Form>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
