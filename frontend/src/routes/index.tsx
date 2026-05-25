import { createFileRoute, redirect } from "@tanstack/react-router";

const DEV_AUTH_ENABLED = import.meta.env.VITE_DEV_AUTH === "true";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (DEV_AUTH_ENABLED) {
      throw redirect({ to: "/groups" });
    }

    if (typeof window === "undefined") throw redirect({ to: "/login" });

    const token = localStorage.getItem("meetup_access_token");
    if (!token) {
      throw redirect({ to: "/login" });
    }
    throw redirect({ to: "/groups" });
  },
  component: () => null,
  head: () => ({
    meta: [
      { title: "MeetFlow — Collaborative Meeting Intelligence" },
      { name: "description", content: "AI-powered meeting and task intelligence platform" },
    ],
  }),
});
