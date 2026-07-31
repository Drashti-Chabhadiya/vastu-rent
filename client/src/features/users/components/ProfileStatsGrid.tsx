import { ShoppingBag, User as UserIcon, MessageSquare } from 'lucide-react'

interface ProfileStatsGridProps {
  listingsCount?: number
  createdAt?: string
}

export function ProfileStatsGrid({
  listingsCount = 12,
  createdAt = '2026-07-01',
}: ProfileStatsGridProps) {
  const formattedDate = new Date(createdAt)
    .toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    })
    .replace(' ', " '")

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {/* Listings Widget */}
      <div className="border border-border/60 rounded-[16px] md:rounded-[20px] p-2.5 sm:p-3 md:p-4 bg-card shadow-xs flex flex-row items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] md:rounded-xl bg-pink-100 text-pink-500 dark:bg-pink-950/40 dark:text-pink-400 flex items-center justify-center shrink-0">
          <ShoppingBag
            size={16}
            className="sm:w-[18px] sm:h-[18px]"
            strokeWidth={2.5}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm md:text-base font-black text-foreground leading-tight">
            {listingsCount}
          </span>
          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-semibold truncate mt-0.5">
            Listings
          </span>
        </div>
      </div>

      {/* Member since Widget */}
      <div className="border border-border/60 rounded-[16px] md:rounded-[20px] p-2.5 sm:p-3 md:p-4 bg-card shadow-xs flex flex-row items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] md:rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400 flex items-center justify-center shrink-0">
          <UserIcon
            size={16}
            className="sm:w-[18px] sm:h-[18px]"
            strokeWidth={2.5}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm md:text-base font-black text-foreground leading-tight">
            {formattedDate}
          </span>
          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-semibold truncate mt-0.5">
            Member since
          </span>
        </div>
      </div>

      {/* Response time Widget */}
      <div className="border border-border/60 rounded-[16px] md:rounded-[20px] p-2.5 sm:p-3 md:p-4 bg-card shadow-xs flex flex-row items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] md:rounded-xl bg-blue-100 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center shrink-0">
          <MessageSquare
            size={16}
            className="sm:w-[18px] sm:h-[18px]"
            strokeWidth={2.5}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm md:text-base font-black text-foreground leading-tight">
            &lt;1hr
          </span>
          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-semibold truncate mt-0.5">
            Response time
          </span>
        </div>
      </div>
    </div>
  )
}
