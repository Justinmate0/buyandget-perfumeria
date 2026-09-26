import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import FragranceLines from "@modules/home/components/fragrance-lines"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: {
    absolute: "Buy&Get | Perfumería",
  },
  description:
    "Encuentra tu fragancia. Perfumes para él, para ella y para los más pequeños.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  const destacados = collections?.find(
    (collection) => collection.handle === "destacados"
  )

  if (!region) {
    return null
  }

  return (
    <>
      <Hero />
      <FragranceLines />
      {destacados && (
        <FeaturedProducts collections={[destacados]} region={region} />
      )}
    </>
  )
}
