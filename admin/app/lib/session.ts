import { createCookie } from "react-router";

export const sessionCookie = createCookie("admin_session", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24, // 24 hours
  path: "/",
});

export type AdminSession = {
  token: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
};
