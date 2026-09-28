"use client";

import { useMemo, useState } from "react";
import { BtnLink } from "@/components/ui";

type Goal = {
  id: string;
  label: string;
  description: string;
  href: string;
  result: string;
  topics: string[];
};

const goals: Goal[] = [
  {
    id: "monthly",
    label: "Mijn maandruimte begrijpen",
    description: "Wat houd ik over en wat kan ik maandelijks besteden of inleggen?",
    href: "/apps/netto-inkomen-vergelijking",
    result: "netto maandinkomen en fiscale verschillen",
    topics: ["Inkomen", "Belasting"],
  },
  {
    id: "wealth",
    label: "Vermogen opbouwen",
    description: "Wat kan sparen of beleggen worden bij mijn horizon en maandelijkse inleg?",
    href: "/vermogen/plan",
    result: "eindvermogen, groei en vervolgstappen",
    topics: ["Vermogen", "Beleggen"],
  },
  {
    id: "home",
    label: "Mijn woonkeuze vergelijken",
    description: "Wat betekenen hypotheekvorm, renteaftrek en extra aflossen voor mijn lasten?",
    href: "/apps/annuitair-lineair",
    result: "maandlasten, rente en beleggingsverschil",
    topics: ["Wonen", "Hypotheek"],
  },
  {
    id: "tax",
    label: "Belasting op vermogen begrijpen",
    description: "Hoe werkt Box 3 bij sparen, beleggen, schulden en werkelijk rendement?",
    href: "/apps/box3-indicatie",
    result: "Box 3-indicatie en methodevergelijking",
    topics: ["Box 3", "Belasting"],
  },
  {
    id: "debt",
    label: "Mijn schuld of lening begrijpen",
    description: "Wat wordt mijn maandbedrag en wat doet extra aflossen met mijn plan?",
    href: "/apps/duo-maandbedrag",
    result: "maandlast, looptijd en vervolgstappen",
    topics: ["Schulden", "DUO"],
  },
];

export function StartIntake() {
  const [selected, setSelected] = useState("wealth");
  const goal = useMemo(() => goals.find((item) => item.id === selected) ?? goals[0], [selected]);

  return (
    <section className="surface-panel scroll-mt-28 p-5 sm:p-7" aria-labelledby="start-here-title">
      <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <div className="section-label">Begin bij je beslissing</div>
          <h2 id="start-here-title" className="mt-3 font-serif text-fluid-h2 tracking-[-0.03em] text-[var(--ink)]">
            Wat wil je nu weten?
          </h2>
          <p className="mt-3 max-w-[44ch] text-[14px] leading-7 text-[var(--muted)]">
            Kies je vraag in gewone taal. Je krijgt één aanbevolen startpunt en kunt daarna altijd verdiepen.
          </p>
        </div>

        <div>
          <div className="grid gap-2 sm:grid-cols-2" role="list" aria-label="Kies je financiële vraag">
            {goals.map((item) => {
              const active = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  aria-pressed={active}
                  onClick={() => setSelected(item.id)}
                  className={`rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-paper"
                      : "border-[var(--hair)] bg-white hover:border-[var(--accent-line)]"
                  }`}
                >
                  <span className="text-[14px] font-semibold text-[var(--ink)]">{item.label}</span>
                  <span className="mt-1 block text-[12.5px] leading-5 text-[var(--muted)]">{item.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-[var(--hair)] bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">Aanbevolen start</p>
              <p className="mt-1 text-[14px] font-medium text-[var(--ink)]">Je ziet {goal.result}.</p>
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Onderwerpen">
                {goal.topics.map((topic) => <span key={topic} className="rounded-full bg-[var(--paper-soft)] px-2.5 py-1 text-[11px] text-[var(--muted)]">{topic}</span>)}
              </div>
            </div>
            <BtnLink href={goal.href} kind="primary" size="md" className="mt-4 shrink-0 sm:mt-0">Start met deze route →</BtnLink>
          </div>
        </div>
      </div>
    </section>
  );
}
