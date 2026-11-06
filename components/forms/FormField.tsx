"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { invalidInputClass, labelClass } from "@/lib/styles";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}

interface FieldControlProps {
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function FormField({
  label,
  children,
  error,
  hint,
  required = false,
  className,
  htmlFor,
}: FormFieldProps) {
  const generatedId = useId();
  const child = Children.only(children);

  if (!isValidElement<FieldControlProps>(child)) {
    throw new Error("FormField expects a single form control as its child");
  }

  const controlId = child.props.id ?? htmlFor ?? generatedId;
  const messageId = `${controlId}-message`;

  const control = cloneElement(child as ReactElement<FieldControlProps>, {
    id: controlId,
    className: cn(child.props.className, error && invalidInputClass),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? messageId : undefined,
  });

  return (
    <div className={className}>
      <label htmlFor={controlId} className={labelClass}>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      {control}
      {error ? (
        <p id={messageId} role="alert" className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
