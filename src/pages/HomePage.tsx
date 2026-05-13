import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import type { UserRole } from '@/types/auth'

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
      'Accedez rapidement a un vivier de talents creatifs pour des besoins ponctuels, concrets et accessibles.',
    accentClassName: 'from-sky-500 to-slate-950',
    bullets: [
      'Consulter librement les profils et portfolios',
      'Trouver un profil adapte a un besoin simple ou ponctuel',
      'Entrer en contact dans un cadre rassurant et plus lisible',
    ],
  },
  {
    role: 'student',
    title: 'Etudiant creatif',
    description:
      'Creez votre compte, completez votre profil si besoin et rendez votre travail visible sans logique de mise en concurrence opaque.',
    accentClassName: 'from-amber-500 to-rose-500',
    bullets: [
      'Mettre en valeur votre profil creatif',
      'Garder une visibilite plus equitable sur la plateforme',
      'Trouver des missions simples pour enrichir votre parcours',
    ],
  },
]

export default function HomePage() {
  const openAuthModal = useAuthStore((state) => state.openAuthModal)

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

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Compte MIROST</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Un seul acces pour creer un compte ou se connecter.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              La pop-up vous permet ensuite de choisir votre espace entreprise ou etudiant.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            onClick={() => openAuthModal('client', 'signup')}
          >
            Connexion / inscription
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Acces libre aux profils</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Vous pouvez deja parcourir le listing sans vous connecter.
            </h2>
          </div>

          <Link
            to="/listing"
            className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Explorer le listing
          </Link>
        </div>
      </section>
    </main>
  )
}
