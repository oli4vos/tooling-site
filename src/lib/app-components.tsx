import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export type AppCalculatorComponent = ComponentType<Record<string, never>>;

export const appComponents: Record<string, AppCalculatorComponent> = {
  "duo-aanvullende-beurs": dynamic(() => import("../../apps/duo-aanvullende-beurs/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
  "duo-extra-aflossen": dynamic(() => import("../../apps/duo-extra-aflossen/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
  "duo-leenbedrag-impact": dynamic(() => import("../../apps/duo-leenbedrag-impact/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
  "duo-maandbedrag": dynamic(() => import("../../apps/duo-maandbedrag/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
  "duo-schuld-bij-starten-lenen": dynamic(() => import("../../apps/duo-schuld-bij-starten-lenen/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
  "duo-stoppen-kosten-prestatiebeurs": dynamic(() => import("../../apps/duo-stoppen-kosten-prestatiebeurs/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
};
