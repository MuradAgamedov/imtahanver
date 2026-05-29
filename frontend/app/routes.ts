import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("exams", "routes/home.tsx", { id: "home-exams" }),
  route("settings", "routes/home.tsx", { id: "home-settings" }),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("api/exam-questions", "routes/api.exam-questions.ts"),
  route("miq-exampages/:exampageId/subjects", "routes/exam-subjects.tsx"),
  route("exam/:exampageId/:subjectId", "routes/exam.tsx"),
] satisfies RouteConfig;
