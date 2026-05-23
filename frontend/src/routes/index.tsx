import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
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
