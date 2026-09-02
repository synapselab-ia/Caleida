import Image from "next/image";

type CaleidaLogoProps = {
  className?: string;
};

export function CaleidaLogo({ className }: CaleidaLogoProps) {
  const classes = ["relative h-20 w-full max-w-80", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <Image
        src="/brand/caleida-logo-horizontal.png"
        alt="Caleida"
        fill
        sizes="(max-width: 640px) 72vw, 20rem"
        className="object-contain"
      />
    </span>
  );
}
