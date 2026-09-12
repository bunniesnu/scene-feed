import { supabase } from "@/lib/supabase"

export function useLogout() {
  return async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }
}