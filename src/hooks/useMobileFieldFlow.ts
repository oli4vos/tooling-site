"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useMemo, useState } from "react";

type AdvanceOptions = {
  blocked?: boolean;
  onInvalid?: (fieldId: string) => void;
  onComplete?: () => void;
};

type MobileFieldProps = {
  className: string;
  "data-mobile-flow-field": string;
};

type UseMobileFieldFlowResult = {
  activeFieldId: string;
  activeIndex: number;
  total: number;
  isActiveField: (fieldId: string) => boolean;
  getFieldClassName: (fieldId: string) => string;
  getFieldProps: (fieldId: string) => MobileFieldProps;
  goNext: () => void;
  goPrev: () => void;
  goToFirst: () => void;
  goToField: (fieldId: string) => void;
  resetToFirst: () => void;
  attemptAdvance: (options?: AdvanceOptions) => void;
  wasAttempted: (fieldId: string) => boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  handleEnterAdvance: (
    fieldId: string,
    blockedOrOptions?: boolean | AdvanceOptions,
  ) => (event: KeyboardEvent) => void;
};

const focusableSelector = [
  "input:not([type='hidden']):not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
].join(",");

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function useMobileFieldFlow(fieldIds: string[]): UseMobileFieldFlowResult {
  const sanitizedFieldIds = useMemo(
    () => [...new Set(fieldIds.filter((fieldId) => fieldId.trim().length > 0))],
    [fieldIds],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [attemptedFieldIds, setAttemptedFieldIds] = useState<Set<string>>(
    () => new Set(),
  );

  const total = sanitizedFieldIds.length;
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, total - 1));
  const activeFieldId = sanitizedFieldIds[safeActiveIndex] ?? "";

  const focusField = useCallback((fieldId: string) => {
    if (!fieldId || typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      const directField = document.getElementById(fieldId);
      const fieldContainer = document.querySelector<HTMLElement>(
        `[data-mobile-flow-field="${CSS.escape(fieldId)}"]`,
      ) ?? document.querySelector<HTMLElement>(".mobile-flow-step:not(.hidden)");
      const focusTarget =
        directField instanceof HTMLElement
          ? directField
          : fieldContainer?.querySelector<HTMLElement>(focusableSelector) ?? fieldContainer;

      focusTarget?.focus({ preventScroll: true });
      fieldContainer?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
    });
  }, []);

  function isActiveField(fieldId: string) {
    return activeFieldId === fieldId;
  }

  function getFieldClassName(fieldId: string) {
    return isActiveField(fieldId)
      ? "mobile-flow-step grid min-w-0 gap-2 md:grid"
      : "mobile-flow-step hidden min-w-0 md:grid md:gap-2";
  }

  function getFieldProps(fieldId: string): MobileFieldProps {
    return {
      className: getFieldClassName(fieldId),
      "data-mobile-flow-field": fieldId,
    };
  }

  function moveTo(nextIndex: number, shouldFocus = true) {
    const safeNextIndex = Math.min(
      Math.max(nextIndex, 0),
      Math.max(0, sanitizedFieldIds.length - 1),
    );
    setActiveIndex(safeNextIndex);
    if (shouldFocus) {
      focusField(sanitizedFieldIds[safeNextIndex] ?? "");
    }
  }

  function goNext() {
    moveTo(safeActiveIndex + 1);
  }

  function goPrev() {
    moveTo(safeActiveIndex - 1);
  }

  function goToFirst() {
    moveTo(0);
  }

  function resetToFirst() {
    setAttemptedFieldIds(new Set());
    moveTo(0);
  }

  function wasAttempted(fieldId: string) {
    return attemptedFieldIds.has(fieldId);
  }

  function attemptAdvance(options: AdvanceOptions = {}) {
    if (!activeFieldId) return;

    setAttemptedFieldIds((current) => {
      const next = new Set(current);
      next.add(activeFieldId);
      return next;
    });

    if (options.blocked) {
      options.onInvalid?.(activeFieldId);
      focusField(activeFieldId);
      return;
    }

    if (safeActiveIndex >= total - 1) {
      options.onComplete?.();
      return;
    }

    goNext();
  }

  function handleEnterAdvance(
    fieldId: string,
    blockedOrOptions: boolean | AdvanceOptions = false,
  ) {
    return (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
      if (!isActiveField(fieldId)) return;
      if (event.currentTarget instanceof HTMLTextAreaElement) return;

      event.preventDefault();
      const options =
        typeof blockedOrOptions === "boolean"
          ? { blocked: blockedOrOptions }
          : blockedOrOptions;
      attemptAdvance(options);
    };
  }

  return {
    activeFieldId,
    activeIndex: safeActiveIndex,
    total,
    isActiveField,
    getFieldClassName,
    getFieldProps,
    goNext,
    goPrev,
    goToFirst,
    goToField: (fieldId: string) => {
      const index = sanitizedFieldIds.indexOf(fieldId);
      if (index >= 0) moveTo(index);
    },
    resetToFirst,
    attemptAdvance,
    wasAttempted,
    canGoNext: safeActiveIndex < total - 1,
    canGoPrev: safeActiveIndex > 0,
    handleEnterAdvance,
  };
}
