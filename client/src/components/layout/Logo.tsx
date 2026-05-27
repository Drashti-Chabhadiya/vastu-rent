export function Logo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <img
        src="/logo.png"
        alt="Vastu Rent Logo"
        className="h-10 w-10 object-contain shrink-0"
      />
      <div className="leading-tight flex flex-col justify-center">
        <div className="font-extrabold text-lg tracking-tight text-foreground leading-none">
          vastu
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-muted-dark leading-none mt-1">
          RENT · LIVE IN HARMONY
        </div>
      </div>
    </div>
  )
}
