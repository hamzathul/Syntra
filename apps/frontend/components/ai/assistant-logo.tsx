import { cn } from "@/lib/utils";

export function AssistantLogo({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="Syntra assistant logo"
      className={cn("h-6 w-6", className)}
    >
      <defs>
        <linearGradient id="syntra-logo-bg" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#syntra-logo-bg)" />
      <text
        x="16"
        y="22.5"
        textAnchor="middle"
        fontSize="18"
        fontWeight="800"
        fontFamily="inherit"
        fill="#ffffff"
      >
        S
      </text>
      <circle cx="23.5" cy="8.5" r="2.2" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}
