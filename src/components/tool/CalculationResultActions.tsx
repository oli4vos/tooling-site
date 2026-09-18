"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ToolActionButton } from "@/components/tool/ToolActionButton";

type CalculationResultActionsProps = {
  onEdit: () => void;
  onRestart: () => void;
  restartDescription?: string;
};

export function CalculationResultActions({
  onEdit,
  onRestart,
  restartDescription = "Je invoer en deze uitkomst worden alleen voor deze tool gewist.",
}: CalculationResultActionsProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isConfirming && !dialog.open) {
      dialog.showModal();
    } else if (!isConfirming && dialog.open) {
      dialog.close();
    }
  }, [isConfirming]);

  return (
    <>
      <div className="grid gap-2 sm:flex sm:flex-wrap" aria-label="Acties voor je berekening">
        <ToolActionButton type="button" variant="accent" size="md" onClick={onEdit}>
          Invoer wijzigen
        </ToolActionButton>
        <ToolActionButton
          type="button"
          variant="secondary"
          size="md"
          onClick={() => setIsConfirming(true)}
        >
          Opnieuw beginnen
        </ToolActionButton>
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={(event) => {
          event.preventDefault();
          setIsConfirming(false);
        }}
        onClose={() => setIsConfirming(false)}
        className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-[1.5rem] border border-[var(--hair)] bg-[var(--paper)] p-0 text-[var(--ink)] shadow-paper-lg backdrop:bg-[oklch(20%_0.02_250/0.48)]"
      >
        <div className="p-5 sm:p-6">
          <h2 id={titleId} className="font-serif text-2xl tracking-[-0.02em]">
            Opnieuw beginnen?
          </h2>
          <p id={descriptionId} className="mt-3 text-[14px] leading-[1.65] text-[var(--muted)]">
            {restartDescription}
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <ToolActionButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsConfirming(false)}
            >
              Annuleren
            </ToolActionButton>
            <ToolActionButton
              type="button"
              variant="accent"
              size="md"
              onClick={() => {
                setIsConfirming(false);
                onRestart();
              }}
            >
              Wis en begin opnieuw
            </ToolActionButton>
          </div>
        </div>
      </dialog>
    </>
  );
}
