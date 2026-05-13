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
          {session.role === 'student' ? 'Gerer mon profil et mon portfolio' : 'Gerer mon espace client'}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          {session.role === 'student'
            ? 'Retrouvez ici le point d entree pour modifier votre presentation publique, votre portfolio et votre disponibilite.'
            : 'Cette page servira de base front pour presenter et faire evoluer votre espace entreprise ou particulier.'}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {session.role === 'student' ? 'Profil public' : 'Espace compte'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {session.role === 'student'
              ? 'Accedez a l edition de votre profil et de votre portfolio pour mettre a jour votre carte visible dans le listing.'
              : 'Le parcours front est pret pour accueillir vos futures informations de structure, de contact et de presentation.'}
          </p>

          {session.role === 'student' ? (
            <Link
              to="/profiles/create"
              className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Modifier mon profil / portfolio
            </Link>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Zone de personnalisation client a brancher ensuite.
            </div>
          )}
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Retour rapide</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Revenez au listing public a tout moment pour continuer l exploration des profils.
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
