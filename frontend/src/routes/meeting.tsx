import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/meeting")({
  component: MeetingLayout,
});

function MeetingLayout() {
  return <Outlet />;
}
