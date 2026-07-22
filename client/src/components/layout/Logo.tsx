export function Logo() {
  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none shrink-0 max-w-[150px] sm:max-w-none">
      <img
        src="/logo.png"
        alt="Vastu Rent Logo"
        className="h-8 w-8 sm:h-10 sm:w-10 object-contain shrink-0"
      />
      <div className="leading-tight flex flex-col justify-center min-w-0">
        <div className="font-extrabold text-base sm:text-lg tracking-tight text-foreground leading-none font-display truncate">
          vastu
        </div>
        <div className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-muted-dark leading-none mt-0.5 sm:mt-1 truncate hidden min-[360px]:block">
          RENT · LIVE IN HARMONY
        </div>
      </div>
    </div>
  )
}
