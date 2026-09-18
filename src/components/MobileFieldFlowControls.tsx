"use client";

type MobileFieldFlowControlsProps = {
  current: number;
  total: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  canComplete?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onComplete?: () => void;
  nextLabel?: string;
  completeLabel?: string;
  dockToViewport?: boolean;
};

export function MobileFieldFlowControls({
  current,
  total,
  canGoPrev,
  canGoNext,
  canComplete = true,
  onPrev,
  onNext,
  onComplete,
  nextLabel = "Volgende",
  completeLabel = "Bekijk uitkomst",
  dockToViewport = false,
}: MobileFieldFlowControlsProps) {
  if (total < 1) return null;

  const isLastField = current >= total;
  const primaryAction = isLastField && onComplete ? onComplete : onNext;
  const primaryLabel = isLastField && onComplete ? completeLabel : nextLabel;
  const primaryDisabled = isLastField && onComplete ? !canComplete : !canGoNext;

  const controls = (
    <div
      className={`${dockToViewport ? "fixed inset-x-3 z-30" : "mt-6"} mobile-flow-controls rounded-[1.25rem] border border-[var(--hair)] bg-[rgba(255,253,248,0.96)] p-3 shadow-paper backdrop-blur-md md:hidden`}
      style={{
        ...(dockToViewport
          ? { bottom: "max(0.5rem, env(safe-area-inset-bottom))" }
          : undefined),
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-[12px] text-[var(--muted)]">
        <span aria-live="polite">Vraag {current} van {total}</span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[var(--paper-soft)]" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-transform duration-200 motion-reduce:transition-none"
          style={{
            transform: `scaleX(${Math.min(1, Math.max(0, current / total))})`,
            transformOrigin: "left",
          }}
        />
      </div>
      <div className={canGoPrev ? "grid grid-cols-[auto_minmax(0,1fr)] gap-2" : "grid"}>
        {canGoPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="ring-focus hair inline-flex min-h-[3.25rem] items-center justify-center rounded-full border bg-white px-5 text-[14px] font-medium text-[var(--ink)] transition-colors duration-200 motion-reduce:transition-none"
          >
            Vorige
          </button>
        ) : null}
        <button
          type="button"
          onClick={primaryAction}
          disabled={primaryDisabled}
          className="ring-focus inline-flex min-h-[3.25rem] min-w-0 items-center justify-center rounded-full bg-[var(--deep)] px-5 text-center text-[14px] font-semibold text-[color:var(--button-text-on-dark)] shadow-[0_14px_32px_-24px_rgba(22,22,22,0.8)] transition-[filter,transform] duration-200 hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
          style={{ color: "var(--button-text-on-dark)" }}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );

  if (!dockToViewport) return controls;

  return <div className="h-[8.75rem] md:hidden">{controls}</div>;
}
