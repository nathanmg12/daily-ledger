import "./globals.css";
import ShareTemplateWrapper from "@/components/ShareTemplateWrapper";

export const metadata = {
  title: "The Daily Ledger",
  description: "Your calm corner of the internet. A finite daily reading app with no algorithm, no ads, and no opinions.",
  metadataBase: new URL("https://thedailyledger.app"),
  openGraph: {
    title: "The Daily Ledger",
    description: "Your calm corner of the internet.",
    url: "https://thedailyledger.app",
    siteName: "The Daily Ledger",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Daily Ledger",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Daily Ledger",
    description: "Your calm corner of the internet.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ShareTemplateWrapper />
        {children}
      </body>
    </html>
  );
}