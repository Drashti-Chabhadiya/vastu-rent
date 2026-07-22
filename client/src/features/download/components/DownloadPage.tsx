import ApkDownloadSection from '#/components/common/ApkDownloadSection'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

export function DownloadPage() {
  const { t } = useTranslation()

  return (
    <div className="bg-background">
      <ApkDownloadSection />

      {/* Optional: Extra help section */}
      <section className="bg-surface py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
            {t('Need help with the installation?')}
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto font-sans">
            {t(
              "If you're having trouble installing the APK, please check our help guide or contact our support team. We're here to help you get started.",
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-4 font-sans">
            <Button variant="outline" size="lg">
              {t('Read Help Guide')}
            </Button>
            <Button size="lg" className="shadow-lg shadow-primary/20">
              {t('Contact Support')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

