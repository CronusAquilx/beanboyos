import { createFileRoute } from "@tanstack/react-router";
import { consoleCatalogOptions } from "@/lib/console/catalog";
import { ConsoleScreen } from "@/components/console/ConsoleScreen";

export const Route = createFileRoute("/_authenticated/console/store")({
  loader: ({ context }) => context.queryClient.ensureQueryData(consoleCatalogOptions),
  head: () => ({ meta: [{ title: "Console Store — BirchBlock" }, { name: "description", content: "Browse the BirchBlock cloud games, arcade games and apps." }, { property: "og:title", content: "Console Store — BirchBlock" }, { property: "og:description", content: "Browse the BirchBlock cloud games, arcade games and apps." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <ConsoleScreen screen="store" />,
});