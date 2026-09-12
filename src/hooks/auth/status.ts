import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(session !== null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(session !== null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    isLoggedIn: isLoggedIn === true,
    loading: isLoggedIn === null,
  }
}