import { ChartContainer, ChartLegend } from "@/components/ChartPrimitives";
import {
  HorizontalBarChart,
  ResultTableDisclosure,
  ResultVisualization,
  type HorizontalBarDatum,
} from "@/components/ResultVisualization";
import { AreaChart, getAdaptiveEuroTicks } from "@/components/charts";
import { getSparseYearTicks } from "@/lib/chart-utils";
import type {
  StudyDebtTimelinePoint,
  StudyStopScenarioResult,
} from "@/lib/duo/studeren-stoppen";
import type { SimpleDuoToolMode } from "./focused-logic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function phaseLabel(phase: StudyDebtTimelinePoint["phase"]) {
  if (phase === "study") return "Studie";
  if (phase === "aanloop") return "Aanloopfase";
  if (phase === "gift-conversion") return "Omzetting in gift";
  return "Terugbetalen";
}

export function buildYearlyDebtRows(timeline: readonly StudyDebtTimelinePoint[]) {
  const lastPointByYear = new Map<string, StudyDebtTimelinePoint>();

  for (const point of timeline) {
    lastPointByYear.set(point.date.slice(0, 4), point);
  }

  return [...lastPointByYear.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([year, point]) => ({
      year,
      phase: phaseLabel(point.phase),
      closingDebt: point.closingDebt,
    }));
}

function DebtTimelineVisualization({
  mode,
  scenario,
}: {
  mode: Exclude<SimpleDuoToolMode, "stop-cost">;
  scenario: StudyStopScenarioResult;
}) {
  const rows = buildYearlyDebtRows(scenario.timeline);
  if (rows.length < 2) return null;

  const years = rows.map((row) => Number(row.year));
  const balances = rows.map((row) => row.closingDebt);
  const title =
    mode === "start-borrowing"
      ? "Zo groeit en daalt je studieschuld"
      : "Verloop van je totale studieschuld";
  const description =
    mode === "start-borrowing"
      ? "De schuld loopt tijdens je studie op en daalt zodra de reguliere terugbetaling begint."
      : "Je ziet de verwachte totale schuld tijdens je studie, de aanloopfase en het terugbetalen.";

  return (
    <ResultVisualization title={title} description={description}>
      <figure>
        <ChartContainer
          className="overflow-hidden"
          xValues={years}
          yearTicks={getSparseYearTicks(years, 4)}
          tickPrefix=""
          chart={
            <div className="space-y-3">
              <AreaChart
                series={[{ color: "var(--accent)", points: balances }]}
                seriesLabels={["Resterende schuld"]}
                xValues={years}
                yTicks={getAdaptiveEuroTicks(Math.max(...balances))}
                ariaLabel={`${title}. De exacte schuld per jaar staat in de tabel onder de grafiek.`}
              />
              <ChartLegend
                items={[{ label: "Resterende schuld", color: "var(--accent)" }]}
              />
            </div>
          }
        />
        <figcaption className="sr-only">
          {title}. De exacte schuld per jaar staat in de uitklapbare tabel onder de grafiek.
        </figcaption>
      </figure>
      <ResultTableDisclosure
        title="Bekijk de schuld per jaar"
        caption={`${title}: exacte schuld per kalenderjaar en fase.`}
        columns={[
          { key: "year", label: "Jaar" },
          { key: "phase", label: "Fase" },
          { key: "debt", label: "Schuld einde jaar", align: "right" },
        ]}
        rows={rows.map((row) => ({
          key: row.year,
          cells: {
            year: row.year,
            phase: row.phase,
            debt: formatCurrency(row.closingDebt),
          },
        }))}
      />
    </ResultVisualization>
  );
}

function StopCostComposition({ scenario }: { scenario: StudyStopScenarioResult }) {
  const snapshot = scenario.debtAtStop;
  const data: HorizontalBarDatum[] = [
    {
      key: "loan",
      label: "Rentedragende lening",
      value: snapshot.loan,
      formattedValue: formatCurrency(snapshot.loan),
      note: "Altijd terug te betalen.",
    },
    {
      key: "tuition",
      label: "Collegegeldkrediet",
      value: snapshot.collegegeldkrediet,
      formattedValue: formatCurrency(snapshot.collegegeldkrediet),
      note: "Altijd terug te betalen.",
    },
    {
      key: "basic-grant",
      label: "Basisbeurs",
      value: snapshot.basisbeurs,
      formattedValue: formatCurrency(snapshot.basisbeurs),
      note: "Blijft in dit scenario schuld zonder tijdig diploma.",
    },
    {
      key: "additional-grant",
      label: "Aanvullende beurs",
      value: snapshot.aanvullendeBeurs,
      formattedValue: formatCurrency(snapshot.aanvullendeBeurs),
      note: "Blijft in dit scenario schuld zonder tijdig diploma.",
    },
    {
      key: "travel-product",
      label: "Studentenreisproduct",
      value: snapshot.reisproduct,
      formattedValue: formatCurrency(snapshot.reisproduct),
      note: "Blijft in dit scenario schuld zonder tijdig diploma.",
    },
  ];

  if (snapshot.total <= 0) return null;

  return (
    <ResultVisualization
      title="Waaruit bestaat dit bedrag?"
      description="De balken laten zien welke onderdelen het zwaarst meetellen in je totale schuld bij stoppen."
    >
      <HorizontalBarChart
        data={data}
        caption="Verdeling van de totale schuld over lening, collegegeldkrediet, beurzen en studentenreisproduct."
      />
      <ResultTableDisclosure
        title="Bekijk alle schuldonderdelen"
        caption="Exacte schuldopbouw bij stoppen zonder tijdig diploma."
        columns={[
          { key: "part", label: "Onderdeel" },
          { key: "meaning", label: "Betekenis" },
          { key: "amount", label: "Bedrag", align: "right" },
        ]}
        rows={data.map((item) => ({
          key: item.key,
          cells: {
            part: item.label,
            meaning: item.note,
            amount: item.formattedValue,
          },
        }))}
      />
    </ResultVisualization>
  );
}

export function FocusedDuoVisualization({
  mode,
  scenario,
}: {
  mode: SimpleDuoToolMode;
  scenario: StudyStopScenarioResult;
}) {
  if (mode === "stop-cost") {
    return <StopCostComposition scenario={scenario} />;
  }

  return <DebtTimelineVisualization mode={mode} scenario={scenario} />;
}
