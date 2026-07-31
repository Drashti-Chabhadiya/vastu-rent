import { Check, Package, Leaf, Bell } from 'lucide-react'

interface ProfileWhyRentBannerProps {
  firstName: string
}

export function ProfileWhyRentBanner({ firstName }: ProfileWhyRentBannerProps) {
  return (
    <div className="mx-5 md:mx-0 bg-primary-soft/40 border border-primary-border/60 rounded-[28px] p-5 md:p-8 mt-10 mb-6">
      <h3 className="text-base md:text-lg font-black text-foreground mb-4 font-display flex items-center gap-2">
        Why rent from {firstName}?
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground">
              Quality Checked
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Every item is checked before renting
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground">
              On-time Delivery
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Usually delivers within hours
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Leaf size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground">
              Well Maintained
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Items are well maintained and sanitized
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Bell size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground">
              Quick Support
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Replies within the hour for any queries
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
