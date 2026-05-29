import { useState, useEffect } from "react";
import { redirect, useLoaderData, Form, Link, useActionData, useNavigation, useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { sessionCookie, type UserSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ana Səhifə — İmtahanVer" },
    { name: "description", content: "İmtahanVer platformasında daxil olun və imtahanlarda iştirak edin." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Fetch MIQ exampages + their subjects (public, no auth needed)
  let miqExampages: any[] = [];
  try {
    const epRes = await fetch('http://backend:80/api/front/miq-exampages');
    const epData = await epRes.json();
    if (epData.success) {
      miqExampages = await Promise.all(
        epData.data.map(async (ep: any) => {
          const subRes = await fetch(`http://backend:80/api/front/miq-exampages/${ep.id}/subjects`);
          const subData = await subRes.json();
          const subjects = subData.success ? subData.data.map((d: any) => d.subject) : [];
          return { ...ep, subjects };
        })
      );
    }
  } catch (err) {
    console.error('MIQ exampages fetch error:', err);
  }

  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;

  if (!session || !session.token) {
    return { session: null, userProfile: null, categories: [], miqExampages, examSessions: [] };
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

    return { session, userProfile, categories, miqExampages, examSessions };
  } catch (err) {
    console.error('Home loader fetch error:', err);
    return { session, userProfile: session.user, categories: [], miqExampages, examSessions: [] };
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

  } catch (err) {
    console.error('Action error:', err);
    return { error: 'Server ilə əlaqə qurulmadı.' };
  }

  return {};
}

export default function Home() {
  const { session, userProfile, categories, miqExampages, examSessions } = useLoaderData<typeof loader>();
  const completedSessions = examSessions ? examSessions.filter((s: any) => s.status === 'completed') : [];
  const completedCount = completedSessions.length;
  const activeCount = examSessions ? examSessions.filter((s: any) => s.status === 'active').length : 0;
  const averageScore = completedCount > 0 
    ? (completedSessions.reduce((acc: number, curr: any) => acc + parseFloat(curr.score), 0) / completedCount).toFixed(1)
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
    setActiveTab(tab);
    if (tab === "exams") {
      navigate("/exams");
    } else if (tab === "settings") {
      navigate("/settings");
    } else {
      navigate("/");
    }
  };

  // Map exampageId → existing session for badge display on cards
  const sessionByExampage: Record<number, any> = examSessions
    ? (examSessions as any[]).reduce((acc: Record<number, any>, s: any) => {
        if (!acc[s.miq_exampage_id]) acc[s.miq_exampage_id] = s;
        return acc;
      }, {})
    : {};

  const [miqView, setMiqView] = useState<"cards" | "exampages">("cards");
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

  if (!session) {
    return (
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-100 dark:border-gray-900 py-4 px-6 md:px-12 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M7 9h14M7 14h10M7 19h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="21" cy="19" r="3" fill="#fff" opacity=".9" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              İmtahan<strong>Ver</strong>
            </span>
          </Link>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Daxil ol
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all">
              Qeydiyyat
            </Link>
          </div>
        </nav>
        <Welcome />
      </div>
    );
  }

  // Mandatory Category Selection Modal for new/unset users
  const isCategoryMissing = !userProfile || !userProfile.user_category_identify;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-12 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-xl border shadow-lg animate-bounce ${
          toastType === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-100 dark:border-emerald-900" 
            : "bg-red-50 dark:bg-red-950/90 text-red-800 dark:text-red-200 border-red-100 dark:border-red-900"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Xoş gəldiniz! 👋</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
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
                        ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20"
                        : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                    onClick={() => setSelectedCategory(cat.identify)}
                  >
                    <input 
                      type="radio" 
                      name="identify" 
                      value={cat.identify} 
                      checked={selectedCategory === cat.identify}
                      onChange={() => {}}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <span className="text-sm font-semibold">{cat.title}</span>
                  </label>
                ))}
              </div>

              <button 
                type="submit" 
                disabled={!selectedCategory || navigation.state === "submitting"}
                className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {navigation.state === "submitting" ? "Saxlanılır..." : "Təsdiqlə və Başla"}
              </button>
            </Form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M7 9h14M7 14h10M7 19h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="21" cy="19" r="3" fill="#fff" opacity=".9" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              İmtahan<strong>Ver</strong> 
              <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full ml-2">Portal</span>
            </span>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
            <button
              onClick={() => handleTabChange("portal")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "portal"
                  ? "bg-white dark:bg-slate-950 shadow-sm text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              İmtahan Portalı
            </button>
            <button
              onClick={() => handleTabChange("exams")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "exams"
                  ? "bg-white dark:bg-slate-950 shadow-sm text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              İmtahanlar
            </button>
            <button
              onClick={() => handleTabChange("settings")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-white dark:bg-slate-950 shadow-sm text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Hesab Tənzimləmələri
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {userProfile?.first_name} {userProfile?.last_name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {userProfile?.email}
              </span>
            </div>

            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow">
              {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
            </div>

            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <button
                type="submit"
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200/55 dark:border-red-900/40 transition-all cursor-pointer"
              >
                Çıxış
              </button>
            </Form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {activeTab === "exams" ? (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">

            {/* ── VIEW 1: exam type cards ── */}
            {miqView === "cards" && (
              <>
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">İmtahanlar</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">İmtahan növünü seçin.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      key: "miq",
                      title: "MİQ İmtahanı",
                      desc: "Müəllimlərin İşə Qəbulu imtahanı. Fənn proqramları, tədris metodikası və pedaqogika üzrə sınaqlar.",
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l6.16-3.422A12.083 12.083 0 0121 13c0 3.866-4.03 7-9 7s-9-3.134-9-7a12.09 12.09 0 012.84-2.422L12 14z" />
                        </svg>
                      ),
                      color: "from-indigo-500 to-violet-600",
                      lightBg: "bg-indigo-50 dark:bg-indigo-950/30",
                      textColor: "text-indigo-600 dark:text-indigo-400",
                      badge: "Müəllim",
                      badgeBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300",
                      clickable: true,
                    },
                    {
                      key: "abituryent",
                      title: "Abituriyent İmtahanı",
                      desc: "Ali məktəblərə qəbul üçün DİM standartlarına uyğun hazırlıq sınaqları.",
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ),
                      color: "from-emerald-500 to-teal-600",
                      lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
                      textColor: "text-emerald-600 dark:text-emerald-400",
                      badge: "DİM",
                      badgeBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
                      clickable: false,
                    },
                    {
                      key: "magistr",
                      title: "Magistr İmtahanı",
                      desc: "Magistraturaya qəbul imtahanına hazırlıq. Məntiq, ixtisas fənni və xarici dil sınaqları.",
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      ),
                      color: "from-amber-500 to-orange-600",
                      lightBg: "bg-amber-50 dark:bg-amber-950/30",
                      textColor: "text-amber-600 dark:text-amber-400",
                      badge: "Magistr",
                      badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
                      clickable: false,
                    },
                    {
                      key: "buraxilis",
                      title: "Buraxılış İmtahanı",
                      desc: "11-ci sinif şagirdləri üçün dövlət buraxılış imtahanına hazırlıq sınaqları.",
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      ),
                      color: "from-rose-500 to-pink-600",
                      lightBg: "bg-rose-50 dark:bg-rose-950/30",
                      textColor: "text-rose-600 dark:text-rose-400",
                      badge: "11-ci sinif",
                      badgeBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300",
                      clickable: false,
                    },
                  ].map((exam) => (
                    <div
                      key={exam.key}
                      onClick={() => exam.clickable && setMiqView("exampages")}
                      className={`group relative flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm transition-all duration-300 ${exam.clickable ? "hover:shadow-xl cursor-pointer" : "opacity-60"}`}
                    >
                      <div className={`h-1.5 w-full bg-gradient-to-r ${exam.color}`} />
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${exam.lightBg} ${exam.textColor}`}>
                            {exam.icon}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${exam.badgeBg}`}>
                              {exam.badge}
                            </span>
                            {!exam.clickable && (
                              <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">Tezliklə</span>
                            )}
                          </div>
                        </div>
                        <h4 className={`text-base font-bold text-slate-900 dark:text-white transition-colors ${exam.clickable ? "group-hover:text-indigo-600 dark:group-hover:text-indigo-400" : ""}`}>
                          {exam.title}
                        </h4>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                          {exam.desc}
                        </p>
                        {exam.clickable ? (
                          <button className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${exam.color} opacity-90 group-hover:opacity-100 shadow-sm hover:shadow-md transition-all cursor-pointer`}>
                            Seç &rarr;
                          </button>
                        ) : (
                          <div className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-center text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-600">
                            Tezliklə
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── VIEW 2: exampage list ── */}
            {miqView === "exampages" && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setMiqView("cards")}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    Geri
                  </button>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">MİQ İmtahanı — Vərəq Seçimi</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">İmtahan vərəqini seçin</p>
                  </div>
                </div>

                {miqExampages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 dark:text-slate-600">
                    <p className="text-sm">Vərəq tapılmadı.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {miqExampages.map((ep: any) => {
                      const existingSession = sessionByExampage[ep.id];
                      const isParticipated = !!existingSession;
                      const href = isParticipated
                        ? `/exam/${existingSession.miq_exampage_id}/${existingSession.miq_subject_id}?session_id=${existingSession.id}`
                        : `/miq-exampages/${ep.id}/subjects`;

                      return (
                        <Link
                          key={ep.id}
                          to={href}
                          className={`group flex flex-col rounded-2xl border bg-white dark:bg-slate-950 p-6 shadow-sm transition-all duration-300 ${
                            isParticipated
                              ? "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg"
                              : "border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              isParticipated
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                            }`}>
                              {isParticipated ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </div>
                            {isParticipated ? (
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                existingSession.status === "completed"
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 animate-pulse"
                              }`}>
                                {existingSession.status === "completed" ? "Tamamlanıb" : "Davam edir"}
                              </span>
                            ) : (
                              <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>

                          <h4 className={`text-base font-bold text-slate-900 dark:text-white transition-colors ${
                            isParticipated
                              ? "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                              : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                          }`}>
                            {ep.title}
                          </h4>

                          {isParticipated ? (
                            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                              Fənn: <span className="font-semibold text-slate-700 dark:text-slate-300">{existingSession.subject?.title ?? "—"}</span>
                              {existingSession.status === "completed" && (
                                <> · Bal: <span className="font-bold text-emerald-600 dark:text-emerald-400">{existingSession.score}</span></>
                              )}
                            </p>
                          ) : (
                            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                              {ep.subjects.length} fənn mövcuddur
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {isParticipated ? (
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                existingSession.status === "completed"
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                                  : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                              }`}>
                                {existingSession.status === "completed" ? "Nəticəyə bax →" : "Davam et →"}
                              </span>
                            ) : (
                              <>
                                {ep.subjects.slice(0, 4).map((s: any) => (
                                  <span key={s.id} className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                    {s.title}
                                  </span>
                                ))}
                                {ep.subjects.length > 4 && (
                                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    +{ep.subjects.length - 4}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </div>
        ) : activeTab === "portal" ? (
          <div>
            {/* Welcome Banner */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none mb-8 animate-in fade-in duration-300">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
              <div className="absolute right-20 bottom-0 h-24 w-24 rounded-full bg-white/5 blur-lg"></div>
              
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md mb-4">
                  🎯 Aktiv Seçim: {categories.find((c: any) => c.identify === userProfile?.user_category_identify)?.title || "Seçilməyib"}
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Xoş gördük, {userProfile?.first_name}!
                </h2>
                <p className="mt-2 text-indigo-100 text-sm sm:text-base">
                  Rəqəmsal İmtahan Platformamıza xoş gəldiniz. Hazırkı kateqoriyanıza uyğun sınaqları aşağıda görə bilərsiniz.
                </p>
              </div>
            </section>

            {/* Quick Statistics */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { label: "Aktiv Sınaqlar", value: activeCount.toString(), trend: "Davam edən sınaqlarınız", color: "from-blue-500 to-cyan-500" },
                { label: "Tamamlanan Sınaqlar", value: completedCount.toString(), trend: "Yekunlaşan sınaqlarınız", color: "from-emerald-500 to-teal-500" },
                { label: "Ortalama Bal", value: averageScore, trend: "Bütün imtahanlar üzrə ortalama", color: "from-amber-500 to-orange-500" },
                { label: "Lider Cədvəli", value: "-", trend: "Reytinq qazanmaq üçün başla", color: "from-indigo-500 to-purple-500" },
              ].map((stat, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
                    <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${stat.color}`}></div>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{stat.trend}</p>
                </div>
              ))}
            </section>

            {/* Exam Cards */}
            <section className="animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sizin üçün Sınaq İmtahanları</h3>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Hamısına bax &rarr;</span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "MİQ & Sertifikasiya: Riyaziyyat",
                    desc: "Müəllimlərin İşə Qəbulu imtahanı çərçivəsində riyaziyyat fənni üzrə xüsusi sınaq.",
                    questions: 40,
                    duration: "90 dəqiqə",
                    badge: "Populyar",
                    badgeColor: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  },
                  {
                    title: "DİM Buraxılış: 11-ci Sinif",
                    desc: "Dövlət İmtahan Mərkəzi standartlarına uyğun ana dili, riyaziyyat və ingilis dili sınağı.",
                    questions: 85,
                    duration: "180 dəqiqə",
                    badge: "DİM",
                    badgeColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                  },
                  {
                    title: "Magistratura: Məntiq & İnformatika",
                    desc: "Magistraturaya qəbul imtahanının birinci mərhələsi üçün model sınaq testləri.",
                    questions: 50,
                    duration: "100 dəqiqə",
                    badge: "Yeni",
                    badgeColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                  }
                ].map((exam, idx) => (
                  <div key={idx} className="group relative flex flex-col justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${exam.badgeColor}`}>
                          {exam.badge}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {exam.title}
                      </h4>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                        {exam.desc}
                      </p>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-4">
                        <span>📋 {exam.questions} sual</span>
                        <span>⏱️ {exam.duration}</span>
                      </div>
                      <button className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 group-hover:bg-indigo-700 rounded-lg transition-all shadow-sm hover:shadow cursor-pointer">
                        İmtahana Başla
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Completed Exams History */}
            {examSessions && examSessions.length > 0 && (
              <section className="mt-12 animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">İmtahan Tarixçəniz</h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Bütün tamamlanan və davam edən sınaqlar</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">İmtahan Vərəqi & Fənn</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Tarix</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Nəticə</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Bal</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Fəaliyyət</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                        {examSessions.map((sess: any) => {
                          const date = new Date(sess.completed_at || sess.started_at);
                          const specialtyPoints = sess.correct_specialty_count * 2 - sess.incorrect_specialty_count * 0.5;
                          const pedagogyPoints = sess.correct_pedagogy_count * 1 - sess.incorrect_pedagogy_count * 0.25;
                          const totalPoints = parseFloat(sess.score);
                          const passed = specialtyPoints >= 34 && pedagogyPoints >= 6 && totalPoints >= 40;

                          return (
                            <tr key={sess.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">{sess.exampage?.title}</p>
                                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">{sess.subject?.title}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-slate-500">{date.toLocaleString("az-AZ")}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  sess.status === "completed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40"
                                    : "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40 animate-pulse"
                                }`}>
                                  {sess.status === "completed" ? "Yekunlaşıb" : "Aktiv"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {sess.status === "completed" ? (
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                    passed
                                      ? "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40"
                                      : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40"
                                  }`}>
                                    {passed ? "Keçdi" : "Kəsildi"}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right font-extrabold text-slate-800 dark:text-slate-200">
                                {sess.status === "completed" ? `${sess.score} / 100` : "-"}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Link
                                  to={`/exam/${sess.miq_exampage_id}/${sess.miq_subject_id}?session_id=${sess.id}`}
                                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                    sess.status === "completed"
                                      ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
                                      : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-950/60"
                                  }`}
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
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Mənim Kateqoriyam</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                İmtahan portalında göstəriləcək sınaq imtahanlarının növünü buradan dəyişdirə bilərsiniz.
              </p>

              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="update-category" />
                <div className="flex flex-col gap-2">
                  {categories.map((cat: any) => (
                    <label 
                      key={cat.identify} 
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedCategory === cat.identify
                          ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400"
                          : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                      onClick={() => setSelectedCategory(cat.identify)}
                    >
                      <input 
                        type="radio" 
                        name="identify" 
                        value={cat.identify} 
                        checked={selectedCategory === cat.identify}
                        onChange={() => {}}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      <span className="text-sm font-semibold">{cat.title}</span>
                    </label>
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={selectedCategory === userProfile?.user_category_identify || navigation.state === "submitting"}
                  className="w-full mt-4 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                >
                  Kateqoriyanı Yenilə
                </button>
              </Form>
            </div>

            {/* Right side: Credentials Updates */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Card 1: Name and Surname */}
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Şəxsi Məlumatlar</h3>
                <Form method="post" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input type="hidden" name="intent" value="update-name" />
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Adınız</label>
                    <input 
                      type="text" 
                      name="first_name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Soyadınız</label>
                    <input 
                      type="text" 
                      name="last_name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end mt-2">
                    <button 
                      type="submit"
                      disabled={firstName === userProfile?.first_name && lastName === userProfile?.last_name || navigation.state === "submitting"}
                      className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                    >
                      Ad/Soyadı Yadda Saxla
                    </button>
                  </div>
                </Form>
              </div>

              {/* Card 2: Email Change */}
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">E-poçt Ünvanını Dəyişdir</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Email ünvanını dəyişmək üçün yeni ünvanınıza 6 rəqəmli OTP təsdiqləmə kodu göndəriləcəkdir.
                </p>

                {emailStep === "request" ? (
                  <Form method="post" className="flex flex-col sm:flex-row gap-3 items-end">
                    <input type="hidden" name="intent" value="request-email" />
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Yeni Email Ünvanı</label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="yeniemail@example.com"
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-all w-full sm:w-auto cursor-pointer"
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
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Təsdiqləmə Kodu (OTP)</label>
                        <input 
                          type="text" 
                          name="otp" 
                          maxLength={6}
                          placeholder="123456"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          required
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setEmailStep("request")}
                        className="py-2.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Geri
                      </button>
                      <button 
                        type="submit" 
                        className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                      >
                        Təsdiqlə və Yenilə
                      </button>
                    </div>
                  </Form>
                )}
              </div>

              {/* Card 3: Password Change */}
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Şifrəni Yenilə</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Təhlükəsizliyiniz üçün şifrə yeniləmə kodu cari email ünvanınıza ({userProfile?.email}) göndəriləcəkdir.
                </p>

                {passwordStep === "request" ? (
                  <Form method="post">
                    <input type="hidden" name="intent" value="request-password" />
                    <button 
                      type="submit" 
                      className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
                    >
                      Şifrə Dəyişmə Kodu Göndər
                    </button>
                  </Form>
                ) : (
                  <Form method="post" className="space-y-4">
                    <input type="hidden" name="intent" value="confirm-password" />



                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Yeni Şifrə</label>
                        <input 
                          type="password" 
                          name="password" 
                          placeholder="Ən azı 8 simvol"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Təsdiqləmə Kodu</label>
                        <input 
                          type="text" 
                          name="otp" 
                          maxLength={6}
                          placeholder="123456"
                          value={passwordOtp}
                          onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, ''))}
                          required
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4">
                      <button 
                        type="button" 
                        onClick={() => setPasswordStep("request")}
                        className="py-2.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Geri
                      </button>
                      <button 
                        type="submit" 
                        disabled={newPassword.length < 8}
                        className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
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
