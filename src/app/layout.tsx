import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Medical IA - Sistema de Consultas Médicas IA",
  description: "Sistema revolucionario de análisis médico en tiempo real con transcripción inteligente, diarización de hablantes y análisis de IA para generar diagnósticos, recomendaciones y informes médicos completos con códigos CIE-10.",
  keywords: "medicina, IA, transcripción, diagnóstico, análisis médico, tiempo real, WebRTC, Deepgram, OpenAI",
  authors: [{ name: "Medical IA Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Medical IA - Sistema de Consultas Médicas IA",
    description: "Sistema revolucionario de análisis médico en tiempo real",
    type: "website",
    locale: "es_ES",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Medical IA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div style={{ 
            minHeight: '100vh',
            background: '#f8fafc'
          }}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}