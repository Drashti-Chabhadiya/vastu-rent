export type AppUserRole = 'user' | 'admin'
export type LegacyAppUserRole = AppUserRole | 'owner' | 'superAdmin'

export const normalizeRole = (
  role?: string | null,
): AppUserRole | undefined => {
  if (!role) return undefined
  if (role === 'owner') return 'user'
  if (role === 'superAdmin') return 'admin'
  if (role === 'user' || role === 'admin') return role
  return undefined
}

export const isAdminRole = (role?: string | null) => normalizeRole(role) === 'admin'
export const isUserRole = (role?: string | null) => normalizeRole(role) === 'user'
export const isDashboardRole = (role?: string | null) =>
  isAdminRole(role) || isUserRole(role)
