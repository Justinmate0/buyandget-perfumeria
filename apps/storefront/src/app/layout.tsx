import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Buy&Get | Perfumería",
    template: "%s | Buy&Get",
  },
  description:
    "Buy&Get, perfumería. Fragancias para él, para ella y para los más pequeños.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="es" data-mode="light" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-ivory text-ink antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
