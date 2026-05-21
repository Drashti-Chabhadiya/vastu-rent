import ApkDownloadSection from '#/components/common/ApkDownloadSection'

export function DownloadPage() {
  return (
    <div className="pt-20 bg-background">
      <ApkDownloadSection />

      {/* Optional: Extra help section */}
      <section className="bg-surface py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
            Need help with the installation?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto font-sans">
            If you're having trouble installing the APK, please check our help
            guide or contact our support team. We're here to help you get
            started.
          </p>
          <div className="flex flex-wrap justify-center gap-4 font-sans">
            <button className="px-8 py-3 bg-white hover:bg-gray-50 text-foreground border border-border rounded-2xl font-semibold shadow-soft transition-all">
              Read Help Guide
            </button>
            <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-semibold shadow-xl shadow-primary/20 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
