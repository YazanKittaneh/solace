import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
// import PerformanceProvider from "@/components/PerformanceProvider";
// import DevelopmentTools from "@/components/DevelopmentTools";

// Font optimization with preload and display swap
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-roboto-mono",
});

// Enhanced metadata with SEO optimization
export const metadata: Metadata = {
  title: {
    default: "Solace Healthcare Advocates",
    template: "%s | Solace Healthcare Advocates",
  },
  description: "Find and connect with qualified healthcare advocates. Browse our comprehensive directory of medical professionals specializing in various healthcare services.",
  keywords: [
    "healthcare advocates",
    "medical professionals",
    "healthcare directory",
    "medical specialties",
    "patient advocacy",
    "healthcare services",
  ],
  authors: [
    {
      name: "Solace Healthcare",
      url: "https://solace.health",
    },
  ],
  creator: "Solace Healthcare",
  publisher: "Solace Healthcare",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Solace Healthcare Advocates",
    description: "Find and connect with qualified healthcare advocates",
    siteName: "Solace Healthcare Advocates",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Solace Healthcare Advocates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solace Healthcare Advocates",
    description: "Find and connect with qualified healthcare advocates",
    images: ["/og-image.png"],
    creator: "@solacehealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  }),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Prefetch DNS for potential external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Security headers via meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance hints */}
        <meta name="color-scheme" content="light dark" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Safari specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Solace" />
        
        {/* Microsoft specific */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body 
        className={`
          ${inter.className} 
          min-h-screen 
          bg-gray-50 
          text-gray-900 
          antialiased
          selection:bg-primary-100 
          selection:text-primary-900
          focus-within:scroll-smooth
        `}
        suppressHydrationWarning
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 font-medium"
        >
          Skip to main content
        </a>

        {/* <PerformanceProvider> */}
          <ErrorBoundary>
            <div className="flex min-h-screen flex-col">
              {/* Header with navigation */}
              <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <Navigation />
              </header>

              {/* Main content area */}
              <main 
                id="main-content"
                className="flex-1 focus:outline-none"
                tabIndex={-1}
              >
                {children}
              </main>

              {/* Footer */}
              <footer className="border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        About Solace
                      </h3>
                      <p className="mt-4 text-sm text-gray-600">
                        Connecting patients with qualified healthcare advocates to ensure the best possible care and support.
                      </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Quick Links
                      </h3>
                      <ul className="mt-4 space-y-2">
                        <li>
                          <a 
                            href="/" 
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            Find Advocates
                          </a>
                        </li>
                        <li>
                          <a 
                            href="/api/advocates" 
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            API Documentation
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Contact */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Support
                      </h3>
                      <p className="mt-4 text-sm text-gray-600">
                        Need help? Contact our support team for assistance.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <p className="text-sm text-gray-500 text-center">
                      © {new Date().getFullYear()} Solace Healthcare Advocates. Built with Next.js and modern web technologies.
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </ErrorBoundary>
        {/* </PerformanceProvider> */}

        {/* Development tools */}
        {/* <DevelopmentTools /> */}
      </body>
    </html>
  );
}
