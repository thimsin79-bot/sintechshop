interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
    >
      <i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
