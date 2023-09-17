import { clientComponentClient } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function SupabaseAuth({ site }: { site?: URL }) {
  const supabase = clientComponentClient();

  supabase.auth.onAuthStateChange((event, session) => {
    if (event == "SIGNED_IN") location.reload();
  });

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={["facebook"]}
      onlyThirdPartyProviders
      redirectTo={site && `${site}/login`}
    />
  );
}
