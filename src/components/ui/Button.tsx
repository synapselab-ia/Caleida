import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-accent text-background hover:brightness-95",
  secondary: "border-border bg-surface text-text-primary hover:bg-surface-raised",
};

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...props} />;
}
