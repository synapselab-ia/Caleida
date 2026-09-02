import Image from "next/image";
import caleidaLogoHorizontal from "../../../public/brand/caleida-logo-horizontal.png";

type CaleidaLogoProps = {
  className?: string;
};

export function CaleidaLogo({ className }: CaleidaLogoProps) {
  const classes = ["h-auto w-full max-w-80", className].filter(Boolean).join(" ");

  return (
    <Image
      src={caleidaLogoHorizontal}
      alt="Caleida"
      sizes="(max-width: 640px) 72vw, 20rem"
      className={classes}
    />
  );
}
