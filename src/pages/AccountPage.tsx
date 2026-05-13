import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

export default function AccountPage() {
  const session = useAuthStore((state) => state.session)
  const status = useAuthStore((state) => state.status)

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-800 to-amber-500 p-8 text-white shadow-xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-100">Mon espace</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {session.role === 'student' ? 'Gérer mon profil' : 'Gérer mon espace entreprise'}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          {session.role === 'student'
            ? 'Retrouvez ici le point d’entrée pour modifier votre présentation publique, vos créations et vos disponibilités.'
            : 'Retrouvez votre espace entreprise et revenez rapidement aux profils qui vous intéressent.'}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {session.role === 'student' ? 'Profil public' : 'Espace compte'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {session.role === 'student'
              ? 'Accédez à l’édition de votre profil pour mettre à jour votre carte visible dans le listing.'
              : 'Votre compte permet de contacter les étudiants et de préremplir vos demandes de mise en relation.'}
          </p>

          {session.role === 'student' ? (
            <Link
              to="/profiles/create"
              className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Modifier mon profil
            </Link>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Vos informations de contact sont utilisées pour simplifier les demandes envoyées aux étudiants.
            </div>
          )}
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Retour rapide</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Revenez au listing public à tout moment pour continuer l’exploration des profils.
          </p>
          <Link
            to="/listing"
            className="mt-8 inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Retour au listing
          </Link>
        </article>
      </section>
    </main>
  )
}
