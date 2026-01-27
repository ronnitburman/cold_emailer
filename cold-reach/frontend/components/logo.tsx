export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-8 w-8 items-center justify-center">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
        >
          <rect
            x="2"
            y="8"
            width="28"
            height="18"
            rx="2"
            className="stroke-accent"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M4 10L16 18L28 10"
            className="stroke-accent"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="8" r="5" className="fill-accent" />
          <path
            d="M22 8L23.5 9.5L26.5 6.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-background"
          />
        </svg>
      </div>
      <span className="text-xl font-semibold tracking-tight text-foreground">
        ColdReach
      </span>
    </div>
  )
}
