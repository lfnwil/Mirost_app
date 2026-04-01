import Header from './components/Header'
import Profil from './components/Profil'

function App() {
  return (
    <div>
      <Header />

      <main className="flex-col">
        <div className="w-full inline-flex gap-5 p-5">
          <Profil />
          <Profil />
          <Profil />
          <Profil />
        </div>
        <div className="w-full inline-flex gap-5 p-5">
          <Profil />
          <Profil />
          <Profil />
          <Profil />
        </div>
        <div className="w-full inline-flex gap-5 p-5">
          <Profil />
          <Profil />
          <Profil />
          <Profil />
        </div>
        <div className="w-full inline-flex gap-5 p-5">
          <Profil />
          <Profil />
          <Profil />
          <Profil />
        </div>
        <div className="w-full inline-flex gap-5 p-5">
          <Profil />
          <Profil />
          <Profil />
          <Profil />
        </div>
      </main>
    </div>
  )
}

export default App