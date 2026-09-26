import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"
import Image from "next/image"

const lines = [
  {
    title: "Hombre",
    handle: "hombre",
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80",
    alt: "Frasco oscuro de perfume para hombre sobre una mesa clara",
    note: "Maderas, especias y frescura",
  },
  {
    title: "Mujer",
    handle: "mujer",
    image:
      "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=1200&q=80",
    alt: "Mano sosteniendo un frasco de perfume floral",
    note: "Flores, vainilla y noche",
  },
  {
    title: "Niños",
    handle: "ninos",
    image:
      "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=1200&q=80",
    alt: "Frascos de perfume en tonos rosa y azul sobre tela suave",
    note: "Aromas suaves y alegres",
  },
]

const FragranceLines = () => {
  return (
    <section className="content-container py-16 small:py-24">
      <Reveal>
        <div className="mb-10 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            Tres líneas
          </p>
          <h2 className="font-display text-4xl text-ink small:text-5xl">
            Elige tu universo
          </h2>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 gap-6 medium:grid-cols-3">
        {lines.map((line, index) => (
          <Reveal key={line.handle} delay={index * 90}>
            <LocalizedClientLink
              href={`/categories/${line.handle}`}
              className="group relative block min-h-[420px] overflow-hidden bg-ink"
            >
              <Image
                src={line.image}
                alt={line.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-ivory">
                <p className="text-xs uppercase tracking-[0.28em] text-gold-bright">
                  {line.note}
                </p>
                <h3 className="mt-3 font-display text-4xl">{line.title}</h3>
              </div>
            </LocalizedClientLink>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default FragranceLines
