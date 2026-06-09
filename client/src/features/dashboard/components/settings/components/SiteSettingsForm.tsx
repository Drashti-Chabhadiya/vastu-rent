import { useEffect } from 'react'
import { Save } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useSettings, useUpdateSettings } from '#/hook'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'

import { ContactSettingsTab } from './site-settings/ContactSettingsTab'
import { PricingSettingsTab } from './site-settings/PricingSettingsTab'
import { TrustSettingsTab } from './site-settings/TrustSettingsTab'
import { TermsSettingsTab } from './site-settings/TermsSettingsTab'
import { useSiteSettingsStore } from '../../../../../store/useSiteSettingsStore'

export const SiteSettingsForm = () => {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const initialize = useSiteSettingsStore((state) => state.initialize)
  const activeTab = useSiteSettingsStore((state) => state.activeTab)
  const setActiveTab = useSiteSettingsStore((state) => state.setActiveTab)
  const hasChanges = useSiteSettingsStore((state) => state.hasChanges(settings))

  // Initialize fields once settings data loads
  useEffect(() => {
    if (settings) {
      initialize(settings)
    }
  }, [settings, initialize])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const state = useSiteSettingsStore.getState()

    const payload = {
      contact: {
        email: state.contactEmail,
        phone: state.contactPhone,
        address: state.contactAddress,
        description: state.contactDescription,
      },
      pricing: {
        starterPrice: Number(state.starterPrice),
        proPrice: Number(state.proPrice),
        businessPrice: Number(state.businessPrice),
        starterFeatures: state.starterFeatures.filter((f) => f.trim() !== ''),
        proFeatures: state.proFeatures.filter((f) => f.trim() !== ''),
        businessFeatures: state.businessFeatures.filter((f) => f.trim() !== ''),
      },
      trust: {
        commitments: state.commitments,
        safetyTips: state.safetyTips,
      },
      terms: {
        lastUpdated: state.termsLastUpdated,
        sections: state.termsSections,
      },
    }

    updateSettings.mutate(payload, {
      onSuccess: () => {
        toast.success('Site Content Settings saved successfully! 🌐')
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          'Failed to save settings. Please try again.',
        )
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-4 bg-muted/40 rounded-md w-36" />
            <div className="h-3 bg-muted/30 rounded-md w-64" />
          </div>
          <div className="h-10 bg-muted/40 rounded-full w-28" />
        </div>
        <div className="h-10 bg-muted-light/60 rounded-xl w-full" />
        <div className="space-y-4">
          <div className="h-12 bg-muted/20 rounded-2xl w-full" />
          <div className="h-12 bg-muted/20 rounded-2xl w-full" />
          <div className="h-32 bg-muted/20 rounded-2xl w-full" />
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col h-full space-y-6 animate-in fade-in duration-300"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/10">
        <div>
          <h3 className="text-xl font-extrabold text-dash-brand font-display tracking-tight leading-none">
            Site Content Settings
          </h3>
          <p className="text-[12px] font-semibold text-muted-dark mt-2">
            Manage public-facing marketing copy dynamically.
          </p>
        </div>
        <Button
          type="submit"
          disabled={!hasChanges || updateSettings.isPending}
          className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground rounded-[12px] px-6 h-11 text-xs font-black flex items-center gap-2 shadow-md shadow-dash-brand/10 cursor-pointer transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-dash-brand"
        >
          <Save size={13} />
          {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Pill Sub-Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val: any) => setActiveTab(val)}
        className="w-full flex flex-col flex-1 min-h-0 space-y-6"
      >
        <TabsList className="w-full flex p-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0] h-auto justify-between mb-8">
          <TabsTrigger
            value="contact"
            className="flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-dash-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm border border-transparent text-[#334155] hover:text-dash-brand cursor-pointer"
          >
            Contact
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-dash-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm border border-transparent text-[#334155] hover:text-dash-brand cursor-pointer"
          >
            Pricing
          </TabsTrigger>
          <TabsTrigger
            value="trust"
            className="flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-dash-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm border border-transparent text-[#334155] hover:text-dash-brand cursor-pointer"
          >
            Trust
          </TabsTrigger>
          <TabsTrigger
            value="terms"
            className="flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-dash-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm border border-transparent text-[#334155] hover:text-dash-brand cursor-pointer"
          >
            Terms
          </TabsTrigger>
        </TabsList>

        <ContactSettingsTab />
        <PricingSettingsTab />
        <TrustSettingsTab />
        <TermsSettingsTab />
      </Tabs>
    </form>
  )
}
