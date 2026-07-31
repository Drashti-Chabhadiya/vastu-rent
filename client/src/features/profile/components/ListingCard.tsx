import { motion } from 'motion/react'
import { cn } from '#/lib/utils'
import { fadeUp } from '#/lib/animations'
import { Button } from '#/components/ui/button'
import {
  MoreVertical,
  Pencil,
  Trash2,
  MapPin,
  Eye,
  Calendar,
  Star,
  IndianRupee,
} from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'

interface ListingCardProps {
  item: any
  openDropdownId: string | null
  setOpenDropdownId: (id: string | null) => void
  onEdit: (item: any) => void
  onDelete: (item: any) => void
}

export function ListingCard({
  item,
  openDropdownId,
  setOpenDropdownId,
  onEdit,
  onDelete,
}: ListingCardProps) {
  const { t } = useTranslation()
  const isOpen = openDropdownId === item.id

  const views = ((item.title?.charCodeAt(0) || 65) % 150) + 35
  const bookings = ((item.title?.charCodeAt(1) || 66) % 3) + 1

  return (
    <>
      {/* MOBILE LISTINGS CARDS (Screen 16 mockup style) */}
      <motion.div variants={fadeUp} className="block md:hidden">
        <div className="flex flex-col bg-white dark:bg-card border border-border/15 rounded-[22px] p-4 gap-3 shadow-3xs hover:shadow-2xs transition-all duration-300">
          <div className="flex gap-4 items-center">
            {/* Thumbnail Image */}
            <div className="w-[68px] h-[68px] rounded-xl overflow-hidden shrink-0 border border-border/10 bg-muted-light">
              <img
                src={item.images?.[0] || 'https://placehold.co/128?text=Vastu'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Listing Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-extrabold text-[12.5px] text-foreground truncate flex-1 leading-tight">
                  {item.title}
                </h4>
                <span
                  className={cn(
                    'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 select-none',
                    item.isAvailable
                      ? 'bg-muted text-primary dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-muted-light/60 text-muted-foreground',
                  )}
                >
                  {item.isAvailable ? t('Active') : t('Paused')}
                </span>
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground/80">
                ₹{item.price?.toLocaleString()}/day · {views} {t('views')}
              </p>
              <p className="text-[9.5px] font-bold text-muted-dark">
                {item.isAvailable
                  ? `${bookings} ${t('upcoming bookings')}`
                  : t('Paused by you')}
              </p>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex border-t border-border/10 pt-2.5 mt-0.5 justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
              className="rounded-full h-8 px-4.5 text-[10.5px] font-black border-border/75 text-foreground hover:bg-muted/50 cursor-pointer shadow-none"
            >
              {t('Edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item)}
              className="rounded-full h-8 px-4.5 text-[10.5px] font-black border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer shadow-none"
            >
              {t('Delete')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* DESKTOP LISTINGS CARDS (Original) */}
      <motion.div variants={fadeUp} className="hidden md:block">
        <div className="group bg-card p-6 rounded-[2.5rem] border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center relative">
          <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-muted-light shadow-inner relative">
            <img
              src={item.images?.[0] || 'https://placehold.co/128?text=Vastu'}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider',
                    item.isAvailable
                      ? 'bg-primary-soft/50 text-primary'
                      : 'bg-muted/50 text-muted-foreground/85',
                  )}
                >
                  {item.isAvailable ? t('Active') : t('Inactive')}
                </span>
                <h3 className="text-[17px] font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-muted-dark">
                <MapPin size={12} className="text-primary" />
                <span>{item.city}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-extrabold text-muted-dark mt-4">
              <div className="flex items-center gap-1.5">
                <Eye size={13} className="text-muted-dark stroke-[2.5]" />
                <span>
                  {item.views || 0} {t('Views')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-muted-dark stroke-[2.5]" />
                <span>
                  {item.bookingsCount || 0} {t('Bookings')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={13} className="text-muted-dark stroke-[2.5]" />
                <span>
                  {parseFloat(item.rating || '0.0') > 0
                    ? parseFloat(item.rating).toFixed(1)
                    : '0.0'}{' '}
                  {t('Rating')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end min-w-[90px] self-stretch justify-between py-1 shrink-0 border-t md:border-t-0 border-border/30 pt-4 md:pt-0 w-full md:w-auto">
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-black text-foreground flex items-center">
                <IndianRupee size={15} className="stroke-[3] mt-0.5" />
                {item.price}
              </span>
              <span className="text-muted-dark text-[10px] font-bold">
                {t('/ day')}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto mt-4 md:mt-0 relative">
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border border-border text-muted-dark hover:text-foreground hover:bg-muted/50 h-9 w-9 flex items-center justify-center shadow-sm cursor-pointer"
                  onClick={() => setOpenDropdownId(isOpen ? null : item.id)}
                >
                  <MoreVertical size={16} />
                </Button>

                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdownId(null)}
                    />
                    <div className="absolute right-0 bottom-11 md:bottom-auto md:top-11 bg-card rounded-2xl shadow-xl border border-border/40 p-1.5 z-50 min-w-[150px] animate-in fade-in slide-in-from-top-2 duration-200 space-y-1">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setOpenDropdownId(null)
                          onEdit(item)
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors justify-start h-auto"
                      >
                        <Pencil size={13} className="text-primary" />{' '}
                        {t('Edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setOpenDropdownId(null)
                          onDelete(item)
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-destructive hover:bg-danger hover:text-destructive rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors justify-start h-auto"
                      >
                        <Trash2 size={13} /> {t('Delete Listing')}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
