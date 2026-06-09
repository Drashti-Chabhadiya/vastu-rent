import { create } from 'zustand'

export interface Commitment {
  iconName: string
  title: string
  description: string
}

export interface SafetyTip {
  iconName: string
  title: string
  description: string
}

export interface TermsSection {
  id: string
  title: string
  content: string
}

export interface SiteSettingsState {
  // Tab State
  activeTab: 'contact' | 'pricing' | 'trust' | 'terms'
  setActiveTab: (tab: 'contact' | 'pricing' | 'trust' | 'terms') => void

  // Contact States
  contactEmail: string
  contactPhone: string
  contactAddress: string
  contactDescription: string

  setContactEmail: (val: string) => void
  setContactPhone: (val: string) => void
  setContactAddress: (val: string) => void
  setContactDescription: (val: string) => void

  // Pricing States
  starterPrice: number | string
  proPrice: number | string
  businessPrice: number | string
  starterFeatures: string[]
  proFeatures: string[]
  businessFeatures: string[]

  setStarterPrice: (val: number | string) => void
  setProPrice: (val: number | string) => void
  setBusinessPrice: (val: number | string) => void
  addFeature: (plan: 'starter' | 'pro' | 'business') => void
  removeFeature: (plan: 'starter' | 'pro' | 'business', index: number) => void
  updateFeatureText: (
    plan: 'starter' | 'pro' | 'business',
    index: number,
    value: string,
  ) => void

  // Trust States
  commitments: Commitment[]
  safetyTips: SafetyTip[]

  addCommitment: () => void
  removeCommitment: (index: number) => void
  updateCommitment: (
    index: number,
    field: 'iconName' | 'title' | 'description',
    value: string,
  ) => void

  addSafetyTip: () => void
  removeSafetyTip: (index: number) => void
  updateSafetyTip: (
    index: number,
    field: 'iconName' | 'title' | 'description',
    value: string,
  ) => void

  // Terms States
  termsLastUpdated: string
  termsSections: TermsSection[]

  setTermsLastUpdated: (val: string) => void
  addTermsSection: () => void
  removeTermsSection: (index: number) => void
  updateTermsSection: (
    index: number,
    field: 'id' | 'title' | 'content',
    value: string,
  ) => void

  // Common operations
  initialize: (settings: any) => void
  hasChanges: (settings: any) => boolean
}

