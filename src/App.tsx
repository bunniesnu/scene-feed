import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

function App() {
  useEffect(() => {
    async function testSupabase() {
      const { data, error } = await supabase
        .from("archive_items")
        .select("*");

      console.log({ data, error });
    }

    testSupabase();
  }, []);

  return <h1>Supabase test</h1>;
}

export default App;