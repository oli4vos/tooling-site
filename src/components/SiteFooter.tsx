import Link from "next/link";
import { Logo } from "@/components/ui";
import { GRIP_INDEPENDENCE_SHORT } from "@/lib/trust-copy";

export function SiteFooter() {
  const footerLinkClassName =
    "inline-flex min-h-11 items-center rounded-lg px-2 py-1 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2";

  return (
    <footer className="hair-t mt-16">
      <div className="page-shell grid gap-4 py-6 text-[12.5px] text-[var(--muted)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="max-w-[72ch]">
          <div className="flex items-center gap-4">
            <Logo size={16} />
            <span>Rekentools voor studieschuld, belasting, vermogen en ZZP.</span>
          </div>
          <p className="mt-2 leading-5">
            {GRIP_INDEPENDENCE_SHORT}{" "}
            <Link
              href="/over#onafhankelijk"
              className="font-medium text-[var(--ink-2)] underline underline-offset-4 hover:text-[var(--ink)]"
            >
              Meer over onafhankelijkheid
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <Link href="/apps" className={footerLinkClassName}>
            Alle tools
          </Link>
          <Link href="/variabelen" className={footerLinkClassName}>
            Aannames
          </Link>
          <Link href="/over" className={footerLinkClassName}>
            Over
          </Link>
          <Link href="/privacy" className={footerLinkClassName}>
            Privacy
          </Link>
          <Link href="/voorwaarden" className={footerLinkClassName}>
            Voorwaarden
          </Link>
          <a
            href="https://github.com/oli4vos/tooling-site"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLinkClassName}
          >
            Broncode
          </a>
        </div>
      </div>
    </footer>
  );
}
