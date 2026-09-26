import { Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const Hero = () => {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] w-full overflow-hidden bg-ink text-ivory">
      <Image
        src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=2000&q=80"
        alt="Colección de frascos de perfume iluminados sobre una mesa"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
      <div className="relative z-10 content-container flex min-h-[calc(100svh-4rem)] flex-col justify-end pb-16 pt-24 small:justify-center small:pb-0">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold-bright">
          Buy&Get · Perfumería
        </p>
        <h1 className="max-w-3xl font-display text-5xl leading-tight text-ivory small:text-7xl">
          Encuentra tu fragancia
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-ivory/90 small:text-lg">
          Perfumes para él, para ella y para los más pequeños
        </p>
        <LocalizedClientLink href="/store" className="mt-10 w-fit">
          <Button className="h-12 border border-gold-bright bg-transparent px-8 text-ivory hover:bg-gold-bright hover:text-ink">
            Comprar ahora
          </Button>
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default Hero
