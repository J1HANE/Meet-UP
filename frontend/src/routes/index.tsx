import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // SSR: default to landing, client will re-evaluate
    if (typeof window === "undefined") {
      throw redirect({ to: "/landing" });
    }

    const token = localStorage.getItem("meetup_access_token");

    throw redirect({
      to: token ? "/dashboard" : "/landing",
    });
  },

  component: () => null,

  head: () => ({
    meta: [
      { title: "MeetUp! — Collaborative Meeting Intelligence" },
      {
        name: "description",
        content: "AI-powered meeting and task intelligence platform",
      },
    ],
  }),
});
