import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

// Fetch all users with filters
export const useAdminUsers = (
  params?: { search?: string; role?: string; status?: string },
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users', { params })
      return res.data.users
    },
    ...options,
  })
}

// Fetch recent users
export const useAdminRecentUsers = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['recent-users'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users/recent')
      return res.data.users
    },
    ...options,
  })
}

// Ban/Unban user mutation
export const useBanUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, banned }: { id: string; banned: boolean }) => {
      await apiClient.post(`/admin/users/${id}/ban`, { banned })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['recent-users'] })
    },
  })
}

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['recent-users'] })
    },
  })
}

// Update user role mutation
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await apiClient.post(`/admin/users/${id}/role`, { role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

// Fetch public user profile
export const useUserProfile = (id: string) => {
  return useQuery({
    queryKey: ['user-profile', id],
    queryFn: async () => {
      const res = await apiClient.get(`/users/profile/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

// Update user settings mutation (Bank & preferences)
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      upiId?: string
      bankName?: string
      accountNumber?: string
      ifscCode?: string
      accountHolder?: string
      bookingAlerts?: boolean
      settlementAlerts?: boolean
      marketingAlerts?: boolean
      gender?: string
      location?: string
      phone?: string
      language?: string
      dob?: string
      currency?: string
      bio?: string
      twoFactorEnabled?: boolean
      showProfile?: boolean
      showOnline?: boolean
      allowData?: boolean
      addressLine1?: string
      addressLine2?: string
      street?: string
      city?: string
      state?: string
      pincode?: string
      country?: string
      shopName?: string
      addressType?: string
    }) => {
      const res = await apiClient.patch('/users/settings', data)
      return res.data.user
    },
    onSuccess: () => {
      // Invalidate the session query to reload user data globally!
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

// Fetch Cloudinary storage usage metrics
export const useCloudinaryUsage = (options?: {
  enabled?: boolean
  staleTime?: number
  refetchOnWindowFocus?: boolean
}) => {
  return useQuery({
    queryKey: ['cloudinary-usage'],
    queryFn: async () => {
      const res = await apiClient.get('/users/settings/cloudinary/usage')
      return res.data
    },
    ...options,
  })
}

// Fetch recent searches
export const useRecentSearches = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['recent-searches'],
    queryFn: async () => {
      const res = await apiClient.get('/users/settings/recent-searches')
      return res.data.searches
    },
    ...options,
  })
}

// Save recent search mutation
export const useSaveRecentSearch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await apiClient.post('/users/settings/recent-searches', {
        query,
      })
      return res.data.searches
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] })
    },
  })
}

// Delete recent search mutation
export const useDeleteRecentSearch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/settings/recent-searches/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] })
    },
  })
}

// Clear all recent searches mutation
export const useClearRecentSearches = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/users/settings/recent-searches')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] })
    },
  })
}

// Fetch user sessions
export const useUserSessions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/users/settings/sessions')
      return res.data.sessions as any[]
    },
    ...options,
  })
}

// Rename device session mutation
export const useRenameSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await apiClient.patch(`/users/settings/sessions/${id}`, {
        deviceName: name,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
  })
}

// Revoke user session mutation
export const useRevokeSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/settings/sessions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
  })
}

// Submit account deletion request mutation
export const useDeleteAccountRequest = () => {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/users/settings/delete-request')
    },
  })
}
