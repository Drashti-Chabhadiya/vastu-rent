export function Logo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#2d5222] text-white shadow-sm shrink-0">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="leading-tight flex flex-col justify-center">
        <div className="font-extrabold text-lg tracking-tight text-gray-900 leading-none">
          vastu
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400 leading-none mt-1">
          RENT · LIVE IN HARMONY
        </div>
      </div>
    </div>
  )
}
