import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@modules/common/components/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "id,handle,title",
  })
  const productCategories = await listCategories()

  return (
    <footer className="w-full border-t border-gold/30 bg-ink text-ivory">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-10 xsmall:flex-row items-start justify-between py-16 small:py-24">
          <div className="max-w-xs">
            <LocalizedClientLink
              href="/"
              className="font-display text-3xl text-ivory hover:text-gold-bright"
            >
              Buy&Get
            </LocalizedClientLink>
            <p className="mt-4 text-sm leading-6 text-ivory/75">
              Perfumería de autor. Fragancias para él, para ella y para los
              más pequeños.
            </p>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-gold-bright">
                  Categorías
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li className="flex flex-col gap-2 text-ivory/75 txt-small" key={c.id}>
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-gold-bright",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className="hover:text-gold-bright"
                                  href={`/categories/${child.handle}`}
                                  data-testid="category-link"
                                >
                                  {child.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-gold-bright">
                  Colecciones
                </span>
                <ul className="grid grid-cols-1 gap-2 text-ivory/75 txt-small">
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-gold-bright"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-gold-bright">
                La casa
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-ivory/75 txt-small">
                <li>
                  <LocalizedClientLink className="hover:text-gold-bright" href="/store">
                    Tienda
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-gold-bright" href="/account">
                    Cuenta
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-gold-bright" href="/cart">
                    Carrito
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-10 justify-between text-ivory/60">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Buy&Get. Todos los derechos reservados.
          </Text>
        </div>
      </div>
    </footer>
  )
}
