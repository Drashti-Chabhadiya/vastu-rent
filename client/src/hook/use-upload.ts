import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

// Upload a single product / category image
export const useUploadProductImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post('/upload/product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.url as string
    },
  })
}

// Upload multiple product images (returns array of URLs)
export const useUploadProductImages = () => {
  return useMutation({
    mutationFn: async (files: FileList) => {
      const promises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const res = await apiClient.post('/upload/product', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        return {
          url: res.data.url as string,
          faces: res.data.faces as any[],
        }
      })
      return Promise.all(promises)
    },
  })
}

// Upload a profile picture
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post('/upload/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data as { user: any }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth-session'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          user: { ...old.user, image: data.user?.image ?? old.user.image },
        }
      })
      queryClient.invalidateQueries({ queryKey: ['auth-session'] })
    },
  })
}

// Upload a chat file attachment
export const useUploadChatFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.url as string
    },
  })
}
