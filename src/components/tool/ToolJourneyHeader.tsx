import type { AppManifest } from "@/lib/app-types";

type ToolJourneyHeaderProps = {
  app: AppManifest;
};

function outputLabel(outputType: AppManifest["outputType"]) {
  switch (outputType) {
    case "scenarioComparison":
      return "scenariovergelijking";
    case "timeline":
      return "ontwikkeling door de tijd";
    case "checklist":
      return "controlelijst";
    case "mixed":
      return "uitkomst en verdieping";
    default:
      return "indicatie met uitleg";
  }
}

export function ToolJourneyHeader({ app }: ToolJourneyHeaderProps) {
  return (
    <section
      className="mb-5 rounded-[1.25rem] border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-4 sm:px-5"
      aria-label="Route door deze tool"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">Stap 2 van 4 · Bereken</p>
          <p className="mt-1 text-[13px] leading-5 text-[var(--ink-2)]">
            Vul eerst de kerngegevens in. Daarna zie je een {outputLabel(app.outputType)} en een logische vervolgstap.
          </p>
        </div>
        <span className="rounded-full border border-[var(--hair)] bg-white px-2.5 py-1 text-[11px] text-[var(--muted)]">{app.status === "beta" ? "Beta · controleer aannames" : "Indicatief scenario"}</span>
      </div>
      <ol className="mt-4 grid grid-cols-4 gap-1.5 text-center text-[10px] font-medium text-[var(--muted)] sm:gap-2 sm:text-[11px]">
        {[
          ["01", "Kies je vraag"],
          ["02", "Vul in", "active"],
          ["03", "Lees uitkomst"],
          ["04", "Ga verder"],
        ].map(([number, label, state]) => (
          <li key={number} className={`rounded-lg px-1.5 py-2 ${state === "active" ? "bg-[var(--accent)] text-[color:var(--button-text-on-dark)]" : "bg-white/70"}`}>
            <span className="block font-mono text-[10px] opacity-75">{number}</span>
            <span className="mt-0.5 block truncate">{label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
