export type AppUserRole = 'user' | 'admin'

export const normalizeRole = (
  role?: string | null,
): AppUserRole | undefined => {
  if (role === 'user' || role === 'admin') return role
  return undefined
}

export const isAdminRole = (role?: string | null) =>
  normalizeRole(role) === 'admin'
export const isUserRole = (role?: string | null) =>
  normalizeRole(role) === 'user'
export const isDashboardRole = (role?: string | null) =>
  isAdminRole(role) || isUserRole(role)
