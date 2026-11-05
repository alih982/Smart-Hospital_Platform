import type { Metadata } from "next";
import "../globals.css";
import { ChatOverlay } from "@/components/chat/ChatOverlay";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/layout/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, localeConfig, isRTL, type Locale } from "@/i18n/request";

export const metadata: Metadata = {
  title: "DoctorHub - Smart Healthcare Platform",
  description: "AI-powered medical assistant and online booking system",
  keywords: ["healthcare", "medical", "doctor", "hospital", "appointment", "AI doctor"],
  authors: [{ name: "DoctorHub Team" }],
  openGraph: {
    title: "DoctorHub - Smart Healthcare Platform",
    description: "AI-powered medical assistant and online booking system",
    type: "website",
  }
};

import StyledJsxRegistry from "../StyledJsxRegistry";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  const isRTLLayout = isRTL(locale);
  const localeInfo = localeConfig[locale as Locale] || localeConfig.en;

  return (
    <html lang={locale} dir={isRTLLayout ? "rtl" : "ltr"}>
      <head>
        {/* Preconnect to Google Fonts for better performance */}
        <link rel="preconnect" href="http://fonts.googleapis.com" />
        <link rel="preconnect" href="http://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="http://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`antialiased ${isRTLLayout ? 'font-persian' : 'font-inter'}`}
        suppressHydrationWarning={true}
      >
        <NextIntlClientProvider messages={messages}>
          <StyledJsxRegistry>
            <Navbar />
            <main className="min-h-screen pt-16 lg:pt-20">
              {children}
            </main>
            <ChatOverlay />
            <Footer />
          </StyledJsxRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

