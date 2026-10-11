import { sessionCookie, type AdminSession } from "../lib/session";

export async function loader({ request }: any) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session?.token) {
    return new Response(JSON.stringify({ success: false, message: "Giriş tələb olunur." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const examType = url.searchParams.get("type");
  const exampageId = url.searchParams.get("exampage_id");
  const subjectId = url.searchParams.get("subject_id");
  const groupId = url.searchParams.get("group_id");
  const questionTypeId = url.searchParams.get("question_type_id");

  let backendUrl = "";
  if (examType === "magistratura") {
    backendUrl = `http://backend:80/api/adminapi/magistratura-exampages/${exampageId}/subjects/${subjectId}/questions`;
  } else if (examType === "buraxilis") {
    backendUrl = `http://backend:80/api/adminapi/buraxilis-exampages/${exampageId}/subjects/${subjectId}/questions`;
  } else if (examType === "applicant") {
    backendUrl = `http://backend:80/api/adminapi/applicant-exampages/${exampageId}/groups/${groupId}/subjects/${subjectId}/questions`;
  } else if (examType === "miq") {
    const sId = subjectId ? `/${subjectId}` : "";
    backendUrl = `http://backend:80/api/adminapi/miq-exampages/${exampageId}/question-types/${questionTypeId}/questions${sId}`;
  }

  if (!backendUrl) {
    return new Response(JSON.stringify({ success: false, message: "Yanlış sorğu parametrləri." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(backendUrl, {
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
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, message: "Serverlə əlaqə xətası." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
