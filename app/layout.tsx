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
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
