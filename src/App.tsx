import { Navigate, Route, Routes } from 'react-router-dom'
import AuthListener from '@/components/AuthListener'
import Header from '@/components/Header'
import AuthModal from '@/components/auth/AuthModal'
import AccountPage from '@/pages/AccountPage'
import HomePage from '@/pages/HomePage'
import ListingPage from '@/pages/ListingPage'
import StudentProfileCreatePage from '@/pages/StudentProfileCreatePage'
import StudentProfileDecisionPage from '@/pages/StudentProfileDecisionPage'
import { useAuthStore } from '@/stores/useAuthStore'

function App() {
  const status = useAuthStore((state) => state.status)
  const session = useAuthStore((state) => state.session)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AuthListener />
      <Header />
      <Routes>
        <Route path="/" element={session ? <Navigate to="/listing" replace /> : <HomePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/listing" element={<ListingPage />} />
        <Route path="/onboarding/student-profile" element={<StudentProfileDecisionPage />} />
        <Route path="/profiles/create" element={<StudentProfileCreatePage />} />
        <Route path="*" element={<Navigate to={session ? '/listing' : '/'} replace />} />
      </Routes>
      <AuthModal />

      {status === 'loading' && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-30 flex justify-center px-4">
          <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-lg">
            Chargement de votre session...
          </div>
        </div>
      )}
    </div>
  )
}

export default App
