import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      setIsAdmin(null);
      setError(null);

      const { data, error } = await supabase.rpc("is_admin");

      if (error) {
        setError(error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data);
    };

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    isAdmin: isAdmin === true,
    loading: isAdmin === null,
    error: error
  }
}