"use client";

import { useMemo, useState } from "react";
import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";
import { ENABLE_PROFILE } from "@/lib/feature-flags";
import { toolGroups } from "@/lib/tool-groups";
import { AppCard } from "./AppCard";
import { GlossaryText } from "./GlossaryText";
import { KnowledgeLevelSelector } from "./KnowledgeLevelSelector";
import { PersonalRoute } from "./PersonalRoute";

type AppDashboardProps = {
  apps: AppManifest[];
};

function isArtifactImportedApp(app: AppManifest) {
  return app.tags.includes("artifact-import");
}

export function AppDashboard({ apps }: AppDashboardProps) {
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Alle");
  const artifactApps = useMemo(
    () => apps.filter(isArtifactImportedApp),
    [apps],
  );
  const artifactGroups = useMemo(() => {
    const groups = new Map<string, AppManifest[]>();

    for (const app of artifactApps) {
      const categoryLabel = app.category.startsWith("Artifacts · ")
        ? app.category.replace("Artifacts · ", "")
        : app.category;
      const existing = groups.get(categoryLabel) ?? [];
      existing.push(app);
      groups.set(categoryLabel, existing);
    }

    return [...groups.entries()]
      .map(([category, groupedApps]) => ({
        category,
        apps: [...groupedApps].sort((left, right) =>
          left.title.localeCompare(right.title),
        ),
      }))
      .sort((left, right) => left.category.localeCompare(right.category));
  }, [artifactApps]);
  const primaryApps = useMemo(
    () => apps.filter((app) => !isArtifactImportedApp(app)),
    [apps],
  );
  const appsBySlug = useMemo(
    () =>
      Object.fromEntries(primaryApps.map((app) => [app.slug, app])) as Record<
        string,
        AppManifest
      >,
    [primaryApps],
  );

  const groupedApps = useMemo(
    () =>
      toolGroups
        .map((group) => ({
          ...group,
          apps: group.slugs
            .map((slug) => appsBySlug[slug])
            .filter((app): app is AppManifest => {
              if (!app) return false;
              const haystack = `${app.title} ${app.description} ${app.tags.join(" ")}`.toLowerCase();
              return haystack.includes(query.trim().toLowerCase());
            }),
        }))
        .filter((group) => selectedGroup === "Alle" || group.title === selectedGroup)
        .filter((group) => group.apps.length > 0),
    [appsBySlug, query, selectedGroup],
  );

  return (
    <div className="space-y-8">
      <KnowledgeLevelSelector />

      <section className="surface-subtle grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" aria-label="Tools zoeken en filteren">
        <label className="grid gap-2">
          <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]">Zoek op vraag of onderwerp</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Bijv. box 3, hypotheek of DUO"
            className="ring-focus hair h-11 rounded-lg border bg-white px-3 text-[14px] text-[var(--ink)] outline-none"
          />
        </label>
        <label className="grid gap-2 sm:min-w-48">
          <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]">Onderwerp</span>
          <select value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)} className="ring-focus hair h-11 rounded-lg border bg-white px-3 text-[14px] text-[var(--ink)] outline-none">
            <option>Alle</option>
            {toolGroups.map((group) => <option key={group.title}>{group.title}</option>)}
          </select>
        </label>
        {query || selectedGroup !== "Alle" ? (
          <p className="text-[12px] text-[var(--muted)] sm:col-span-2">{groupedApps.reduce((total, group) => total + group.apps.length, 0)} tools gevonden.</p>
        ) : null}
      </section>

      <section id="apps" className="space-y-6">
        {groupedApps.map((group) => (
          <section
            id={toAnchorId(group.title, "groep")}
            key={group.title}
            className="border-t border-[var(--hair)] pt-6 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-[clamp(1.2rem,1.05rem+0.7vw,1.5rem)] tracking-[-0.015em] text-[var(--ink)]">
                  {group.title}
                </h2>
                <p className="mt-2 max-w-[60ch] text-[13.5px] leading-[1.65] text-[var(--muted)]">
                  <GlossaryText text={group.description} />
                </p>
              </div>
            </div>
            <div
              className="mt-5 grid gap-4 md:grid-cols-2"
            >
              {group.apps.map((app) => (
                <AppCard key={app.slug} app={app} />
              ))}
            </div>
          </section>
        ))}
      </section>

      {ENABLE_PROFILE ? (
        <section id="persoonlijk">
          <PersonalRoute apps={primaryApps} />
        </section>
      ) : null}

      {artifactApps.length > 0 ? (
        <section
          id="apps-artifacts"
          className="surface-panel p-6"
        >
          <div className="text-[13px] font-medium text-[var(--muted)]">Extra hulpmiddel</div>
          <h4 className="mt-2 font-serif text-[clamp(1.2rem,1.05rem+0.7vw,1.5rem)] tracking-[-0.015em] text-[var(--ink)]">
            Maximale hypotheek
          </h4>
          <p className="mt-2 max-w-[70ch] text-[13.5px] leading-[1.65] text-[var(--muted)]">
            Schat wat je op basis van inkomen, woningwaarde en studieschuld kunt lenen.
          </p>
          <div className="mt-5 space-y-5">
            {artifactGroups.map((group) => (
              <section
                key={group.category}
                className="surface-subtle p-4"
              >
                <div className="mt-3 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {group.apps.map((app) => (
                    <AppCard key={app.slug} app={app} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : null}

    </div>
  );
}
