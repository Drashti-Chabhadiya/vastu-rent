import { AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

interface CloudinarySettingsFormProps {
  cloudinaryCloudName: string
  setCloudinaryCloudName: (name: string) => void
  cloudinaryApiKey: string
  setCloudinaryApiKey: (key: string) => void
  cloudinaryApiSecret: string
  setCloudinaryApiSecret: (secret: string) => void
  cloudinaryUploadPreset: string
  setCloudinaryUploadPreset: (preset: string) => void
  cloudinaryHasSecret: boolean
  isTestingCloudinary: boolean
  isSavingCloudinary: boolean
  isLoadingCloudinary: boolean
  handleTestCloudinary: () => void
  handleSaveCloudinary: (e: React.FormEvent) => void
  formattedUsed: { value: string; unit: string }
  formattedLimit: { value: string; unit: string }
  usedPercent: number
  setIsDetailsModalOpen: (open: boolean) => void
}

export const CloudinarySettingsForm = ({
  cloudinaryCloudName,
  setCloudinaryCloudName,
  cloudinaryApiKey,
  setCloudinaryApiKey,
  cloudinaryApiSecret,
  setCloudinaryApiSecret,
  cloudinaryUploadPreset,
  setCloudinaryUploadPreset,
  cloudinaryHasSecret,
  isTestingCloudinary,
  isSavingCloudinary,
  isLoadingCloudinary,
  handleTestCloudinary,
  handleSaveCloudinary,
  formattedUsed,
  formattedLimit,
  usedPercent,
  setIsDetailsModalOpen,
}: CloudinarySettingsFormProps) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-black text-foreground/90">
            Cloudinary Storage
          </h3>
          <p className="text-[11px] font-bold text-muted-dark">
            Connect your personal Cloudinary account. Images you upload will be
            stored here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleTestCloudinary}
            disabled={isTestingCloudinary || isLoadingCloudinary}
            variant="outline"
            className="border-border text-muted-foreground hover:bg-muted-light font-black text-[10px] uppercase tracking-wider px-4 h-11 rounded-full transition-all shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isTestingCloudinary ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            type="button"
            onClick={handleSaveCloudinary}
            disabled={isSavingCloudinary || isLoadingCloudinary}
            className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground font-black text-[10px] uppercase tracking-wider px-5 h-11 rounded-full transition-all shadow-md shadow-dash-brand/10 active:scale-95 shrink-0 cursor-pointer"
          >
            {isSavingCloudinary ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {isLoadingCloudinary ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-muted/50 rounded-xl w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 bg-muted/50 rounded w-16" />
              <div className="h-12 bg-muted-light rounded-2xl w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted/50 rounded w-16" />
              <div className="h-12 bg-muted-light rounded-2xl w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted/50 rounded w-16" />
              <div className="h-12 bg-muted-light rounded-2xl w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted/50 rounded w-16" />
              <div className="h-12 bg-muted-light rounded-2xl w-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form config */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveCloudinary} className="space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-2.5 ${
                  cloudinaryHasSecret
                    ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-800'
                    : 'bg-warning/50 border-amber-100/50 text-warning-foreground'
                }`}
              >
                <AlertCircle
                  size={16}
                  className={`${cloudinaryHasSecret ? 'text-emerald-600' : 'text-warning-foreground'} shrink-0 mt-0.5`}
                />
                <div className="text-[10px] font-semibold leading-relaxed">
                  {cloudinaryHasSecret ? (
                    <p>
                      <strong>Connected!</strong> Your custom Cloudinary storage
                      is active. Images for your products, categories, and
                      profile will be uploaded securely using your credentials.
                    </p>
                  ) : (
                    <p>
                      <strong>Not Configured:</strong> You haven't connected
                      your custom Cloudinary credentials yet. You must set them
                      up before you can upload any product, category, or profile
                      images.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cloud Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                    Cloud Name
                  </label>
                  <Input
                    value={cloudinaryCloudName}
                    onChange={(e) => setCloudinaryCloudName(e.target.value)}
                    placeholder="e.g. dxyz12345"
                    className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-black text-foreground px-5 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                    API Key
                  </label>
                  <Input
                    value={cloudinaryApiKey}
                    onChange={(e) => setCloudinaryApiKey(e.target.value)}
                    placeholder="e.g. 123456789012345"
                    className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-black text-foreground px-5 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* API Secret */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                    API Secret{' '}
                    {cloudinaryHasSecret && (
                      <span className="text-[9px] text-dash-brand font-black lowercase tracking-normal">
                        (Saved)
                      </span>
                    )}
                  </label>
                  <Input
                    type="password"
                    value={cloudinaryApiSecret}
                    onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                    placeholder={
                      cloudinaryHasSecret
                        ? '••••••••••••••••••••••••••••'
                        : 'Enter Cloudinary API Secret'
                    }
                    className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-black text-foreground px-5 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Upload Preset */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                    Upload Preset (Optional)
                  </label>
                  <Input
                    value={cloudinaryUploadPreset}
                    onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                    placeholder="e.g. ml_default"
                    className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-black text-foreground px-5 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Storage Usage Card */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-[2rem] border border-border/30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[190px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-foreground/90 tracking-wide uppercase">
                    Storage Usage
                  </h4>
                  <span className="text-[10px] font-black text-dash-brand bg-dash-brand-light px-2 py-0.5 rounded uppercase">
                    Real-time
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                    <span>
                      <strong className="text-foreground/90 font-black">
                        {formattedUsed.value} {formattedUsed.unit}
                      </strong>{' '}
                      / {formattedLimit.value} {formattedLimit.unit} Used
                    </span>
                    <span className="font-extrabold text-foreground/90">
                      {usedPercent.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-muted-light border border-border/30 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(21,128,61,0.3)]"
                      style={{
                        width: `${usedPercent}%`,
                        backgroundColor: 'var(--color-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDetailsModalOpen(true)}
                className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-[11px] font-black text-dash-brand hover:text-dash-brand/80 hover:bg-transparent transition-all uppercase tracking-wider group w-full text-left p-0 h-auto rounded-none cursor-pointer active:scale-[0.98]"
              >
                <span>View Storage Details</span>
                <ChevronRight
                  size={14}
                  className="text-dash-brand group-hover:translate-x-0.5 transition-transform"
                />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
