import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
    title: {
        template: '%s | Pune Dating App',
        default: 'Best Dating App in Pune for Meaningful Connections | Meet Pune Singles',
    },
    description: "Join the premier dating app exclusively for singles in Pune, Maharashtra. Meet compatible matching professionals from Hinjewadi to Koregaon Park.",
    openGraph: {
        title: 'Best Dating App in Pune for Singles',
        description: 'Meet compatible singles across Pune. Safe, local, and professional dating community in Maharashtra.',
        url: 'https://punedating.example.com',
        siteName: 'Pune Dating App',
        locale: 'en_IN',
        type: 'website',
    },
    keywords: ['dating app in Pune', 'meet singles in Pune', 'Pune relationship app', 'Maharashtra dating app'],
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Pune Dating App",
    "description": "The best dating app exclusively for singles in Pune, Maharashtra.",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Pune",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
    },
    "areaServed": "Pune, Maharashtra"
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${inter.variable} ${playfair.variable} font-sans bg-background text-foreground`}>
                {children}
            </body>
        </html>
    );
}
