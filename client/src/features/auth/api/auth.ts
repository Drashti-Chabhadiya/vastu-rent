import { getApiUrl } from '#/lib/utils'

export const authApi = {
  sendOtp: async (email: string, name?: string) => {
    const res = await fetch(getApiUrl('/api/auth/send-otp'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, name }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to send OTP')
    }
    return res.json()
  },

  verifyOtp: async (email: string, otp: string, visitorId?: string) => {
    const res = await fetch(getApiUrl('/api/auth/verify-otp'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, otp, visitorId }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Verification failed')
    }
    return res.json()
  },

  getPendingVerification: async () => {
    const res = await fetch(getApiUrl('/api/auth/pending-verification'), {
      method: 'GET',
      credentials: 'include',
    })

    if (res.status === 204) return null
    if (!res.ok) return null

    return res.json()
  },

  cancelPendingVerification: async () => {
    const res = await fetch(getApiUrl('/api/auth/pending-verification'), {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!res.ok) return false
    return true
  },

  checkEmailExists: async (email: string): Promise<boolean> => {
    const res = await fetch(
      getApiUrl(`/api/auth/check-email?email=${encodeURIComponent(email)}`),
      { credentials: 'include' },
    )
    if (!res.ok) return false
    const data = await res.json()
    return data.exists === true
  },
}
