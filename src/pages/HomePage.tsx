import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import type { UserRole } from '@/types/auth'
import { getRoleAccentTheme } from '@/utils/roleTheme'

interface RoleCard {
  role: UserRole
  title: string
  description: string
  accentClassName: string
  bullets: string[]
}

const roleCards: RoleCard[] = [
  {
    role: 'client',
    title: 'Entreprise / Particulier',
    description:
      'Accédez rapidement à des profils étudiants créatifs pour des besoins concrets, ponctuels et accessibles.',
    accentClassName: 'from-sky-500 to-slate-950',
    bullets: [
      'Consulter les profils, portfolios et pièces jointes',
      'Filtrer par formation, compétences et disponibilités',
      'Contacter un talent dans un cadre clair et structuré',
    ],
  },
  {
    role: 'student',
    title: 'Étudiant créatif',
    description:
      'Créez votre compte, présentez votre univers et rendez vos créations visibles auprès de structures en recherche de talents.',
    accentClassName: 'from-amber-500 to-rose-500',
    bullets: [
      'Mettre en valeur votre formation et vos compétences',
      'Ajouter jusqu’à trois créations ou références',
      'Recevoir des demandes de contact qualifiées',
    ],
  },
]

export default function HomePage() {
  const openAuthModal = useAuthStore((state) => state.openAuthModal)
  const guestAccentTheme = getRoleAccentTheme('guest')

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-2">
        {roleCards.map((card) => (
          <article
            key={card.role}
            className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className={`h-3 rounded-full bg-gradient-to-r ${card.accentClassName}`} />
            <div className="mt-6 flex-1 space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </div>

              <ul className="space-y-3 text-sm text-slate-700">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-slate-900" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

          </article>
        ))}
      </section>

      <section className={`rounded-[2rem] border p-6 shadow-sm ${guestAccentTheme.panel}`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Compte MIROST</p>
            <h2 className={`mt-2 text-2xl font-semibold tracking-tight ${guestAccentTheme.panelTitle}`}>
              Un seul accès pour créer un compte ou se connecter.
            </h2>
            <p className={`mt-2 text-sm leading-6 ${guestAccentTheme.panelText}`}>
              Choisissez ensuite l’espace étudiant ou entreprise directement depuis la fenêtre de connexion.
            </p>
          </div>

          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${guestAccentTheme.button}`}
            onClick={() => openAuthModal('client', 'signup')}
          >
            Connexion / inscription
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Accès libre aux profils</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Parcourez déjà le listing sans vous connecter.
            </h2>
          </div>

          <Link
            to="/listing"
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${guestAccentTheme.button}`}
          >
            Explorer le listing
          </Link>
        </div>
      </section>
    </main>
  )
}
