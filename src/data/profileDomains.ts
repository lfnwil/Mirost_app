export interface ProfileDomainOption {
  label: string
  colorName: string
  swatchClassName: string
  badgeClassName: string
  selectedClassName: string
  optionClassName: string
  tags: string[]
}

export const profileDomainOptions = [
  {
    label: 'Marketing & Communication digitale',
    colorName: 'Fuchsia',
    swatchClassName: 'bg-fuchsia-500',
    badgeClassName: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800',
    selectedClassName: 'border-fuchsia-500 bg-fuchsia-600 text-white',
    optionClassName: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900 hover:border-fuchsia-300',
    tags: [
      'Social media',
      'Storytelling',
      'Community management',
      'Campagne digitale',
      'Contenu court',
      'Strategie digitale',
      'Brand content',
    ],
  },
  {
    label: 'Création & Digital Design',
    colorName: 'Emeraude',
    swatchClassName: 'bg-emerald-500',
    badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    selectedClassName: 'border-emerald-500 bg-emerald-600 text-white',
    optionClassName: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300',
    tags: [
      'Design',
      'Branding',
      'Identite visuelle',
      'UI/UX',
      'Prototype',
      'Illustration',
      'Photo',
      'Retouche',
      'Edition',
      'Affiche',
    ],
  },
  {
    label: 'AudioVisuel',
    colorName: 'Ciel',
    swatchClassName: 'bg-sky-500',
    badgeClassName: 'border-sky-200 bg-sky-50 text-sky-800',
    selectedClassName: 'border-sky-500 bg-sky-600 text-white',
    optionClassName: 'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300',
    tags: ['Video', 'Cadrage video', 'Montage', 'Captation', 'Audiovisuel', 'Motion', 'Animation', 'Storyboard', 'Reels'],
  },
  {
    label: 'Son & Musique',
    colorName: 'Ambre',
    swatchClassName: 'bg-amber-500',
    badgeClassName: 'border-amber-200 bg-amber-50 text-amber-800',
    selectedClassName: 'border-amber-500 bg-amber-500 text-white',
    optionClassName: 'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300',
    tags: ['Son', 'Musique', 'Sound design', 'Podcast', 'Mixage', 'Voix off', 'Composition', 'Habillage sonore'],
  },
] as const satisfies readonly ProfileDomainOption[]

export const profileDomains = profileDomainOptions.map((domain) => domain.label)

export type ProfileDomain = (typeof profileDomains)[number]

function normaliseDomainSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function normaliseProfileDomain(domain: string) {
  const trimmedDomain = domain.trim()

  if ((profileDomains as readonly string[]).includes(trimmedDomain)) {
    return trimmedDomain
  }

  const normalisedDomain = normaliseDomainSearchValue(trimmedDomain)

  if (
    normalisedDomain.includes('marketing') ||
    normalisedDomain.includes('communication') ||
    normalisedDomain.includes('social')
  ) {
    return 'Marketing & Communication digitale'
  }

  if (
    normalisedDomain.includes('son') ||
    normalisedDomain.includes('musique') ||
    normalisedDomain.includes('sound') ||
    normalisedDomain.includes('podcast') ||
    normalisedDomain.includes('mixage')
  ) {
    return 'Son & Musique'
  }

  if (
    normalisedDomain.includes('video') ||
    normalisedDomain.includes('audiovisuel') ||
    normalisedDomain.includes('motion') ||
    normalisedDomain.includes('montage') ||
    normalisedDomain.includes('captation')
  ) {
    return 'AudioVisuel'
  }

  if (
    normalisedDomain.includes('creation') ||
    normalisedDomain.includes('digital design') ||
    normalisedDomain.includes('design') ||
    normalisedDomain.includes('branding') ||
    normalisedDomain.includes('photo') ||
    normalisedDomain.includes('illustration') ||
    normalisedDomain.includes('dessin') ||
    normalisedDomain.includes('ui') ||
    normalisedDomain.includes('ux')
  ) {
    return 'Création & Digital Design'
  }

  return ''
}

export function getProfileDomainOption(domain: string): ProfileDomainOption {
  return (
    profileDomainOptions.find((option) => option.label === domain || option.label === normaliseProfileDomain(domain)) ?? {
      label: domain,
      colorName: 'Ardoise',
      swatchClassName: 'bg-slate-500',
      badgeClassName: 'border-slate-200 bg-slate-50 text-slate-700',
      selectedClassName: 'border-slate-950 bg-slate-950 text-white',
      optionClassName: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
      tags: [],
    }
  )
}

export function getProfileDomainTags(domain: string) {
  return getProfileDomainOption(domain).tags
}