export const useSiteSettingsStore = create<SiteSettingsState>((set, get) => ({
  // Tab State
  activeTab: 'contact',
  setActiveTab: (activeTab) => set({ activeTab }),

  // Contact States
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  contactDescription: '',

  setContactEmail: (contactEmail) => set({ contactEmail }),
  setContactPhone: (contactPhone) => set({ contactPhone }),
  setContactAddress: (contactAddress) => set({ contactAddress }),
  setContactDescription: (contactDescription) => set({ contactDescription }),

  // Pricing States
  starterPrice: 0,
  proPrice: 499,
  businessPrice: 999,
  starterFeatures: [],
  proFeatures: [],
  businessFeatures: [],

  setStarterPrice: (starterPrice) => set({ starterPrice }),
  setProPrice: (proPrice) => set({ proPrice }),
  setBusinessPrice: (businessPrice) => set({ businessPrice }),

  addFeature: (plan) => {
    if (plan === 'starter') {
      set((state) => ({ starterFeatures: [...state.starterFeatures, ''] }))
    } else if (plan === 'pro') {
      set((state) => ({ proFeatures: [...state.proFeatures, ''] }))
    } else if (plan === 'business') {
      set((state) => ({ businessFeatures: [...state.businessFeatures, ''] }))
    }
  },

  removeFeature: (plan, index) => {
    if (plan === 'starter') {
      set((state) => ({
        starterFeatures: state.starterFeatures.filter((_, i) => i !== index),
      }))
    } else if (plan === 'pro') {
      set((state) => ({
        proFeatures: state.proFeatures.filter((_, i) => i !== index),
      }))
    } else if (plan === 'business') {
      set((state) => ({
        businessFeatures: state.businessFeatures.filter((_, i) => i !== index),
      }))
    }
  },

  updateFeatureText: (plan, index, value) => {
    if (plan === 'starter') {
      set((state) => {
        const updated = [...state.starterFeatures]
        updated[index] = value
        return { starterFeatures: updated }
      })
    } else if (plan === 'pro') {
      set((state) => {
        const updated = [...state.proFeatures]
        updated[index] = value
        return { proFeatures: updated }
      })
    } else if (plan === 'business') {
      set((state) => {
        const updated = [...state.businessFeatures]
        updated[index] = value
        return { businessFeatures: updated }
      })
    }
  },

  // Trust States
  commitments: [],
  safetyTips: [],

  addCommitment: () => {
    set((state) => ({
      commitments: [
        ...state.commitments,
        { iconName: 'Shield', title: '', description: '' },
      ],
    }))
  },

  removeCommitment: (index) => {
    set((state) => ({
      commitments: state.commitments.filter((_, i) => i !== index),
    }))
  },

  updateCommitment: (index, field, value) => {
    set((state) => {
      const updated = [...state.commitments]
      updated[index] = { ...updated[index], [field]: value }
      return { commitments: updated }
    })
  },

  addSafetyTip: () => {
    set((state) => ({
      safetyTips: [
        ...state.safetyTips,
        { iconName: 'MessageSquare', title: '', description: '' },
      ],
    }))
  },

  removeSafetyTip: (index) => {
    set((state) => ({
      safetyTips: state.safetyTips.filter((_, i) => i !== index),
    }))
  },

  updateSafetyTip: (index, field, value) => {
    set((state) => {
      const updated = [...state.safetyTips]
      updated[index] = { ...updated[index], [field]: value }
      return { safetyTips: updated }
    })
  },

  // Terms States
  termsLastUpdated: '',
  termsSections: [],

  setTermsLastUpdated: (termsLastUpdated) => set({ termsLastUpdated }),

  addTermsSection: () => {
    const randomId = `section_${Math.random().toString(36).substring(2, 11)}`
    set((state) => ({
      termsSections: [
        ...state.termsSections,
        { id: randomId, title: '', content: '' },
      ],
    }))
  },

  removeTermsSection: (index) => {
    set((state) => ({
      termsSections: state.termsSections.filter((_, i) => i !== index),
    }))
  },

  updateTermsSection: (index, field, value) => {
    set((state) => {
      const updated = [...state.termsSections]
      updated[index] = { ...updated[index], [field]: value }
      return { termsSections: updated }
    })
  },

  // Initialize from source settings loaded from server
  initialize: (settings) => {
    if (!settings) return

    set({
      // Contact
      contactEmail: settings.contact?.email || 'support@vastu.com',
      contactPhone: settings.contact?.phone || '+91 98765 43210',
      contactAddress: settings.contact?.address || '',
      contactDescription: settings.contact?.description || '',

      // Pricing
      starterPrice:
        settings.pricing?.starterPrice !== undefined
          ? settings.pricing.starterPrice
          : 0,
      proPrice:
        settings.pricing?.proPrice !== undefined
          ? settings.pricing.proPrice
          : 499,
      businessPrice:
        settings.pricing?.businessPrice !== undefined
          ? settings.pricing.businessPrice
          : 999,
      starterFeatures: settings.pricing?.starterFeatures || [],
      proFeatures: settings.pricing?.proFeatures || [],
      businessFeatures: settings.pricing?.businessFeatures || [],

      // Trust
      commitments: settings.trust?.commitments || [],
      safetyTips: settings.trust?.safetyTips || [],

      // Terms
      termsLastUpdated: settings.terms?.lastUpdated || '',
      termsSections: settings.terms?.sections || [],
    })
  },

  // Compare draft state to source settings to check for changes
  hasChanges: (settings) => {
    if (!settings) return false

    const state = get()

    // Contact details check
    if (state.contactEmail !== (settings.contact?.email || 'support@vastu.com'))
      return true
    if (state.contactPhone !== (settings.contact?.phone || '+91 98765 43210'))
      return true
    if (state.contactAddress !== (settings.contact?.address || '')) return true
    if (state.contactDescription !== (settings.contact?.description || ''))
      return true

    // Pricing details check
    if (Number(state.starterPrice) !== Number(settings.pricing?.starterPrice ?? 0))
      return true
    if (Number(state.proPrice) !== Number(settings.pricing?.proPrice ?? 499))
      return true
    if (
      Number(state.businessPrice) !== Number(settings.pricing?.businessPrice ?? 999)
    )
      return true

    // Features check (shallow array comparison)
    const initStarter = settings.pricing?.starterFeatures || []
    if (
      state.starterFeatures.length !== initStarter.length ||
      state.starterFeatures.some((f, i) => f !== initStarter[i])
    )
      return true

    const initPro = settings.pricing?.proFeatures || []
    if (
      state.proFeatures.length !== initPro.length ||
      state.proFeatures.some((f, i) => f !== initPro[i])
    )
      return true

    const initBusiness = settings.pricing?.businessFeatures || []
    if (
      state.businessFeatures.length !== initBusiness.length ||
      state.businessFeatures.some((f, i) => f !== initBusiness[i])
    )
      return true

    // Trust check
    const initCommitments = settings.trust?.commitments || []
    if (JSON.stringify(state.commitments) !== JSON.stringify(initCommitments))
      return true

    const initSafety = settings.trust?.safetyTips || []
    if (JSON.stringify(state.safetyTips) !== JSON.stringify(initSafety))
      return true

    // Terms check
    if (state.termsLastUpdated !== (settings.terms?.lastUpdated || ''))
      return true
    const initTerms = settings.terms?.sections || []
    if (JSON.stringify(state.termsSections) !== JSON.stringify(initTerms))
      return true

    return false
  },
}))
