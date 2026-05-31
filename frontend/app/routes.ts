import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("settings", "routes/home.tsx", { id: "home-settings" }),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("exams", "routes/exams.tsx"),
  route("miq-exampages", "routes/miq-exampages.tsx"),
  route("miq-exampages/:exampageId/subjects", "routes/exam-subjects.tsx"),
  route("exam/:exampageId/:subjectId", "routes/exam.tsx"),
  route("api/exam-questions", "routes/api.exam-questions.ts"),
] satisfies RouteConfig;
