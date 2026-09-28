import type { AppManifest } from "@/lib/app-types";
import { ToolCard } from "@/components/ToolCard";
import { Pill } from "@/components/ui";

type AppCardProps = {
  app: AppManifest;
};

export function AppCard({ app }: AppCardProps) {
  const outputLabel = app.outputType === "scenarioComparison"
    ? "scenariovergelijking"
    : app.outputType === "timeline"
      ? "tijdlijn"
      : app.outputType === "checklist"
        ? "checklist"
        : "indicatie";
  const inputCount = Math.max(2, Math.min(6, app.requiredProfileFields?.length ?? 3));
  return (
    <div className="relative">
      <ToolCard title={app.title} blurb={app.description} href={`/apps/${app.slug}`} />
      <div className="pointer-events-none absolute bottom-[4.35rem] left-5 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[var(--paper-soft)] px-2 py-1 text-[11px] text-[var(--muted)]">± {inputCount} kerngegevens</span>
        <span className="rounded-full bg-[var(--paper-soft)] px-2 py-1 text-[11px] text-[var(--muted)]">{outputLabel}</span>
      </div>
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
