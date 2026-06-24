import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
};

const sizes = {
  sm: { overhaul: { w: 88, h: 22 }, ucd: { w: 28, h: 32 }, x: "text-xs" },
  md: { overhaul: { w: 110, h: 28 }, ucd: { w: 34, h: 38 }, x: "text-sm" },
  lg: { overhaul: { w: 140, h: 36 }, ucd: { w: 44, h: 48 }, x: "text-base" },
} as const;

export function BrandLogo({ size = "md", showTagline = false, className }: BrandLogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logos/overhaul.png"
        alt="Overhaul"
        width={s.overhaul.w}
        height={s.overhaul.h}
        className="h-auto w-auto object-contain"
        priority
      />
      <span className={cn("font-light text-zinc-500 select-none", s.x)}>×</span>
      <Image
        src="/logos/ucd.png"
        alt="University College Dublin"
        width={s.ucd.w}
        height={s.ucd.h}
        className="h-auto w-auto object-contain"
        priority
      />
      {showTagline && (
        <span className="ml-1 hidden sm:block text-[10px] text-blue-400 font-medium leading-tight">
          AI Command Center
        </span>
      )}
    </div>
  );
}
