import type { ReactNode } from "react";

export type HorizontalBarDatum = {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  color?: string;
  note?: string;
};

export type ResultTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
};

export type ResultTableRow = {
  key: string;
  cells: Record<string, ReactNode>;
};

type ResultVisualizationProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ResultVisualization({
  title,
  description,
  children,
}: ResultVisualizationProps) {
  return (
    <section className="surface-subtle overflow-hidden p-4 sm:p-5" aria-label={title}>
      <div className="max-w-2xl">
        <h3 className="font-serif text-[clamp(1.1rem,1rem+0.45vw,1.35rem)] text-[var(--ink)]">
          {title}
        </h3>
        <p className="mt-1 text-[13px] leading-[1.6] text-[var(--muted)]">
          {description}
        </p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function HorizontalBarChart({
  data,
  maximum,
  caption,
}: {
  data: readonly HorizontalBarDatum[];
  maximum?: number;
  caption: string;
}) {
  const scaleMaximum = Math.max(
    maximum ?? 0,
    ...data.map((item) => (Number.isFinite(item.value) ? item.value : 0)),
    1,
  );

  return (
    <figure>
      <div className="space-y-4" aria-hidden="true">
        {data.map((item) => {
          const safeValue = Number.isFinite(item.value) ? Math.max(item.value, 0) : 0;
          const scale = Math.min(safeValue / scaleMaximum, 1);

          return (
            <div key={item.key} className="min-w-0">
              <div className="mb-1.5 flex min-w-0 items-baseline justify-between gap-3 text-[12px]">
                <span className="min-w-0 text-[var(--muted)]">{item.label}</span>
                <span className="shrink-0 font-mono font-medium tabular-nums text-[var(--ink)]">
                  {item.formattedValue}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/90 ring-1 ring-inset ring-[var(--hair)]">
                <div
                  className="h-full w-full origin-left rounded-full transition-transform duration-300 motion-reduce:transition-none"
                  style={{
                    background: item.color ?? "var(--accent)",
                    transform: `scaleX(${scale})`,
                  }}
                />
              </div>
              {item.note ? (
                <p className="mt-1 text-[11px] leading-[1.5] text-[var(--soft)]">{item.note}</p>
              ) : null}
            </div>
          );
        })}
      </div>
      <figcaption className="sr-only">
        {caption} {data.map((item) => `${item.label}: ${item.formattedValue}.`).join(" ")}
      </figcaption>
    </figure>
  );
}

export function ResultTableDisclosure({
  title = "Bekijk de bedragen in een tabel",
  caption,
  columns,
  rows,
}: {
  title?: string;
  caption: string;
  columns: readonly ResultTableColumn[];
  rows: readonly ResultTableRow[];
}) {
  return (
    <details className="group mt-5 overflow-hidden rounded-[1rem] border border-[var(--hair)] bg-white/76">
      <summary className="ring-focus flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[13px] font-medium text-[var(--ink)] marker:content-none">
        <span>{title}</span>
        <span className="text-[12px] font-normal text-[var(--soft)] group-open:hidden">Openen</span>
        <span className="hidden text-[12px] font-normal text-[var(--soft)] group-open:inline">Sluiten</span>
      </summary>
      <div className="hair-t overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-left text-[12px]">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-[color-mix(in_oklab,var(--paper-soft)_72%,white)] text-[var(--muted)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 font-medium ${column.align === "right" ? "text-right" : "text-left"}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-[var(--hair)] first:border-t-0">
                {columns.map((column, index) => {
                  const cellClassName = `px-4 py-3 align-top ${
                    column.align === "right"
                      ? "text-right font-mono tabular-nums text-[var(--ink)]"
                      : "text-[var(--muted)]"
                  }`;

                  return index === 0 ? (
                    <th key={column.key} scope="row" className={`${cellClassName} font-medium`}>
                      {row.cells[column.key]}
                    </th>
                  ) : (
                    <td key={column.key} className={cellClassName}>
                      {row.cells[column.key]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
