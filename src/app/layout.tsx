import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import { CasesProvider } from "@/lib/cases-context";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Maak · Gestión de clientes",
  description: "Prototipo Maak — onboarding de personas, revisión y reglas",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${openSans.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <CasesProvider>{children}</CasesProvider>
      </body>
    </html>
  );
}
