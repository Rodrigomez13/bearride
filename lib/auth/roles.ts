export const APP_ROLES = ['PASSENGER', 'DRIVER', 'ADMIN', 'SUPPORT', 'SUPER_ADMIN'] as const
export type AppRole = (typeof APP_ROLES)[number]

export function isStaffRole(role: AppRole) {
  return role === 'ADMIN' || role === 'SUPPORT' || role === 'SUPER_ADMIN'
}

export function canAccessAdmin(role: AppRole) {
  return isStaffRole(role)
}
