import { getProfileDomainOption } from '@/data/profileDomains'

interface ProfileDomainBadgeProps {
  domain: string
  className?: string
}

export default function ProfileDomainBadge({ domain, className = '' }: ProfileDomainBadgeProps) {
  const domainOption = getProfileDomainOption(domain)

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${domainOption.badgeClassName} ${className}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${domainOption.swatchClassName}`} aria-hidden="true" />
      {domain}
    </span>
  )
}
