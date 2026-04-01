import { onAuthStateChanged } from "firebase/auth"
import { useEffect } from "react"
import { auth } from "@/firebase/auth"
import { useAuthStore } from "@/stores/useAuthStore"

export const AuthListener = () => {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [setUser])

  return null
}
