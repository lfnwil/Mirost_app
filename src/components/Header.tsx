import { FiInbox } from 'react-icons/fi'
import { IoMdNotificationsOutline } from 'react-icons/io'

export default function Header() {
  return (
    <header className="bg-gray-100 py-0 shadow flex items-center justify-between">
      {/* LEFT: Logo + Search */}
      <div>

      </div>
      <div className="flex items-center gap-6 w-50 cursor-pointer bg-gray-100 rounded p-1">
        <img src="./img/Capture d'écran 2026-01-28 155757.png" alt="" />
      </div>

      {/* RIGHT: Buttons + Icons */}
      <div className="flex items-center gap-4 pr-4">
        <button className="bg-purple-600 text-white px-4 py-2 text-sm rounded hover:bg-purple-700 transition">
          Créer mon profil
        </button>
        <img src="https://i.pravatar.cc/30" alt="avatar" className="w-8 h-8 rounded-full object-cover  "/>
      </div>
    </header>
  )
}
