import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import { type ListingSchema } from '#/schema'

// Fetch all listings with filters (Public)
export const useProducts = (params?: { search?: string; categoryId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await apiClient.get('/products', { params })
      return res.data.products
    }
  })
}

// Fetch products by IDs (Wishlist)
// Fetch liked products (Wishlist)
export const useWishlistProducts = () => {
  return useQuery({
    queryKey: ['wishlist-products'],
    queryFn: async () => {
      const res = await apiClient.get('/likes')
      return res.data.products
    }
  })
}

// Fetch single listing by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}`)
      return res.data.product
    },
    enabled: !!id
  })
}

// Fetch all listings with filters (Admin)
export const useAdminProducts = (params?: { search?: string; categoryId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: async () => {
      const res = await apiClient.get('/admin/products', { params })
      return res.data.products
    }
  })
}

// Fetch recent listings
export const useAdminRecentProducts = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['recent-products'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/products/recent')
      return res.data.products
    },
    ...options
  })
}

// Create listing mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ListingSchema) => {
      await apiClient.post('/admin/products', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['recent-products'] })
    }
  })
}

// Toggle listing availability mutation
export const useToggleProductStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      await apiClient.post(`/admin/products/${id}/available`, { isAvailable })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    }
  })
}

// Delete listing mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['recent-products'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    }
  })
}

// Create delete request mutation (for admins)
export const useCreateDeleteRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ productId, reason }: { productId: string; reason?: string }) => {
      await apiClient.post('/delete-requests', { productId, reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delete-requests'] })
    }
  })
}

// Fetch all delete requests (for superAdmins)
export const useDeleteRequests = () => {
  return useQuery({
    queryKey: ['delete-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/delete-requests')
      return res.data.requests
    }
  })
}

// Process delete request (for superAdmins)
export const useProcessDeleteRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      await apiClient.patch(`/delete-requests/${id}/process`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delete-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    }
  })
}
// Create rental (Rent Now)
export const useCreateRental = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { productId: string; startDate: string; endDate: string; totalPrice: number; rentalFee: number; depositAmount: number; paymentMethod?: string }) => {
      const res = await apiClient.post('/rentals', data)
      return res.data.rental
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rentals'] })
    }
  })
}

// Fetch my rentals
export const useMyRentals = () => {
  return useQuery({
    queryKey: ['my-rentals'],
    queryFn: async () => {
      const res = await apiClient.get('/rentals/my')
      return res.data.rentals
    },
    retry: false
  })
}

// Fetch my listings
export const useMyListings = () => {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const res = await apiClient.get('/products/my-listings')
      return res.data.products
    }
  })
}
// Fetch orders (for Owners/Admins)
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await apiClient.get('/rentals/orders')
      return res.data.rentals
    }
  })
}

// Update rental status
export const useUpdateRentalStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/rentals/${id}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['my-rentals'] })
    }
  })
}

// Get rentals for a specific product (to block dates)
export const useProductRentals = (productId: string) => {
  return useQuery({
    queryKey: ['product-rentals', productId],
    queryFn: async () => {
      const res = await apiClient.get('/rentals/product/' + productId)
      return res.data.rentals
    },
    enabled: !!productId
  })
}
