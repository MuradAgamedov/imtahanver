import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("api/exam-questions", "routes/api.exam-questions.ts"),
  route("exam/:exampageId/:subjectId", "routes/exam.tsx"),
] satisfies RouteConfig;
