import Link from "next/link";
import { GRIP_DUO_CONTEXT } from "@/lib/trust-copy";

export function ToolIndependenceNotice() {
  return (
    <aside
      aria-label="Herkomst van brongegevens en berekening"
      className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-4"
    >
      <p className="text-[13px] leading-6 text-[var(--ink-2)]">{GRIP_DUO_CONTEXT}</p>
      <dl className="mt-3 grid gap-2 text-[12px] sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-[var(--ink)]">Brongegevens</dt>
          <dd className="mt-0.5 text-[var(--muted)]">DUO en andere vermelde openbare bronnen</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--ink)]">Berekening</dt>
          <dd className="mt-0.5 text-[var(--muted)]">Grip</dd>
        </div>
      </dl>
      <Link
        href="/over#onafhankelijk"
        className="mt-3 inline-flex min-h-11 items-center text-[12px] font-medium text-[var(--ink)] underline underline-offset-4 hover:text-[var(--ink-2)]"
      >
        Lees hoe Grip bronnen gebruikt
      </Link>
    </aside>
  );
}
