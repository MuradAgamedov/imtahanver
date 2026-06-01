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
  route("applicant-exampages", "routes/applicant-exampages.tsx"),
  route("applicant-exampages/:exampageId/groups", "routes/applicant-exampage-groups.tsx"),
  route("applicant-exampages/:exampageId/groups/:groupId/subjects", "routes/applicant-group-subjects.tsx"),
  route("exam/applicant/:exampageId/:groupId/:subjectId", "routes/applicant-exam.tsx"),
  route("api/exam-questions", "routes/api.exam-questions.ts"),

] satisfies RouteConfig;
