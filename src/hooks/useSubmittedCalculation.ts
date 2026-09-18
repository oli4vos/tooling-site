"use client";

import { useCallback, useMemo, useState } from "react";

function focusResultSummary() {
  if (typeof window === "undefined") return;

  window.requestAnimationFrame(() => {
    const result = document.getElementById("tool-result-summary");
    if (!(result instanceof HTMLElement)) return;

    if (!result.hasAttribute("tabindex")) result.tabIndex = -1;
    result.focus({ preventScroll: true });
    result.scrollIntoView({
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  });
}

export function useSubmittedCalculation<T>(initialValues: T) {
  const [formValues, setFormValues] = useState<T>(initialValues);
  const [submittedValues, setSubmittedValues] = useState<T | null>(null);
  const [submitContextMessage, setSubmitContextMessage] = useState<string | null>(null);

  const hasDirtyChanges = useMemo(() => {
    if (!submittedValues) {
      return false;
    }
    return JSON.stringify(formValues) !== JSON.stringify(submittedValues);
  }, [formValues, submittedValues]);

  const submit = useCallback(() => {
    setSubmittedValues(formValues);
    setSubmitContextMessage(null);
    focusResultSummary();
  }, [formValues]);

  const submitValues = useCallback((nextValues: T, message?: string) => {
    setFormValues(nextValues);
    setSubmittedValues(nextValues);
    setSubmitContextMessage(message ?? null);
    focusResultSummary();
  }, []);

  const setValues = useCallback((nextValues: T, message?: string) => {
    setFormValues(nextValues);
    if (message) {
      setSubmitContextMessage(message);
    }
  }, []);

  const replaceValues = useCallback((nextValues: T, message?: string) => {
    setFormValues(nextValues);
    setSubmittedValues(null);
    setSubmitContextMessage(message ?? null);
  }, []);

  const reset = useCallback((message?: string) => {
    setFormValues(initialValues);
    setSubmittedValues(null);
    setSubmitContextMessage(message ?? null);
  }, [initialValues]);

  return {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    submitValues,
    hasDirtyChanges,
    submitContextMessage,
    setSubmitContextMessage,
    setValues,
    replaceValues,
    reset,
  };
}
