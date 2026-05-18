import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

// Fetch all users with filters
export const useAdminUsers = (params?: { search?: string; role?: string; status?: string }) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users', { params })
      return res.data.users
    }
  })
}

// Fetch recent users
export const useAdminRecentUsers = () => {
  return useQuery({
    queryKey: ['recent-users'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users/recent')
      return res.data.users
    }
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
    }
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
    }
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
    }
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
    enabled: !!id
  })
}