import { createCookie } from "react-router";

export const sessionCookie = createCookie("session", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24, // 24 hours
  path: "/",
});

export type UserSession = {
  token: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
};
