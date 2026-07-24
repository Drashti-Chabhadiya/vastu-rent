import { create } from 'zustand'
import type { ListingSchema } from '#/schema'

export interface ListingDraftState {
  draft: Partial<ListingSchema> | null
  setDraft: (draft: Partial<ListingSchema>) => void
  clearDraft: () => void
}

export const useListingDraftStore = create<ListingDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}))
