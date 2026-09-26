import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

const links = [
  { name: "Tienda", href: "/store" },
  { name: "Hombre", href: "/categories/hombre" },
  { name: "Mujer", href: "/categories/mujer" },
  { name: "Niños", href: "/categories/ninos" },
]

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b border-gold/40 bg-ink text-ivory">
        <nav className="content-container flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="font-display text-2xl tracking-wide text-ivory hover:text-gold-bright"
              data-testid="nav-store-link"
            >
              Buy&Get
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              {links.map((link) => (
                <LocalizedClientLink
                  key={link.href}
                  className="uppercase tracking-[0.16em] text-[11px] text-ivory/80 hover:text-gold-bright"
                  href={link.href}
                >
                  {link.name}
                </LocalizedClientLink>
              ))}
              <LocalizedClientLink
                className="uppercase tracking-[0.16em] text-[11px] text-ivory/80 hover:text-gold-bright"
                href="/account"
                data-testid="nav-account-link"
              >
                Cuenta
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-gold-bright flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Carrito (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
