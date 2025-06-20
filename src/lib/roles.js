// src/lib/roles.js
export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  PHARMACIST: 'pharmacist'
}

export const checkRole = (user, requiredRole) => {
  return user?.role === requiredRole
}