import { LogOut } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

export function LogoutDialog({
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const { t } = useTranslation()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center mb-5">
          <LogOut size={28} className="text-primary" strokeWidth={2} />
        </div>

        <h2 className="text-xl font-extrabold text-foreground mb-2">
          {t('Log out')}
        </h2>
        <p className="text-[13px] text-muted-foreground/85 font-medium leading-relaxed mb-7">
          {t('Are you sure you want to log out of your Vastu account?')}
        </p>

        <Button
          onClick={onConfirm}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold mb-3 transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-card/40 border-t-white rounded-full animate-spin" />
              {t('Logging out...')}
            </>
          ) : (
            t('Yes, log out')
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full h-11 rounded-xl font-bold bg-muted text-muted-foreground hover:bg-muted-dark/20 transition-all border-none"
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  )
}
