import type { AppManifest } from "@/lib/app-types";
import { ToolCard } from "@/components/ToolCard";
import { Pill } from "@/components/ui";

type AppCardProps = {
  app: AppManifest;
};

export function AppCard({ app }: AppCardProps) {
  return (
    <div className="relative">
      <ToolCard title={app.title} blurb={app.description} href={`/apps/${app.slug}`} />
      {app.status !== "active" ? (
        <div className="pointer-events-none absolute right-4 top-4">
          <Pill tone={app.status === "beta" ? "warn" : "default"}>
            {app.status === "beta" ? "Beta" : app.status}
          </Pill>
        </div>
      ) : null}
    </div>
  );
}
