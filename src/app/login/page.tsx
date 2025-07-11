"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSupabase } from "@/components/SessionProvider"; // Import useSupabase hook
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
  const { supabase } = useSupabase();

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Masuk ke akun Anda untuk mengakses fitur jurnal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            view="sign_in"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(var(--primary))",
                    brandAccent: "hsl(var(--primary-hover))",
                    inputBackground: "hsl(var(--background))",
                    inputBorder: "hsl(var(--border))",
                    inputBorderHover: "hsl(var(--ring))",
                    inputBorderFocus: "hsl(var(--ring))",
                    inputText: "hsl(var(--foreground))",
                  },
                },
              },
            }}
            theme="light"
            redirectTo={
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000"
            }
            onlyThirdPartyProviders={false}
            magicLink={false}
            showLinks={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
