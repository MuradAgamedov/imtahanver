import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  layout("routes/_layout.tsx", [
    index("routes/dashboard.tsx"),
    route("users", "routes/users.tsx"),
    route("admins", "routes/admins.tsx"),
    route("user-categories", "routes/user-categories.tsx"),
    route("miq-subjects", "routes/miq-subjects.tsx"),
    route("miq-exampages", "routes/miq-exampages.tsx"),
    route("miq-exampages/:id/question-types", "routes/miq-question-types.tsx"),
    route("exams", "routes/exams.tsx"),
    route("questions", "routes/questions.tsx"),
    route("results", "routes/results.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
