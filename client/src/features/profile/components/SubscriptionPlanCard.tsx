import { Button } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import { CreditCard, Sparkles, AlertTriangle } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'

interface SubscriptionPlanCardProps {
  activeTier: string
  isExpired: boolean
  expiresAt: Date | null
  usedCount: number
  limitStr: string
  quotaPercent: number
  barColor: string
  limit: number
}

export function SubscriptionPlanCard({
  activeTier,
  isExpired,
  expiresAt,
  usedCount,
  limitStr,
  quotaPercent,
  barColor,
  limit,
}: SubscriptionPlanCardProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8 flex flex-col md:flex-row items-stretch justify-between gap-8 relative overflow-hidden">
      {/* Decorative background gradient */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Left: Plan Status */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-foreground text-base font-display">
                {t('Subscription Plan')}
              </h3>
              <p className="text-xs text-muted-foreground/85 mt-0.5 font-medium leading-none">
                {t('Manage your current plan, check limits, and view options.')}
              </p>
            </div>
          </div>

          {/* Plan Tier Info */}
          <div className="mt-8 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black text-foreground font-display tracking-tight font-sans">
              {t(activeTier)} {t('Plan')}
            </span>
            {isExpired && (
              <span className="text-[10px] font-bold text-destructive bg-danger border border-destructive/20 rounded-full px-2.5 py-0.5">
                {t('Plan Expired')}
              </span>
            )}
          </div>

          {/* Validity Details */}
          <p className="text-xs text-muted-foreground/85 font-semibold mt-2.5">
            {activeTier.toLowerCase() === 'starter' ? (
              t('Enjoy basic hosting with lifetime free access.')
            ) : (
              <>
                {t('Valid until')}{' '}
                <span className="text-foreground font-bold">
                  {expiresAt
                    ? expiresAt.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Quick Upgrade Callout */}
        <div className="mt-8">
          <Link to="/pricing">
            <Button className="rounded-xl h-10 px-5 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer">
              <Sparkles size={13} />
              {t('Upgrade Plan')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Middle border separator for larger screens */}
      <div className="hidden md:block w-px bg-border/40 shrink-0 self-stretch" />

      {/* Right: Quota Utilization */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              {t('Listing Capacity')}
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {usedCount} / {limitStr} {t('Used')}
            </span>
          </div>

          {/* Quota Progress Bar */}
          <div className="w-full h-3 bg-muted-light/60 rounded-full overflow-hidden mt-3.5 border border-border/10">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                barColor,
              )}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>

          {/* Limit Status Description */}
          <p className="text-[11px] text-muted-foreground/85 mt-3.5 font-medium leading-relaxed">
            {t(
              activeTier.toLowerCase() === 'starter'
                ? 'Starter members can list up to 5 items. Upgrade to a paid plan to list up to 50 or unlimited items.'
                : activeTier.toLowerCase() === 'pro'
                  ? 'Pro members can list up to 50 items. Upgrade to the Business plan for unlimited items.'
                  : 'You have unlimited listing capacity with your Business plan!',
            )}
          </p>
        </div>

        {/* Warning if nearing limits */}
        {activeTier.toLowerCase() !== 'business' && usedCount >= limit && (
          <div className="bg-danger border border-destructive/20 text-destructive rounded-xl p-3.5 flex items-start gap-2.5 mt-6">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold leading-normal">
              {t(
                'You have reached your listing limit. Upgrade your subscription plan to create new listings.',
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
