export const profileAvailabilities = [
  'Disponible immediatement',
  'Disponible sous 48h',
  'Disponible cette semaine',
  'Soirs et week-ends',
  'A distance uniquement',
  'Missions courtes',
  'A partir de la semaine prochaine',
  'Indisponible pour le moment',
] as const

export type ProfileAvailability = (typeof profileAvailabilities)[number]

export function normaliseProfileAvailability(availability: string) {
  const trimmedAvailability = availability.trim()

  if (profileAvailabilities.includes(trimmedAvailability as ProfileAvailability)) {
    return trimmedAvailability
  }

  const lowerAvailability = trimmedAvailability.toLowerCase()

  if (lowerAvailability.includes('48h')) {
    return 'Disponible sous 48h'
  }

  if (lowerAvailability.includes('soir') || lowerAvailability.includes('week-end')) {
    return 'Soirs et week-ends'
  }

  if (lowerAvailability.includes('distance')) {
    return 'A distance uniquement'
  }

  if (lowerAvailability.includes('1 a 3') || lowerAvailability.includes('1 a3')) {
    return 'Missions courtes'
  }

  if (lowerAvailability.includes('lundi prochain') || lowerAvailability.includes('semaine prochaine')) {
    return 'A partir de la semaine prochaine'
  }

  if (lowerAvailability.includes('cette semaine')) {
    return 'Disponible cette semaine'
  }

  if (lowerAvailability.includes('indisponible')) {
    return 'Indisponible pour le moment'
  }

  return ''
}

export function normaliseProfileAvailabilities(availability: unknown) {
  const rawAvailabilities = Array.isArray(availability)
    ? availability.filter((value): value is string => typeof value === 'string')
    : typeof availability === 'string'
      ? [availability]
      : []

  return Array.from(
    new Set(
      rawAvailabilities
        .map((value) => normaliseProfileAvailability(value))
        .filter((value): value is ProfileAvailability => Boolean(value))
    )
  )
}
