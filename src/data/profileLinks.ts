export const profileLinkOptions = [
  {
    type: 'portfolio',
    label: 'Portfolio',
    placeholder: 'https://mon-portfolio.fr',
  },
  {
    type: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/moncompte',
  },
  {
    type: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/monprofil',
  },
  {
    type: 'behance',
    label: 'Behance',
    placeholder: 'https://behance.net/monprofil',
  },
  {
    type: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/monprofil',
  },
  {
    type: 'youtube',
    label: 'YouTube / Vimeo',
    placeholder: 'https://youtube.com/@machaine',
  },
  {
    type: 'soundcloud',
    label: 'SoundCloud',
    placeholder: 'https://soundcloud.com/monprofil',
  },
] as const

export type ProfileLinkType = (typeof profileLinkOptions)[number]['type']

export function getProfileLinkOption(type: string) {
  return profileLinkOptions.find((option) => option.type === type)
}
