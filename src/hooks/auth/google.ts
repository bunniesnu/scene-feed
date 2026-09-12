import { useState } from "react"
import { supabase } from "@/lib/supabase"

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setLoading(false)
      throw error
    }
  }

  return {
    login,
    loading,
  }
}