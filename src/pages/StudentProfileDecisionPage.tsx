import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

export default function StudentProfileDecisionPage() {
  const session = useAuthStore((state) => state.session)
  const status = useAuthStore((state) => state.status)
  const navigate = useNavigate()

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (session.role !== 'student') {
    return <Navigate to="/listing" replace />
  }

  if (session.hasStudentProfile) {
    return <Navigate to="/listing" replace />
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-800 to-sky-600 p-8 text-white shadow-xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-100">Etape suivante</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Votre compte etudiant est actif.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          Nous n avons pas encore trouve de profil public rattache a votre compte. Souhaitez-vous le creer maintenant
          pour apparaitre dans le listing MIROST ?
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Oui, je cree mon profil</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Vous completez votre presentation, vos disciplines creatives, votre disponibilite et votre localisation.
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            onClick={() => navigate('/profiles/create')}
          >
            Commencer la creation
          </button>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Non, plus tard</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Vous serez redirige vers le listing. Vous pourrez revenir plus tard pour finaliser votre profil depuis
            l entete ou le bandeau de rappel.
          </p>
          <button
            type="button"
            className="mt-8 rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => navigate('/listing')}
          >
            Aller au listing
          </button>
        </article>
      </section>
    </main>
  )
}
