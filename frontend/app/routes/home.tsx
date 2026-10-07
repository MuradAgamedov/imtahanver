import { useState, useEffect } from "react";
import { redirect, useLoaderData, Form, Link, useActionData, useNavigation, useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { sessionCookie, type UserSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ana Səhifə — İmtahanVer" },
    { name: "description", content: "İmtahanVer platformasında daxil olun və imtahanlarda iştirak edin." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;

  if (!session || !session.token) {
    return redirect('https://imtahanver.online');
  }

  try {
    // 1. Fetch user categories
    const catResponse = await fetch('http://backend:80/api/front/user-categories');
    const catData = await catResponse.json();
    const categories = catData.success ? catData.data : [];

    // 2. Fetch fresh user profile details
    const profileResponse = await fetch('http://backend:80/api/front/profile', {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Accept': 'application/json'
      }
    });

    if (profileResponse.status === 401) {
      return redirect('/login', {
        headers: {
          'Set-Cookie': await sessionCookie.serialize("", { maxAge: 0 })
        }
      });
    }

    const profileData = await profileResponse.json();
    const userProfile = profileData.success ? profileData.user : null;

    // 3. Fetch user's exam sessions
    const sessionsResponse = await fetch('http://backend:80/api/front/exam-sessions', {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Accept': 'application/json'
      }
    });
    const sessionsData = await sessionsResponse.json();
    const examSessions = sessionsData.success ? sessionsData.data : [];

    // 4. Fetch upcoming paid exam registrations
    const registrationsResponse = await fetch('http://backend:80/api/front/exam-registrations', {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Accept': 'application/json'
      }
    });
    const registrationsData = await registrationsResponse.json();
    const registrations = registrationsData.success ? registrationsData.data : [];

    return { session, userProfile, categories, examSessions, registrations };
  } catch (err) {
    console.error('Home loader fetch error:', err);
    return { session, userProfile: session.user, categories: [], examSessions: [], registrations: [] };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;

  if (!session || !session.token) {
    return redirect('/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'logout') {
    const clearCookie = await sessionCookie.serialize("", {
      maxAge: 0,
    });
    return redirect("/login", {
      headers: {
        "Set-Cookie": clearCookie,
      },
    });
  }

  const token = session.token;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    if (intent === 'update-category') {
      const identify = formData.get('identify') as string;
      const res = await fetch('http://backend:80/api/front/profile/category', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ identify })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || 'Kateqoriya yenilənmədi.' };

      const updatedUser = { ...session.user, user_category_identify: identify };
      const updatedCookie = await sessionCookie.serialize({ ...session, user: updatedUser });
      
      return new Response(
        JSON.stringify({ success: data.message, intent }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': updatedCookie,
          },
        }
      );
    }

    if (intent === 'update-name') {
      const first_name = formData.get('first_name') as string;
      const last_name = formData.get('last_name') as string;
      const res = await fetch('http://backend:80/api/front/profile/name', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ first_name, last_name })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || 'Ad/Soyad yenilənmədi.' };

      const updatedUser = { ...session.user, first_name, last_name };
      const updatedCookie = await sessionCookie.serialize({ ...session, user: updatedUser });
      
      return new Response(
        JSON.stringify({ success: data.message, intent }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': updatedCookie,
          },
        }
      );
    }

    if (intent === 'request-email') {
      const email = formData.get('email') as string;
      const res = await fetch('http://backend:80/api/front/profile/email/request', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || 'Sorğu göndərilmədi.' };
      return { emailStep: 'confirm', newEmail: email, otp_demo: data.otp_demo, success: data.message, intent };
    }

    if (intent === 'confirm-email') {
      const email = formData.get('email') as string;
      const otp = formData.get('otp') as string;
      const res = await fetch('http://backend:80/api/front/profile/email/confirm', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || 'Email təsdiqlənmədi.' };

      const updatedUser = { ...session.user, email };
      const updatedCookie = await sessionCookie.serialize({ ...session, user: updatedUser });
      
      return new Response(
        JSON.stringify({ success: data.message, intent, emailStep: 'success' }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': updatedCookie,
          },
        }
      );
    }

    if (intent === 'request-password') {
      const res = await fetch('http://backend:80/api/front/profile/password/request', {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || 'Sorğu göndərilmədi.' };
      return { passwordStep: 'confirm', otp_demo: data.otp_demo, success: data.message, intent };
    }

    if (intent === 'confirm-password') {
      const password = formData.get('password') as string;
      const otp = formData.get('otp') as string;
      const res = await fetch('http://backend:80/api/front/profile/password/confirm', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ password, otp })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || 'Şifrə dəyişdirilmədi.' };
      return { success: data.message, passwordStep: 'success', intent };
    }

    if (intent === 'cancel-registration') {
      const registrationId = formData.get('registration_id') as string;
      const res = await fetch(`http://backend:80/api/front/exam-registrations/${registrationId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || 'Ləğv edilmədi.' };
      return { success: data.message || 'Qeydiyyat ləğv edildi.', intent };
    }

  } catch (err) {
    console.error('Action error:', err);
    return { error: 'Server ilə əlaqə qurulmadı.' };
  }

  return {};
}

function useStartCountdown(startsAt: string | null) {
  const target = startsAt ? new Date(startsAt).getTime() : 0;
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((target - Date.now()) / 1000)));

  useEffect(() => {
    if (!startsAt) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const formatted = days > 0
    ? `${days}g ${String(hours).padStart(2, "0")}s ${String(minutes).padStart(2, "0")}dəq`
    : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { remaining, formatted, isReady: remaining <= 0 };
}

const CANCELLATION_CUTOFF_SECONDS = 24 * 60 * 60;

function UpcomingRegistrationRow({ registration }: { registration: any }) {
  const exampage = registration.miq_exampage || registration.applicant_exampage;
  const countdown = useStartCountdown(exampage?.starts_at ?? null);
  const canStart = !exampage?.starts_at || countdown.isReady;
  const canCancel = !exampage?.starts_at || countdown.remaining > CANCELLATION_CUTOFF_SECONDS;
  const href = registration.applicant_exampage_id
    ? `/applicant-exampages/${registration.applicant_exampage_id}/groups`
    : `/miq-exampages/${registration.miq_exampage_id}/subjects`;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <div className="flex items-center justify-between rounded-xl border border-violet-150 bg-violet-50/40 p-4">
      <div>
        <p className="text-sm font-bold text-ink">{exampage?.title ?? "İmtahan"}</p>
        <p className="text-xs text-ink-soft mt-0.5">
          {exampage?.starts_at
            ? `Başlama: ${new Date(exampage.starts_at).toLocaleString("az-AZ")}`
            : "Başlama vaxtı bütün istifadəçilər üçün açıqdır"}
        </p>
      </div>
      {canStart ? (
        <Link
          to={href}
          className="flex-shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 transition-all"
        >
          Başla
        </Link>
      ) : (
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className="rounded-xl bg-violet-100 text-violet-700 text-xs font-bold px-4 py-2 tabular-nums">
            {countdown.formatted}
          </span>
          {canCancel ? (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-2 transition-all cursor-pointer"
            >
              Ləğv et
            </button>
          ) : (
            <span className="text-[11px] text-ink-soft/70 max-w-[9rem]">
              1 gündən az qalıb, ləğv edilə bilməz
            </span>
          )}
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper border border-ink/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-ink">Qeydiyyatı ləğv et</h3>
            <p className="text-sm text-ink-soft mt-2">
              <strong className="text-ink">{exampage?.title ?? "İmtahan"}</strong> imtahanına qeydiyyatınızı ləğv etmək istədiyinizə əminsiniz? Ödəniş geri qaytarılacaq.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-ink/10 hover:bg-paper-2 text-ink text-xs font-bold rounded-xl cursor-pointer"
              >
                İmtina
              </button>
              <Form method="post" className="flex-1">
                <input type="hidden" name="intent" value="cancel-registration" />
                <input type="hidden" name="registration_id" value={registration.id} />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Bəli, ləğv et
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { userProfile, categories, examSessions, registrations } = useLoaderData<typeof loader>();
  const paidRegistrations = registrations ? registrations.filter((r: any) => r.status === 'paid') : [];
  const completedSessions = examSessions ? examSessions.filter((s: any) => s.status === 'completed') : [];
  const completedCount = completedSessions.length;
  const activeCount = examSessions ? examSessions.filter((s: any) => s.status === 'active').length : 0;
  // Applicant exam scores stay hidden until an admin approves the grading.
  const scoredSessions = completedSessions.filter(
    (s: any) => !(s.applicant_exampage_id && s.grading_approved === false)
  );
  const averageScore = scoredSessions.length > 0 
    ? (scoredSessions.reduce((acc: number, curr: any) => acc + parseFloat(curr.score), 0) / scoredSessions.length).toFixed(1)
    : "N/A";

  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string): "portal" | "exams" | "settings" => {
    if (path.includes("/exams")) return "exams";
    if (path.includes("/settings")) return "settings";
    return "portal";
  };

  const [activeTab, setActiveTab] = useState<"portal" | "exams" | "settings">(
    getTabFromPath(location.pathname)
  );

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab: "portal" | "exams" | "settings") => {
    if (tab === "exams") {
      navigate("/exams");
    } else if (tab === "settings") {
      navigate("/settings");
    } else {
      setActiveTab("portal");
      navigate("/");
    }
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Email change state
  const [emailStep, setEmailStep] = useState<"request" | "confirm" | "success">("request");
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpDemo, setEmailOtpDemo] = useState("");

  // Password change state
  const [passwordStep, setPasswordStep] = useState<"request" | "confirm" | "success">("request");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordOtpDemo, setPasswordOtpDemo] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Load defaults
  useEffect(() => {
    if (userProfile) {
      setSelectedCategory(userProfile.user_category_identify || "");
      setFirstName(userProfile.first_name || "");
      setLastName(userProfile.last_name || "");
    }
  }, [userProfile]);

  // Handle action results
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        setToastMessage(actionData.error);
        setToastType("error");
      } else if (actionData.success) {
        setToastMessage(actionData.success);
        setToastType("success");

        // Step progressions
        if (actionData.intent === 'request-email') {
          setEmailStep('confirm');
          setNewEmail(actionData.newEmail);
          setEmailOtpDemo(actionData.otp_demo);
        } else if (actionData.intent === 'confirm-email') {
          setEmailStep('request');
          setNewEmail("");
          setEmailOtp("");
          setEmailOtpDemo("");
        } else if (actionData.intent === 'request-password') {
          setPasswordStep('confirm');
          setPasswordOtpDemo(actionData.otp_demo);
        } else if (actionData.intent === 'confirm-password') {
          setPasswordStep('request');
          setNewPassword("");
          setConfirmPassword("");
          setPasswordOtp("");
          setPasswordOtpDemo("");
        }
      }
    }
  }, [actionData]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);


  // Mandatory Category Selection Modal for new/unset users
  const isCategoryMissing = !userProfile || !userProfile.user_category_identify;

  return (
    <div className="min-h-screen bg-paper text-ink font-sans pb-12 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-xl border shadow-lg animate-bounce ${
 toastType === "success" 
   ? "bg-emerald-50 text-emerald-800 border-emerald-100 "
   : "bg-red-50 text-red-800 border-red-100 "
 }`}>
          {toastType === "success" ? (
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Mandatory Category Picker Overlay */}
      {isCategoryMissing && (
        <div className="fixed inset-0 z-50 bg-board/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-paper border border-ink/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-brand/10 text-amber-brand-deep mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Xoş gəldiniz! 👋</h2>
            <p className="text-sm text-ink-soft mt-2">
              Zəhmət olmasa başlamazdan əvvəl kateqoriyanızı seçin. Bu seçim sizin qarşınıza çıxacaq sınaqları tənzimləyəcəkdir.
            </p>

            <Form method="post" className="mt-6 space-y-4">
              <input type="hidden" name="intent" value="update-category" />
              <div className="grid grid-cols-1 gap-2.5">
                {categories.map((cat: any) => (
                  <label 
                    key={cat.identify} 
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
 selectedCategory === cat.identify
   ? "border-amber-brand-deep bg-amber-brand/10 "
   : "border-ink/10 hover:bg-paper "
 }`}
                    onClick={() => setSelectedCategory(cat.identify)}
                  >
                    <input 
                      type="radio" 
                      name="identify" 
                      value={cat.identify} 
                      checked={selectedCategory === cat.identify}
                      onChange={() => {}}
                      className="h-4 w-4 accent-amber-brand"
                    />
                    <span className="text-sm font-semibold">{cat.title}</span>
                  </label>
                ))}
              </div>

              <button 
                type="submit" 
                disabled={!selectedCategory || navigation.state === "submitting"}
                className="w-full mt-6 py-3 px-4 bg-amber-brand hover:bg-amber-brand-deep disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {navigation.state === "submitting" ? "Saxlanılır..." : "Təsdiqlə və Başla"}
              </button>
            </Form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper/80 border-b border-ink/10 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:h-16 sm:py-0 flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1 font-serif-brand">
              <span className="text-lg font-bold text-ink">İmtahan</span>
              <span className="text-lg font-bold text-amber-brand-deep">Ver</span>
            </Link>
            <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 bg-amber-brand/10 text-amber-brand-deep rounded-full ml-1">Portal</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 order-2 sm:order-none">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-semibold text-ink">
                {userProfile?.first_name} {userProfile?.last_name}
              </span>
              <span className="text-xs text-ink-soft">
                {userProfile?.email}
              </span>
            </div>

            <div className="h-9 w-9 rounded-full bg-board text-chalk flex items-center justify-center font-bold text-sm shadow shrink-0">
              {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
            </div>

            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <button
                type="submit"
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200/55 transition-all cursor-pointer"
              >
                Çıxış
              </button>
            </Form>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-1 bg-paper-2 p-1 rounded-xl w-full sm:w-auto overflow-x-auto order-3 sm:order-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => handleTabChange("portal")}
              className={
                "px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 " +
                (activeTab === "portal"
                  ? "bg-paper shadow-sm text-amber-brand-deep"
                  : "text-ink-soft hover:text-ink")
              }
            >
              İmtahan Portalı
            </button>
            <button
              onClick={() => handleTabChange("exams")}
              className={
                "px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 " +
                (activeTab === "exams"
                  ? "bg-paper shadow-sm text-amber-brand-deep"
                  : "text-ink-soft hover:text-ink")
              }
            >
              İmtahanlar
            </button>
            <button
              onClick={() => handleTabChange("settings")}
              className={
                "px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 " +
                (activeTab === "settings"
                  ? "bg-paper shadow-sm text-amber-brand-deep"
                  : "text-ink-soft hover:text-ink")
              }
            >
              Hesab Tənzimləmələri
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {activeTab === "portal" ? (
          <div>
            {/* Welcome Banner */}
            <section className="relative overflow-hidden rounded-2xl bg-board p-8 text-chalk shadow-xl shadow-board/10 mb-8 animate-in fade-in duration-300">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />

              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-chalk/10 border border-chalk/15 px-3 py-1 text-xs font-medium text-chalk/90 mb-4">
                  🎯 Aktiv Seçim: {categories.find((c: any) => c.identify === userProfile?.user_category_identify)?.title || "Seçilməyib"}
                </span>
                <h2 className="font-serif-brand text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Xoş gördük, {userProfile?.first_name}!
                </h2>
                <p className="mt-2 text-chalk-soft text-sm sm:text-base">
                  Rəqəmsal İmtahan Platformamıza xoş gəldiniz. Hazırkı kateqoriyanıza uyğun sınaqları aşağıda görə bilərsiniz.
                </p>
              </div>
            </section>

            {/* Quick Statistics */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { label: "Aktiv Sınaqlar", value: activeCount.toString(), trend: "Davam edən sınaqlarınız", color: "bg-sky-500" },
                { label: "Tamamlanan Sınaqlar", value: completedCount.toString(), trend: "Yekunlaşan sınaqlarınız", color: "bg-emerald-500" },
                { label: "Ortalama Bal", value: averageScore, trend: "Bütün imtahanlar üzrə ortalama", color: "bg-amber-brand" },
                { label: "Lider Cədvəli", value: "-", trend: "Reytinq qazanmaq üçün başla", color: "bg-board" },
              ].map((stat, idx) => (
                <div key={idx} className="rounded-xl border border-ink/10 bg-paper p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-soft">{stat.label}</span>
                    <div className={`h-2.5 w-2.5 rounded-full ${stat.color}`}></div>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-ink">{stat.value}</p>
                  <p className="mt-1 text-xs text-ink-soft/70">{stat.trend}</p>
                </div>
              ))}
            </section>

            {/* Exam CTA */}
            <section className="animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-ink">Sınaq İmtahanları</h3>
                <Link to="/exams" className="text-sm font-semibold text-amber-brand-deep hover:underline">Hamısına bax &rarr;</Link>
              </div>

              <Link
                to="/exams"
                className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-dashed border-ink/20 bg-paper-2 p-6 hover:border-amber-brand-deep transition-colors"
              >
                <div>
                  <h4 className="text-base font-bold text-ink">Yeni sınağa başlayın</h4>
                  <p className="mt-1 text-sm text-ink-soft">
                    Kateqoriyanıza uyğun imtahan növünü seçin və dərhal başlayın.
                  </p>
                </div>
                <span className="shrink-0 py-2.5 px-6 text-sm font-semibold text-white bg-amber-brand group-hover:bg-amber-brand-deep rounded-lg transition-all shadow-sm text-center">
                  İmtahanlara bax
                </span>
              </Link>
            </section>

            {/* Upcoming paid/scheduled exam registrations */}
            {paidRegistrations.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-bold text-ink mb-4">Qeydiyyatlarım</h3>
                <div className="space-y-3">
                  {paidRegistrations.map((r: any) => (
                    <UpcomingRegistrationRow key={r.id} registration={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Exams History */}
            {examSessions && examSessions.length > 0 && (
              <section className="mt-12 animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-ink">İmtahan Tarixçəniz</h3>
                  <span className="text-xs text-ink-soft/70 font-medium">Bütün tamamlanan və davam edən sınaqlar</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-ink/10 bg-paper/50">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-soft/70">İmtahan Vərəqi & Fənn</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-soft/70">Tarix</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-soft/70">Status</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-soft/70">Nəticə</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-soft/70 text-right">Bal</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-soft/70 text-right">Fəaliyyət</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10">
                        {examSessions.map((sess: any) => {
                          const isApplicant = sess.applicant_exampage_id !== null;
                          const date = new Date(sess.completed_at || sess.started_at);
                          
                          if (sess.applicant_exampage_id) {
                            const ungraded = sess.applicant_breakdown?.reduce((acc: number, curr: any) => acc + (curr.written_ungraded || 0), 0) || 0;
                            const isCompleted = sess.status === "completed";
                            const awaitingApproval = isCompleted && sess.grading_approved === false;

                            return (
                              <tr key={sess.id} className="hover:bg-paper/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="font-semibold text-ink">{sess.applicant_exampage?.title}</p>
                                    <p className="text-xs text-emerald-600 font-medium mt-0.5">Qrup: {sess.applicant_group?.title}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs text-ink-soft">{date.toLocaleString("az-AZ")}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
 isCompleted
   ? "bg-emerald-50 text-emerald-700 border border-emerald-100 "
   : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
 }`}>
                                    {isCompleted ? "Yekunlaşıb" : "Aktiv"}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  {isCompleted ? (
                                    awaitingApproval ? (
                                      <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-150 px-2.5 py-0.5 text-xs font-bold">
                                        Müəllim yoxlayır
                                      </span>
                                    ) : ungraded > 0 ? (
                                      <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-150 px-2.5 py-0.5 text-xs font-bold">
                                        Yoxlanılır ({ungraded} sual)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center rounded-full bg-teal-50 text-teal-700 border border-teal-150 px-2.5 py-0.5 text-xs font-bold">
                                        Yoxlanılıb
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-ink-soft/70">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right font-extrabold text-ink">
                                  {awaitingApproval
                                    ? <span className="text-xs font-semibold text-ink-soft/70">Müəllim yoxlayır</span>
                                    : isCompleted
                                    ? `${sess.score} / ${sess.applicant_max_score || ((sess.applicant_group?.identify?.toLowerCase().includes("burax") || sess.applicant_group?.title?.toLowerCase().includes("burax")) ? 300 : 400)}`
                                    : "-"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Link
                                    to={isCompleted
                                      ? `/exam/applicant/${sess.applicant_exampage_id}/${sess.applicant_group_id}?session_id=${sess.id}`
                                      : `/exam/applicant/${sess.applicant_exampage_id}/${sess.applicant_group_id}`}
                                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
 isCompleted
   ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 "
   : "bg-amber-50 text-amber-600 hover:bg-amber-100 "
 }`}
                                  >
                                    {isCompleted ? "Nəticəyə bax" : "Davam et"}
                                  </Link>
                                </td>
                              </tr>
                            );
                          }

                          const specialtyPoints = sess.correct_specialty_count * 2 - sess.incorrect_specialty_count * 0.5;
                          const pedagogyPoints = sess.correct_pedagogy_count * 1 - sess.incorrect_pedagogy_count * 0.25;
                          const totalPoints = parseFloat(sess.score);
                          const passed = specialtyPoints >= 34 && pedagogyPoints >= 6 && totalPoints >= 40;

                          return (
                            <tr key={sess.id} className="hover:bg-paper/50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-ink">{sess.exampage?.title}</p>
                                  <p className="text-xs text-amber-brand-deep font-medium mt-0.5">{sess.subject?.title}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-ink-soft">{date.toLocaleString("az-AZ")}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
 sess.status === "completed"
   ? "bg-emerald-50 text-emerald-700 border border-emerald-100 "
   : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
 }`}>
                                  {sess.status === "completed" ? "Yekunlaşıb" : "Aktiv"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {sess.status === "completed" ? (
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
 passed
   ? "bg-teal-50 text-teal-700 border-teal-100 "
   : "bg-rose-50 text-rose-700 border-rose-100 "
 }`}>
                                    {passed ? "Keçdi" : "Kəsildi"}
                                  </span>
                                ) : (
                                  <span className="text-ink-soft/70">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right font-extrabold text-ink">
                                {sess.status === "completed" ? `${sess.score} / 100` : "-"}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Link
                                  to={`/exam/${sess.miq_exampage_id}/${sess.miq_subject_id}?session_id=${sess.id}`}
                                  className={
                                    "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all " +
                                    (sess.status === "completed"
                                      ? "bg-amber-brand/10 text-amber-brand-deep hover:bg-amber-brand/20"
                                      : "bg-amber-50 text-amber-600 hover:bg-amber-100")
                                  }
                                >
                                  {sess.status === "completed" ? "Nəticəyə bax" : "Davam et"}
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Profile Settings Grid */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-in fade-in duration-300">
            
            {/* Left side: Category Selector */}
            <div className="bg-paper border border-ink/10 p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-ink mb-2">Mənim Kateqoriyam</h3>
              <p className="text-xs text-ink-soft mb-6">
                İmtahan portalında göstəriləcək sınaq imtahanlarının növünü buradan dəyişdirə bilərsiniz.
              </p>

              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="update-category" />
                <div className="flex flex-col gap-2">
                  {categories.map((cat: any) => (
                    <label 
                      key={cat.identify} 
                      className={
                        "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all " +
                        (selectedCategory === cat.identify
                          ? "border-amber-brand-deep bg-amber-brand/10 text-amber-brand-deep"
                          : "border-ink/10 hover:bg-paper-2")
                      }
                      onClick={() => setSelectedCategory(cat.identify)}
                    >
                      <input 
                        type="radio" 
                        name="identify" 
                        value={cat.identify} 
                        checked={selectedCategory === cat.identify}
                        onChange={() => {}}
                        className="h-4 w-4 accent-amber-brand"
                      />
                      <span className="text-sm font-semibold">{cat.title}</span>
                    </label>
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={selectedCategory === userProfile?.user_category_identify || navigation.state === "submitting"}
                  className="w-full mt-4 py-2.5 px-4 bg-amber-brand hover:bg-amber-brand-deep disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                >
                  Kateqoriyanı Yenilə
                </button>
              </Form>
            </div>

            {/* Right side: Credentials Updates */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Card 1: Name and Surname */}
              <div className="bg-paper border border-ink/10 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-ink">Şəxsi Məlumatlar</h3>
                  {userProfile?.user_code && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 border border-ink/10 px-3 py-1 text-xs font-semibold text-ink-soft">
                      İstifadəçi ID: <span className="font-mono text-ink">#{userProfile.user_code}</span>
                    </span>
                  )}
                </div>
                <Form method="post" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input type="hidden" name="intent" value="update-name" />
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">Adınız</label>
                    <input 
                      type="text" 
                      name="first_name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-brand/30 focus:border-amber-brand-deep outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">Soyadınız</label>
                    <input 
                      type="text" 
                      name="last_name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-brand/30 focus:border-amber-brand-deep outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end mt-2">
                    <button 
                      type="submit"
                      disabled={firstName === userProfile?.first_name && lastName === userProfile?.last_name || navigation.state === "submitting"}
                      className="py-2.5 px-6 bg-amber-brand hover:bg-amber-brand-deep disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                    >
                      Ad/Soyadı Yadda Saxla
                    </button>
                  </div>
                </Form>
              </div>

              {/* Card 2: Email Change */}
              <div className="bg-paper border border-ink/10 p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-ink mb-2">E-poçt Ünvanını Dəyişdir</h3>
                <p className="text-xs text-ink-soft mb-6">
                  Email ünvanını dəyişmək üçün yeni ünvanınıza 6 rəqəmli OTP təsdiqləmə kodu göndəriləcəkdir.
                </p>

                {emailStep === "request" ? (
                  <Form method="post" className="flex flex-col sm:flex-row gap-3 items-end">
                    <input type="hidden" name="intent" value="request-email" />
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">Yeni Email Ünvanı</label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="yeniemail@example.com"
                        required
                        className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-brand/30 focus:border-amber-brand-deep outline-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="py-2.5 px-6 bg-amber-brand hover:bg-amber-brand-deep text-white text-sm font-semibold rounded-xl shadow transition-all w-full sm:w-auto cursor-pointer"
                    >
                      Kod Göndər
                    </button>
                  </Form>
                ) : (
                  <Form method="post" className="space-y-4">
                    <input type="hidden" name="intent" value="confirm-email" />
                    <input type="hidden" name="email" value={newEmail} />



                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">Təsdiqləmə Kodu (OTP)</label>
                        <input 
                          type="text" 
                          name="otp" 
                          maxLength={6}
                          placeholder="123456"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          required
                          className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-brand/30 focus:border-amber-brand-deep outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setEmailStep("request")}
                        className="py-2.5 px-5 bg-paper-2 hover:bg-paper-2 text-ink-soft text-sm font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Geri
                      </button>
                      <button 
                        type="submit" 
                        className="py-2.5 px-6 bg-amber-brand hover:bg-amber-brand-deep text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                      >
                        Təsdiqlə və Yenilə
                      </button>
                    </div>
                  </Form>
                )}
              </div>

              {/* Card 3: Password Change */}
              <div className="bg-paper border border-ink/10 p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-ink mb-2">Şifrəni Yenilə</h3>
                <p className="text-xs text-ink-soft mb-6">
                  Təhlükəsizliyiniz üçün şifrə yeniləmə kodu cari email ünvanınıza ({userProfile?.email}) göndəriləcəkdir.
                </p>

                {passwordStep === "request" ? (
                  <Form method="post">
                    <input type="hidden" name="intent" value="request-password" />
                    <button 
                      type="submit" 
                      className="py-2.5 px-6 bg-amber-brand hover:bg-amber-brand-deep text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                    >
                      Şifrə Dəyişmə Kodu Göndər
                    </button>
                  </Form>
                ) : (
                  <Form method="post" className="space-y-4">
                    <input type="hidden" name="intent" value="confirm-password" />



                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">Yeni Şifrə</label>
                        <input 
                          type="password" 
                          name="password" 
                          placeholder="Ən azı 8 simvol"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-brand/30 focus:border-amber-brand-deep outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">Təsdiqləmə Kodu</label>
                        <input 
                          type="text" 
                          name="otp" 
                          maxLength={6}
                          placeholder="123456"
                          value={passwordOtp}
                          onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, ''))}
                          required
                          className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-brand/30 focus:border-amber-brand-deep outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4">
                      <button 
                        type="button" 
                        onClick={() => setPasswordStep("request")}
                        className="py-2.5 px-5 bg-paper-2 hover:bg-paper-2 text-ink-soft text-sm font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Geri
                      </button>
                      <button 
                        type="submit" 
                        disabled={newPassword.length < 8}
                        className="py-2.5 px-6 bg-amber-brand hover:bg-amber-brand-deep disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                      >
                        Şifrəni Yenilə
                      </button>
                    </div>
                  </Form>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
