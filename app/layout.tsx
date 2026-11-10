import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'FlyerSpot - AI Interactive Flyer & Deal Comparison',
  description: 'Convert static retail flyer images into interactive hotspot zones with instant product comparisons, deal ratings, and smart shopping tools.',
  openGraph: {
    title: 'FlyerSpot - AI Interactive Flyer & Deal Comparison',
    description: 'Convert static retail flyer images into interactive hotspot zones with instant product comparisons, deal ratings, and smart shopping tools.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlyerSpot - AI Interactive Flyer & Deal Comparison',
    description: 'Convert static retail flyer images into interactive hotspot zones with instant product comparisons, deal ratings, and smart shopping tools.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased font-sans selection:bg-emerald-500/30 selection:text-emerald-300" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
