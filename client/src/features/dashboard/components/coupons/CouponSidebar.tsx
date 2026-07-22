import {
  Ticket,
  Zap,
  CheckCircle2,
  Users,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { scenarioColorMap } from '#/lib/coupon-utils'
import { useTranslation } from '#/context/TranslationContext'

interface CouponSidebarProps {
  isAdmin: boolean
  isUser: boolean
  activeTab: 'my' | 'global'
  onCreateClick: () => void
}

export function CouponSidebar({
  isAdmin,
  isUser,
  activeTab,
  onCreateClick,
}: CouponSidebarProps) {
  const { t } = useTranslation()
  const canCreate = isAdmin || (isUser && activeTab === 'my')

  const SCENARIOS = [
    {
      icon: Users,
      color: 'rose',
      title: t('Once Per User'),
      desc: 'perUserLimit = 1',
      sub: t('Each renter can redeem once only.'),
    },
    {
      icon: Globe,
      color: 'amber',
      title: t('First Come First Serve'),
      desc: 'usageLimit = 100',
      sub: t('Available to first 100 successful bookings.'),
    },
    {
      icon: ShieldCheck,
      color: 'violet',
      title: t('FCFS + Once Per User'),
      desc: 'usageLimit = 100 + perUserLimit = 1',
      sub: t('First 100 users, one redemption each.'),
    },
    {
      icon: Ticket,
      color: 'emerald',
      title: t('Unlimited (Global)'),
      desc: t('Both fields empty'),
      sub: t('Anyone can use anytime without limits.'),
    },
  ]

  const RULES = [
    t('User coupons apply only to listings created by that user.'),
    t('Listing-restricted coupons apply solely to that specific item.'),
    t(
      'usedCount auto-increments on booking and decrements on cancellation/rejection.',
    ),
    t('Per-user redemption count is verified at checkout atomically.'),
  ]

  return (
    <div className="space-y-6">
      {/* Create CTA */}
      <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 bg-emerald-500/5 transition-transform group-hover:scale-150" />
        <Zap className="text-emerald-600 mb-4" size={32} />
        <h3 className="text-[15px] font-black text-foreground mb-2 uppercase tracking-widest">
          {t('Voucher Campaigns')}
        </h3>
        <p className="text-[11px] font-bold text-muted-dark mb-6 leading-relaxed">
          {t(
            'Launch targeted discount campaigns with flexible limits — per user, global FCFS, or combined.',
          )}
        </p>
        {canCreate && (
          <Button
            onClick={onCreateClick}
            className="w-full h-12 rounded-full bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground font-black text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-dash-brand/20 active:scale-95 transition-all"
          >
            <Ticket size={16} className="rotate-[-10deg]" />{' '}
            {t('Add New Coupon')}
          </Button>
        )}
      </div>

      {/* Scenario Reference */}
      <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm">
        <h3 className="text-[15px] font-black text-foreground mb-1 uppercase tracking-widest">
          {t('Limit Scenarios')}
        </h3>
        <p className="text-[10px] font-bold text-muted-dark mb-5">
          {t('Mix Global Limit + Per-User Limit for any combination.')}
        </p>
        <div className="space-y-3">
          {SCENARIOS.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.title}
                className={cn(
                  'flex gap-3 items-start p-3 rounded-xl border',
                  scenarioColorMap[s.color],
                )}
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-card/60">
                  <Icon size={12} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold">{s.title}</p>
                  <p className="text-[8px] font-black opacity-60 font-mono mt-0.5">
                    {s.desc}
                  </p>
                  <p className="text-[9px] font-bold opacity-70 mt-0.5">
                    {s.sub}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Campaign Rules */}
      <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm">
        <h3 className="text-[15px] font-black text-foreground mb-5 uppercase tracking-widest">
          {t('Campaign Rules')}
        </h3>
        <div className="space-y-4">
          {RULES.map((rule) => (
            <div key={rule} className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <CheckCircle2 size={12} />
              </div>
              <p className="text-[11px] font-bold text-muted-foreground/85">
                {rule}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
