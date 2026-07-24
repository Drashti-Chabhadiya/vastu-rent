import { useQuery } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export interface PincodeResponse {
  valid: boolean
  pincode?: string
  district?: string
  state?: string
  country?: string
  message?: string
  source?: string
}

export interface LocationItem {
  id: number
  name: string
  country_id?: number
  state_id?: number
}

// 1. Fetch pincode details (district, state, country)
export const usePincodeLookup = (
  pincode: string,
  options?: { enabled?: boolean },
) => {
  return useQuery<PincodeResponse>({
    queryKey: ['pincode-lookup', pincode],
    queryFn: async () => {
      const { data } = await apiClient.get(`/locations/pincode/${pincode}`)
      return data
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    retry: false,
    ...options,
  })
}

// 2. Search state by name & countryId (used for state matching from pincode)
export const useStateSearch = (
  q?: string,
  countryId?: number,
  options?: { enabled?: boolean },
) => {
  return useQuery<LocationItem[]>({
    queryKey: ['state-lookup-by-name', q, countryId],
    queryFn: async () => {
      if (!q) return []
      const { data } = await apiClient.get(
        `/locations/states/search?q=${encodeURIComponent(q)}&countryId=${countryId || 101}`,
      )
      return data
    },
    staleTime: 1000 * 60 * 30,
    ...options,
  })
}

// 3. Generic location dropdown queries for countries, states, and cities
export const useLocations = (
  {
    type,
    parentId,
    search,
  }: {
    type: 'country' | 'state' | 'city'
    parentId?: number
    search?: string
  },
  options?: { enabled?: boolean },
) => {
  return useQuery<LocationItem[]>({
    queryKey: ['location', type, parentId, search],
    queryFn: async () => {
      if (type === 'state' && !parentId) return []
      if (type === 'city' && !parentId) return []

      const params = new URLSearchParams()
      if (type === 'state' && parentId)
        params.append('countryId', parentId.toString())
      if (type === 'city' && parentId)
        params.append('stateId', parentId.toString())

      let endpoint = '/locations/countries'
      if (type === 'state') endpoint = '/locations/states'
      if (type === 'city') endpoint = '/locations/cities'

      if (search) {
        endpoint += '/search'
        params.append('q', search)
      }

      const { data } = await apiClient.get(`${endpoint}?${params.toString()}`)
      return data
    },
    ...options,
  })
}
