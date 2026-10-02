import type { SVGProps } from "react";

export default function WaterDrop({ width = 30, height = 42, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg width={width} height={height} viewBox="0 0 32 44" fill="none" aria-hidden="true" {...props}>
      <path d="M16 2C16 2 3 20 3 29C3 36.2 8.8 42 16 42C23.2 42 29 36.2 29 29C29 20 16 2 16 2Z" fill="#409e9e" />
      <path d="M10 27C8.5 30.5 9.5 34 12 35.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
