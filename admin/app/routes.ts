import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/dashboard.tsx"),
    route("users", "routes/users.tsx"),
    route("exams", "routes/exams.tsx"),
    route("questions", "routes/questions.tsx"),
    route("results", "routes/results.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
