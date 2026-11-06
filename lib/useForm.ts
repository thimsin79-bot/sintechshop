"use client";

import { useCallback, useState, type FormEvent } from "react";
import { hasErrors, type FieldErrors } from "./validation";

export function useForm<T extends object>(
  initialValues: T,
  validate: (values: T) => FieldErrors<T>,
) {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValuesState((current) => ({ ...current, [key]: value }) as T);
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setFormError(null);
  }, []);

  const reset = useCallback((next: T) => {
    setValuesState(next);
    setErrors({});
    setFormError(null);
  }, []);

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>, onValid: (values: T) => void) => {
      event.preventDefault();
      const nextErrors = validate(values);

      if (hasErrors(nextErrors)) {
        setErrors(nextErrors);
        setFormError("Please review the highlighted fields.");
        return;
      }

      setErrors({});
      setFormError(null);
      onValid(values);
    },
    [validate, values],
  );

  return {
    values,
    errors,
    formError,
    setValue,
    setFormError,
    reset,
    submit,
  };
}
