import { clientComponentClient } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
// import { useEffect } from "react";

export default function SupabaseAuth({ site }: { site?: URL }) {
  const supabase = clientComponentClient();

  // useEffect(() => {
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((event, session) => {
  //     if (event == "SIGNED_IN") location.reload();
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme="dark"
      dark
      socialLayout="horizontal"
      providers={["facebook", "twitter"]}
      onlyThirdPartyProviders
      redirectTo={site && `${site}/login`}
    />
  );
}
