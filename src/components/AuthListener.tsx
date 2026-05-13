import { useEffect } from "react"
import { subscribeToAuthChanges } from "@/services/authService"
import { useAuthStore } from "@/stores/useAuthStore"

export default function AuthListener() {
  const setSession = useAuthStore((state) => state.setSession)
  const setStatus = useAuthStore((state) => state.setStatus)

  useEffect(() => {
    setStatus("loading")
    const unsubscribe = subscribeToAuthChanges((session) => {
      setSession(session)
    })

    return unsubscribe
  }, [setSession, setStatus])

  return null
}
