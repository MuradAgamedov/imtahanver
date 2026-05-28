const STORAGE_BASE = process.env.STORAGE_URL ?? "http://localhost:8000";
const API_BASE = process.env.API_URL ?? "http://backend:80";

function withImageUrl(questions: any[]): any[] {
  return questions.map((q) => ({
    ...q,
    image_url: q.image ? `${STORAGE_BASE}/${q.image.replace(/^\/+/, "")}` : null,
  }));
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const exampageId = url.searchParams.get("exampage_id") ?? "";
  const subjectId = url.searchParams.get("subject_id") ?? "";
  const questionTypeId = url.searchParams.get("question_type_id") ?? "1";
  const tedrisTypeId = url.searchParams.get("tedris_type_id") ?? "2";

  try {
    const [fennRes, tedrisRes] = await Promise.all([
      fetch(`${API_BASE}/api/front/miq-exampages/${exampageId}/question-types/${questionTypeId}/subjects/${subjectId}/questions`),
      fetch(`${API_BASE}/api/front/miq-exampages/${exampageId}/question-types/${tedrisTypeId}/direct-questions`),
    ]);

    const [fennData, tedrisData] = await Promise.all([
      fennRes.json(),
      tedrisRes.json(),
    ]);

    return Response.json({
      fenn: withImageUrl(fennData.success ? fennData.data : []),
      tedris: withImageUrl(tedrisData.success ? tedrisData.data : []),
    });
  } catch {
    return Response.json({ fenn: [], tedris: [] });
  }
}
