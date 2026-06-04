import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Avoid localStorage access during SSR
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("meetup_access_token");

    if (!token) {
      throw redirect({
        to: "/landing",
      });
    }

    throw redirect({
      to: "/dashboard",
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
