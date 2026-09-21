import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Marcellus, Newsreader, Noto_Serif_Sinhala } from "next/font/google";
import "./globals.css";

// Inscriptional capitals for titles: flared, carved, cinematic.
const display = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
// Editorial serif for the narration.
const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
// Plain modern sans for interface and data.
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// The site's own name, in its own script.
const sinhala = Noto_Serif_Sinhala({ weight: ["400"], subsets: ["sinhala"], variable: "--font-sinhala", display: "swap" });

const description =
  "Experience Sigiriya, Sri Lanka's ancient Lion Rock, through an immersive cinematic journey from the royal city of King Kashyapa to the UNESCO World Heritage Site we see today.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Sigiriya — Journey Through Time",
  description,
  keywords: ["Sigiriya", "Lion Rock", "Sinhagiri", "Kashyapa", "Sri Lanka", "UNESCO World Heritage", "Cultural Triangle"],
  openGraph: {
    title: "Sigiriya — Journey Through Time",
    description,
    type: "website",
    locale: "en",
    siteName: "Sigiriya — Journey Through Time",
  },
  twitter: { card: "summary_large_image", title: "Sigiriya — Journey Through Time", description },
};

export const viewport: Viewport = {
  themeColor: "#120e0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable} ${sinhala.variable}`}>
      <body>{children}</body>
    </html>
  );
}
