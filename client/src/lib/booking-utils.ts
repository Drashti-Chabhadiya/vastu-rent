export type BookingGroup = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

/**
 * Maps raw booking status from API to a higher level booking category group.
 */
export function getBookingGroup(status: string): BookingGroup {
  const s = status.toLowerCase()
  if (s === 'pending' || s === 'confirmed') return 'upcoming'
  if (s === 'picked_up' || s === 'in_use') return 'ongoing'
  if (s === 'returned' || s === 'completed') return 'completed'
  if (s === 'cancelled' || s === 'rejected') return 'cancelled'
  return 'upcoming'
}
