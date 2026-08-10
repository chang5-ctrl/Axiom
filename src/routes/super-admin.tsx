import { createFileRoute, Outlet } from "@tanstack/react-router";

const title = "Rocdwels Administration";
const description = "Internal Rocdwels platform operations console for authorised staff.";

export const Route = createFileRoute("/super-admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <Outlet />,
});
