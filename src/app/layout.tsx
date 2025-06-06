import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BootstrapClient from '@/components/BootstrapClient';
import SupabaseProviderLib from "@/lib/supabase-provider";
import PageProtector from "@/components/PageProtector";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pre-Planta FHyCS",
  description: "Plataforma para gestión de pre-planta",
};

// Componente para el cliente (necesario para UserProvider)
const SupabaseProviderLocal = ({ children }: { children: React.ReactNode }) => {
  return (
    <SupabaseProviderLib>
      {children}
    </SupabaseProviderLib>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Envuelve children con SupabaseProvider */}
        <SupabaseProviderLocal>
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 5000,
            }}
          />
          <PageProtector/>
          {children}
          <BootstrapClient />
        </SupabaseProviderLocal>
      </body>
    </html>
  );
}