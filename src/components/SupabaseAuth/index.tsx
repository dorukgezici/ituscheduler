import { supabase } from "@/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect } from "react";

export default function SupabaseAuth({ site }: { site?: URL }) {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event == "SIGNED_IN") location.reload();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme="dark"
      socialLayout="horizontal"
      providers={["twitter", "github"]}
      onlyThirdPartyProviders
      redirectTo={site && `${site.href}/login`}
    />
  );
}
