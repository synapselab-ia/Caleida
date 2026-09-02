import type { HTMLAttributes, ReactNode } from "react";

type FeedbackKind = "note" | "status" | "alert";

export type FeedbackProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "role" | "aria-live"
> & {
  kind?: FeedbackKind;
  title?: string;
  children: ReactNode;
};

const roleByKind: Record<FeedbackKind, "status" | "alert" | undefined> = {
  note: undefined,
  status: "status",
  alert: "alert",
};

export function Feedback({
  kind = "note",
  title,
  children,
  className,
  ...props
}: FeedbackProps) {
  const classes = [
    "rounded-lg border bg-surface px-4 py-3 text-text-primary",
    kind === "note" ? "border-border" : "border-accent",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const role = roleByKind[kind];

  return (
    <div
      {...props}
      role={role}
      aria-atomic={role ? true : undefined}
      className={classes}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className="text-sm">{children}</div>
    </div>
  );
}
