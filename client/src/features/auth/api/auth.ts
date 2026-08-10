import { apiClient } from '#/lib/api'

export const authApi = {
  sendOtp: async (email: string, name?: string) => {
    try {
      const res = await apiClient.post('/auth/send-otp', { email, name })
      return res.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send OTP')
    }
  },

  verifyOtp: async (email: string, otp: string, visitorId?: string) => {
    try {
      const res = await apiClient.post('/auth/verify-otp', {
        email,
        otp,
        visitorId,
      })
      return res.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Verification failed')
    }
  },

  getPendingVerification: async () => {
    try {
      const res = await apiClient.get('/auth/pending-verification')
      if (res.status === 204) return null
      return res.data
    } catch (error) {
      return null
    }
  },

  cancelPendingVerification: async () => {
    try {
      const res = await apiClient.delete('/auth/pending-verification')
      return res.status >= 200 && res.status < 300
    } catch (error) {
      return false
    }
  },

  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const res = await apiClient.get(
        `/auth/check-email?email=${encodeURIComponent(email)}`,
      )
      return res.data.exists === true
    } catch (error) {
      return false
    }
  },
}
