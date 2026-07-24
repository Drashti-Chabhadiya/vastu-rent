import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export interface AddressData {
  id?: string
  title?: string
  addressType?: 'home' | 'shop' | string
  shopName?: string
  addressLine1?: string
  addressLine2?: string
  street?: string
  city?: string
  state?: string
  pincode?: string
  googleMapLink?: string
  country?: string
  isDefault?: boolean
}

// Fetch all addresses for the logged-in user
export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await apiClient.get('/addresses')
      return res.data.addresses as AddressData[]
    },
  })
}

// Fetch single address by ID
export const useAddress = (id: string) => {
  return useQuery({
    queryKey: ['address', id],
    queryFn: async () => {
      const res = await apiClient.get(`/addresses/${id}`)
      return res.data.address as AddressData
    },
    enabled: !!id,
  })
}

// Create new address
export const useCreateAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AddressData) => {
      const res = await apiClient.post('/addresses', data)
      return res.data.address
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

// Update existing address
export const useUpdateAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AddressData }) => {
      const res = await apiClient.put(`/addresses/${id}`, data)
      return res.data.address
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      queryClient.invalidateQueries({ queryKey: ['address', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

// Delete address
export const useDeleteAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/addresses/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

// Set address as default
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/addresses/${id}/default`)
      return res.data.address
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}
