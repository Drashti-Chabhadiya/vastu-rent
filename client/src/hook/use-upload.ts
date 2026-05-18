import { useMutation } from '@tanstack/react-query'
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
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])
        const res = await apiClient.post('/upload/product', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        urls.push(res.data.url as string)
      }
      return urls
    },
  })
}

// Upload a profile picture
export const useUploadProfileImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post('/upload/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data as { user: any }
    },
  })
}

