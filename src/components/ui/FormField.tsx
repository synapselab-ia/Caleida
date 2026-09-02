import type { InputHTMLAttributes } from "react";

export type FormFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "className" | "aria-describedby" | "aria-invalid"
> & {
  id: string;
  label: string;
  description?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
};

export function FormField({
  id,
  label,
  description,
  error,
  className,
  inputClassName,
  required,
  ...inputProps
}: FormFieldProps) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = [
    description ? descriptionId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const wrapperClasses = ["grid gap-2", className].filter(Boolean).join(" ");
  const inputClasses = [
    "min-h-11 w-full rounded-lg border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-muted",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-text-muted disabled:opacity-70",
    error ? "border-accent" : "border-border",
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      <label htmlFor={id} className="text-sm font-semibold text-text-primary">
        {label}
        {required ? (
          <span className="font-normal text-text-muted"> (obrigatório)</span>
        ) : null}
      </label>

      {description ? (
        <p id={descriptionId} className="text-sm text-text-muted">
          {description}
        </p>
      ) : null}

      <input
        {...inputProps}
        id={id}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={inputClasses}
      />

      {error ? (
        <p id={errorId} className="text-sm text-text-primary">
          <span className="font-semibold">Erro:</span> {error}
        </p>
      ) : null}
    </div>
  );
}
