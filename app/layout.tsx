import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SkyTech - Arduino, Electronics, Robotics & IoT Solutions",
    template: "%s | SkyTech"
  },
  description: "Your one-stop shop for Arduino boards, sensors, IoT modules, robotics components, and professional tech services. Quality electronics with expert support.",
  keywords: ["Arduino", "Electronics", "Robotics", "IoT", "Sensors", "Microcontrollers", "Tech Services", "DIY Electronics", "STEM Education", "Smart Home"],
  authors: [{ name: "SkyTech" }],
  creator: "SkyTech",
  publisher: "SkyTech",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://theskytechnology.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://theskytechnology.in',
    siteName: 'SkyTech',
    title: 'SkyTech - Arduino, Electronics, Robotics & IoT Solutions',
    description: 'Your one-stop shop for Arduino boards, sensors, IoT modules, robotics components, and professional tech services. Quality electronics with expert support.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SkyTech - Electronics & Robotics Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkyTech - Arduino, Electronics, Robotics & IoT Solutions',
    description: 'Your one-stop shop for Arduino boards, sensors, IoT modules, robotics components, and professional tech services.',
    images: ['/twitter-image.jpg'],
    creator: '@skytech',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SkyTech",
              "url": "https://theskytechnology.in",
              "logo": "https://theskytechnology.in/logo.png",
              "description": "Your one-stop shop for Arduino boards, sensors, IoT modules, robotics components, and professional tech services.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://theskytechnology.in"
              },
              "sameAs": [
                "https://www.facebook.com/skytech",
                "https://twitter.com/skytech",
                "https://www.instagram.com/skytech",
                "https://www.linkedin.com/company/skytech"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
