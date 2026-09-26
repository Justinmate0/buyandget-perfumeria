import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <Reveal className="h-full">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="group flex h-full flex-col"
      >
        <div data-testid="product-wrapper" className="flex h-full flex-col">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            alt={product.title ? `Frasco de ${product.title}` : "Frasco de perfume"}
            className="shrink-0"
          />
          <div className="mt-4 flex flex-1 flex-col">
            <Text
              className="line-clamp-2 min-h-14 font-display text-xl leading-7 text-ink"
              data-testid="product-title"
            >
              {product.title}
            </Text>
            <div className="mt-2 flex min-h-6 items-center gap-x-2">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
            <div className="mt-auto pt-4">
              <span className="inline-flex h-10 w-full items-center justify-center bg-ink text-sm font-medium tracking-wide text-ivory">
                Comprar
              </span>
            </div>
          </div>
        </div>
      </LocalizedClientLink>
    </Reveal>
  )
}
