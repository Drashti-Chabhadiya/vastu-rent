export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9h14v-9" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-display text-[17px] tracking-tight text-foreground">
          vastu
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Rent · Live in Harmony
        </div>
      </div>
    </div>
  )
}
