import { cn } from "@/lib/utils";

type FormActionVariant = "primary" | "success" | "danger";

interface FormActionsProps {
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  variant?: FormActionVariant;
}

const variantClass: Record<FormActionVariant, string> = {
  primary: "bg-brand-600 hover:bg-brand-700",
  success: "bg-emerald-600 hover:bg-emerald-700",
  danger: "bg-rose-600 hover:bg-rose-700",
};

export function FormActions({
  onCancel,
  submitLabel,
  cancelLabel = "Cancel",
  variant = "primary",
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        className={cn(
          "px-4 py-2 text-sm font-medium text-white rounded-lg",
          variantClass[variant],
        )}
      >
        {submitLabel}
      </button>
    </div>
  );
}
