import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useSettings, useUpdateSettings } from '#/hook'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'

import { ContactSettingsTab } from './site-settings/ContactSettingsTab'
import { PricingSettingsTab } from './site-settings/PricingSettingsTab'
import { TrustSettingsTab } from './site-settings/TrustSettingsTab'
import { TermsSettingsTab } from './site-settings/TermsSettingsTab'

export const SiteSettingsForm = () => {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const [activeTab, setActiveTab] = useState<
    'contact' | 'pricing' | 'trust' | 'terms'
  >('contact')

  // Contact States
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [contactDescription, setContactDescription] = useState('')

  // Pricing States
  const [starterPrice, setStarterPrice] = useState<number | string>(0)
  const [proPrice, setProPrice] = useState<number | string>(499)
  const [businessPrice, setBusinessPrice] = useState<number | string>(999)

  const [starterFeatures, setStarterFeatures] = useState<string[]>([])
  const [proFeatures, setProFeatures] = useState<string[]>([])
  const [businessFeatures, setBusinessFeatures] = useState<string[]>([])

  // Trust States
  const [commitments, setCommitments] = useState<
    Array<{ iconName: string; title: string; description: string }>
  >([])
  const [safetyTips, setSafetyTips] = useState<
    Array<{ iconName: string; title: string; description: string }>
  >([])

  // Terms States
  const [termsLastUpdated, setTermsLastUpdated] = useState('')
  const [termsSections, setTermsSections] = useState<
    Array<{ id: string; title: string; content: string }>
  >([])

  // Initialize fields once settings data loads
  useEffect(() => {
    if (settings) {
      // Contact
      setContactEmail(settings.contact?.email || 'support@vastu.com')
      setContactPhone(settings.contact?.phone || '+91 98765 43210')
      setContactAddress(settings.contact?.address || '')
      setContactDescription(settings.contact?.description || '')

      // Pricing
      setStarterPrice(
        settings.pricing?.starterPrice !== undefined
          ? settings.pricing.starterPrice
          : 0,
      )
      setProPrice(
        settings.pricing?.proPrice !== undefined
          ? settings.pricing.proPrice
          : 499,
      )
      setBusinessPrice(
        settings.pricing?.businessPrice !== undefined
          ? settings.pricing.businessPrice
          : 999,
      )

      setStarterFeatures(settings.pricing?.starterFeatures || [])
      setProFeatures(settings.pricing?.proFeatures || [])
      setBusinessFeatures(settings.pricing?.businessFeatures || [])

      // Trust
      setCommitments(settings.trust?.commitments || [])
      setSafetyTips(settings.trust?.safetyTips || [])

      // Terms
      setTermsLastUpdated(settings.terms?.lastUpdated || '')
      setTermsSections(settings.terms?.sections || [])
    }
  }, [settings])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      contact: {
        email: contactEmail,
        phone: contactPhone,
        address: contactAddress,
        description: contactDescription,
      },
      pricing: {
        starterPrice: Number(starterPrice),
        proPrice: Number(proPrice),
        businessPrice: Number(businessPrice),
        starterFeatures: starterFeatures.filter((f) => f.trim() !== ''),
        proFeatures: proFeatures.filter((f) => f.trim() !== ''),
        businessFeatures: businessFeatures.filter((f) => f.trim() !== ''),
      },
      trust: {
        commitments,
        safetyTips,
      },
      terms: {
        lastUpdated: termsLastUpdated,
        sections: termsSections,
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

  // Feature Helpers
  const addFeature = (plan: 'starter' | 'pro' | 'business') => {
    if (plan === 'starter') setStarterFeatures([...starterFeatures, ''])
    if (plan === 'pro') setProFeatures([...proFeatures, ''])
    if (plan === 'business') setBusinessFeatures([...businessFeatures, ''])
  }

  const removeFeature = (
    plan: 'starter' | 'pro' | 'business',
    index: number,
  ) => {
    if (plan === 'starter')
      setStarterFeatures(starterFeatures.filter((_, i) => i !== index))
    if (plan === 'pro')
      setProFeatures(proFeatures.filter((_, i) => i !== index))
    if (plan === 'business')
      setBusinessFeatures(businessFeatures.filter((_, i) => i !== index))
  }

  const updateFeatureText = (
    plan: 'starter' | 'pro' | 'business',
    index: number,
    value: string,
  ) => {
    if (plan === 'starter') {
      const updated = [...starterFeatures]
      updated[index] = value
      setStarterFeatures(updated)
    }
    if (plan === 'pro') {
      const updated = [...proFeatures]
      updated[index] = value
      setProFeatures(updated)
    }
    if (plan === 'business') {
      const updated = [...businessFeatures]
      updated[index] = value
      setBusinessFeatures(updated)
    }
  }

  // Trust/Commitments Helpers
  const addCommitment = () => {
    setCommitments([
      ...commitments,
      { iconName: 'Shield', title: '', description: '' },
    ])
  }

  const removeCommitment = (index: number) => {
    setCommitments(commitments.filter((_, i) => i !== index))
  }

  const updateCommitment = (
    index: number,
    field: 'iconName' | 'title' | 'description',
    value: string,
  ) => {
    const updated = [...commitments]
    updated[index] = { ...updated[index], [field]: value }
    setCommitments(updated)
  }

  // Safety Tips Helpers
  const addSafetyTip = () => {
    setSafetyTips([
      ...safetyTips,
      { iconName: 'MessageSquare', title: '', description: '' },
    ])
  }

  const removeSafetyTip = (index: number) => {
    setSafetyTips(safetyTips.filter((_, i) => i !== index))
  }

  const updateSafetyTip = (
    index: number,
    field: 'iconName' | 'title' | 'description',
    value: string,
  ) => {
    const updated = [...safetyTips]
    updated[index] = { ...updated[index], [field]: value }
    setSafetyTips(updated)
  }

  // Terms Section Helpers
  const addTermsSection = () => {
    const randomId = `section_${Math.random().toString(36).substr(2, 9)}`
    setTermsSections([
      ...termsSections,
      { id: randomId, title: '', content: '' },
    ])
  }

  const removeTermsSection = (index: number) => {
    setTermsSections(termsSections.filter((_, i) => i !== index))
  }

  const updateTermsSection = (
    index: number,
    field: 'id' | 'title' | 'content',
    value: string,
  ) => {
    const updated = [...termsSections]
    updated[index] = { ...updated[index], [field]: value }
    setTermsSections(updated)
  }

  const hasChanges = (() => {
    if (!settings) return false

    // Contact details check
    if (contactEmail !== (settings.contact?.email || 'support@vastu.com'))
      return true
    if (contactPhone !== (settings.contact?.phone || '+91 98765 43210'))
      return true
    if (contactAddress !== (settings.contact?.address || '')) return true
    if (contactDescription !== (settings.contact?.description || ''))
      return true

    // Pricing details check
    if (Number(starterPrice) !== Number(settings.pricing?.starterPrice ?? 0))
      return true
    if (Number(proPrice) !== Number(settings.pricing?.proPrice ?? 499))
      return true
    if (
      Number(businessPrice) !== Number(settings.pricing?.businessPrice ?? 999)
    )
      return true

    // Features check (shallow array comparison)
    const initStarter = settings.pricing?.starterFeatures || []
    if (
      starterFeatures.length !== initStarter.length ||
      starterFeatures.some((f, i) => f !== initStarter[i])
    )
      return true

    const initPro = settings.pricing?.proFeatures || []
    if (
      proFeatures.length !== initPro.length ||
      proFeatures.some((f, i) => f !== initPro[i])
    )
      return true

    const initBusiness = settings.pricing?.businessFeatures || []
    if (
      businessFeatures.length !== initBusiness.length ||
      businessFeatures.some((f, i) => f !== initBusiness[i])
    )
      return true

    // Trust check
    const initCommitments = settings.trust?.commitments || []
    if (JSON.stringify(commitments) !== JSON.stringify(initCommitments))
      return true

    const initSafety = settings.trust?.safetyTips || []
    if (JSON.stringify(safetyTips) !== JSON.stringify(initSafety)) return true

    // Terms check
    if (termsLastUpdated !== (settings.terms?.lastUpdated || '')) return true
    const initTerms = settings.terms?.sections || []
    if (JSON.stringify(termsSections) !== JSON.stringify(initTerms)) return true

    return false
  })()

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

        <ContactSettingsTab
          contactEmail={contactEmail}
          setContactEmail={setContactEmail}
          contactPhone={contactPhone}
          setContactPhone={setContactPhone}
          contactAddress={contactAddress}
          setContactAddress={setContactAddress}
          contactDescription={contactDescription}
          setContactDescription={setContactDescription}
        />

        <PricingSettingsTab
          starterPrice={starterPrice}
          setStarterPrice={setStarterPrice}
          proPrice={proPrice}
          setProPrice={setProPrice}
          businessPrice={businessPrice}
          setBusinessPrice={setBusinessPrice}
          starterFeatures={starterFeatures}
          proFeatures={proFeatures}
          businessFeatures={businessFeatures}
          addFeature={addFeature}
          removeFeature={removeFeature}
          updateFeatureText={updateFeatureText}
        />

        <TrustSettingsTab
          commitments={commitments}
          addCommitment={addCommitment}
          removeCommitment={removeCommitment}
          updateCommitment={updateCommitment}
          safetyTips={safetyTips}
          addSafetyTip={addSafetyTip}
          removeSafetyTip={removeSafetyTip}
          updateSafetyTip={updateSafetyTip}
        />

        <TermsSettingsTab
          termsLastUpdated={termsLastUpdated}
          setTermsLastUpdated={setTermsLastUpdated}
          termsSections={termsSections}
          addTermsSection={addTermsSection}
          removeTermsSection={removeTermsSection}
          updateTermsSection={updateTermsSection}
        />
      </Tabs>
    </form>
  )
}
