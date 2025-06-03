import type { Metadata } from "next";
import { Inter, Poppins, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PerfilUAM",
  description: "Estuadiantes de la UAM, ¡conectemos!",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#ffffff",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-mx" className="scroll-smooth bg-white text-gray-900">
      <head>
        {/* Meta tags for responsive design and favicon */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${montserrat.variable} antialiased min-h-screen flex flex-col bg-white text-gray-900`}
      >
        <main className="flex-1 flex flex-col">{children}</main>
        {/* Optionally, add a modern footer here */}
      </body>
    </html>
  );
}
