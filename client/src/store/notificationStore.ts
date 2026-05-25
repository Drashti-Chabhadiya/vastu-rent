import { create } from 'zustand'
import { apiClient } from '#/lib/api'

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

type State = {
  items: NotificationItem[]
  isLoading: boolean
  page: number
  hasMore: boolean
  set: (items: NotificationItem[]) => void
  add: (n: NotificationItem) => void
  markReadLocal: (id: string) => void
  markAllReadLocal: () => void
  fetchMore: () => Promise<void>
  clear: () => void
}

export const useNotificationStore = create<State>((set, get) => ({
  items: [],
  isLoading: false,
  page: 1,
  hasMore: true,
  set: (items) => set({ items }),
  add: (n) => set((s) => ({ items: [n, ...s.items] })),
  markReadLocal: (id) => set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, isRead: true } : it)) })),
  markAllReadLocal: () => set((s) => ({ items: s.items.map((it) => ({ ...it, isRead: true })) })),
  fetchMore: async () => {
    const s = get()
    if (!s.hasMore || s.isLoading) return
    set({ isLoading: true })
    try {
      const res = await apiClient.get(`/notifications?page=${s.page + 1}`)
      const data = res.data.notifications || []
      set({ items: [...s.items, ...data], page: s.page + 1, hasMore: data.length > 0 })
    } catch (err) {
      console.error('Failed to fetch notifications page', err)
    } finally {
      set({ isLoading: false })
    }
  },
  clear: () => set({ items: [], page: 1, hasMore: true }),
}))
