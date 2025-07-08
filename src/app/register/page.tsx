"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabase } from "@/components/SessionProvider"; // Import useSupabase hook
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const { supabase } = useSupabase();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Daftar Akun Baru</CardTitle>
            <CardDescription>Buat akun untuk mulai mengirimkan artikel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              providers={[]} // Anda bisa menambahkan 'google', 'github', dll. di sini
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary-foreground))',
                      inputBackground: 'hsl(var(--background))',
                      inputBorder: 'hsl(var(--border))',
                      inputBorderHover: 'hsl(var(--ring))',
                      inputBorderFocus: 'hsl(var(--ring))',
                      inputText: 'hsl(var(--foreground))',
                    },
                  },
                },
              }}
              theme="light" // Sesuaikan dengan tema aplikasi Anda
              redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/`} // Redirect ke root setelah registrasi
              view="sign_up" // Ini yang akan memastikan tampilan pendaftaran
            />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}