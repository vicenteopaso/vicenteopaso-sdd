"use client";

import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

export function ContrastIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path fill="currentColor" d="M12 3a9 9 0 0 0 0 18Z" />
    </svg>
  );
}
