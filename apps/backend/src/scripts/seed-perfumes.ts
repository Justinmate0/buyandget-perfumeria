import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  batchLinkProductsToCategoryWorkflow,
  batchLinkProductsToCollectionWorkflow,
  batchShippingOptionRulesWorkflow,
  createCollectionsWorkflow,
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow,
  createLinksWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createShippingOptionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateProductCategoriesWorkflow,
  updateProductsWorkflow,
  updateRegionsWorkflow,
  updateShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"
import fs from "fs"
import path from "path"

const CLOTHING_HANDLES = ["t-shirt", "sweatshirt", "sweatpants", "shorts"]
const CLOTHING_CATEGORY_HANDLES = ["shirts", "sweatshirts", "pants", "merch"]
const EROS_HANDLE = "eros-flame-versace"
const EROS_DESCRIPTION =
  "Eros Flame de Versace es un Eau de Parfum amaderado y especiado, intenso desde la primera salida. Mandarina, pimienta negra y romero abren la composición; el corazón reúne geranio, pimienta y rosa; el fondo deja vainilla, haba tonka, sándalo y cedro. Frasco de 100 ml."

type FragranceProfile = {
  concentration: string
  size: string
  family: string
  topNotes: string
  heartNotes: string
  baseNotes: string
}

const PROFILES: Record<string, FragranceProfile> = {
  "noir-intense": {
    concentration: "Eau de Parfum",
    size: "50 ml / 100 ml",
    family: "Amaderada especiada",
    topNotes: "Pimienta negra, bergamota",
    heartNotes: "Incienso, lavanda",
    baseNotes: "Vetiver, cuero, ámbar",
  },
  "ocean-wood": {
    concentration: "Eau de Toilette",
    size: "50 ml / 100 ml",
    family: "Acuática amaderada",
    topNotes: "Notas ozónicas, toronja",
    heartNotes: "Salvia, madera flotante",
    baseNotes: "Cedro, almizcle",
  },
  "steel-black": {
    concentration: "Eau de Parfum",
    size: "50 ml / 100 ml",
    family: "Especiada amaderada",
    topNotes: "Pomelo, cardamomo",
    heartNotes: "Geranio, pimienta",
    baseNotes: "Musgo, cuero, sándalo ahumado",
  },
  "cedar-royal": {
    concentration: "Eau de Parfum",
    size: "50 ml / 100 ml",
    family: "Amaderada aromática",
    topNotes: "Bergamota, nuez moscada",
    heartNotes: "Cedro real, iris",
    baseNotes: "Ámbar, tabaco dulce, vainilla",
  },
  "fleur-rose": {
    concentration: "Eau de Parfum",
    size: "50 ml / 100 ml",
    family: "Floral",
    topNotes: "Pera, pimienta rosa",
    heartNotes: "Rosa de mayo, peonía",
    baseNotes: "Almizcle blanco, sándalo",
  },
  "golden-vanilla": {
    concentration: "Eau de Parfum",
    size: "50 ml / 100 ml",
    family: "Oriental vainilla",
    topNotes: "Mandarina, flor de azahar",
    heartNotes: "Jazmín, ylang-ylang",
    baseNotes: "Vainilla dorada, haba tonka, ámbar",
  },
  "nuit-etoilee": {
    concentration: "Eau de Parfum",
    size: "50 ml / 100 ml",
    family: "Floral oriental",
    topNotes: "Bergamota, grosella negra",
    heartNotes: "Violeta, incienso",
    baseNotes: "Pachulí, vainilla, almizcle",
  },
  "peony-silk": {
    concentration: "Eau de Toilette",
    size: "50 ml / 100 ml",
    family: "Floral fresca",
    topNotes: "Lichi, hojas verdes",
    heartNotes: "Peonía, rosa de té",
    baseNotes: "Cedro blanco, algodón, almizcle limpio",
  },
  "baby-cotton": {
    concentration: "Eau de Toilette",
    size: "50 ml / 100 ml",
    family: "Almizclada suave",
    topNotes: "Algodón limpio, pera",
    heartNotes: "Flor de azahar, polvo de arroz",
    baseNotes: "Almizcle blanco, vainilla ligera",
  },
  "sweet-bubble": {
    concentration: "Eau de Toilette",
    size: "50 ml / 100 ml",
    family: "Gourmand frutal",
    topNotes: "Mandarina, chicle dulce",
    heartNotes: "Fresa, flor de cerezo",
    baseNotes: "Vainilla, azúcar, almizcle",
  },
  "little-star": {
    concentration: "Eau de Toilette",
    size: "50 ml / 100 ml",
    family: "Floral frutal",
    topNotes: "Manzana verde, bergamota",
    heartNotes: "Flor de naranjo, heliotropo",
    baseNotes: "Vainilla suave, cedro claro",
  },
  [EROS_HANDLE]: {
    concentration: "Eau de Parfum",
    size: "100 ml",
    family: "Amaderada especiada",
    topNotes: "Mandarina, pimienta negra, romero",
    heartNotes: "Geranio, pimienta, rosa",
    baseNotes: "Vainilla, haba tonka, sándalo, cedro",
  },
}

function fragranceMetadata(handle: string) {
  const profile = PROFILES[handle]
  if (!profile) {
    throw new Error(`Falta la ficha olfativa de ${handle}.`)
  }
  return {
    concentration: profile.concentration,
    size: profile.size,
    family: profile.family,
    top_notes: profile.topNotes,
    heart_notes: profile.heartNotes,
    base_notes: profile.baseNotes,
  }
}
const FEATURED_HANDLES = [
  "noir-intense",
  "ocean-wood",
  "fleur-rose",
  "golden-vanilla",
  "baby-cotton",
  "little-star",
]

const perfumeImage = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`

type PerfumeLine = "hombre" | "mujer" | "ninos"

type PerfumeSeed = {
  title: string
  handle: string
  line: PerfumeLine
  description: string
  image: string
  price50: number
  price100: number
  stock50: number
  stock100: number
}

const PERFUMES: PerfumeSeed[] = [
  {
    title: "Noir Intense",
    handle: "noir-intense",
    line: "hombre",
    description:
      "Una fragancia oscura y magnética. Salida de pimienta negra y bergamota, corazón de incienso y lavanda, fondo de vetiver, cuero y ámbar.",
    image: perfumeImage("1594035910387-fea47794261f"),
    price50: 28,
    price100: 42,
    stock50: 22,
    stock100: 18,
  },
  {
    title: "Ocean Wood",
    handle: "ocean-wood",
    line: "hombre",
    description:
      "Brisa marina sobre madera clara. Salida de notas ozónicas y toronja, corazón de salvia y madera flotante, fondo de cedro y almizcle.",
    image: perfumeImage("1619994403073-2cec844b8e63"),
    price50: 22,
    price100: 36,
    stock50: 28,
    stock100: 16,
  },
  {
    title: "Steel Black",
    handle: "steel-black",
    line: "hombre",
    description:
      "Precisión y carácter. Salida de pomelo y cardamomo, corazón de geranio y pimienta, fondo de musgo, cuero y sándalo ahumado.",
    image: perfumeImage("1610461888750-10bfc601b874"),
    price50: 24,
    price100: 39,
    stock50: 20,
    stock100: 24,
  },
  {
    title: "Cedar Royal",
    handle: "cedar-royal",
    line: "hombre",
    description:
      "Elegancia amaderada. Salida de bergamota y nuez moscada, corazón de cedro real e iris, fondo de ámbar, tabaco dulce y vainilla.",
    image: perfumeImage("1616949755610-8c9bbc08f138"),
    price50: 26,
    price100: 44,
    stock50: 30,
    stock100: 15,
  },
  {
    title: "Fleur Rose",
    handle: "fleur-rose",
    line: "mujer",
    description:
      "Un ramo luminoso. Salida de pera y pimienta rosa, corazón de rosa de mayo y peonía, fondo de almizcle blanco y sándalo.",
    image: perfumeImage("1592945403244-b3fbafd7f539"),
    price50: 25,
    price100: 40,
    stock50: 26,
    stock100: 19,
  },
  {
    title: "Golden Vanilla",
    handle: "golden-vanilla",
    line: "mujer",
    description:
      "Calidez envolvente. Salida de mandarina y flor de azahar, corazón de jazmín y ylang-ylang, fondo de vainilla dorada, haba tonka y ámbar.",
    image: perfumeImage("1595425970377-c9703cf48b6d"),
    price50: 23,
    price100: 38,
    stock50: 17,
    stock100: 21,
  },
  {
    title: "Nuit Étoilée",
    handle: "nuit-etoilee",
    line: "mujer",
    description:
      "Una noche de terciopelo. Salida de bergamota y grosella negra, corazón de violeta e incienso, fondo de pachulí, vainilla y almizcle.",
    image: perfumeImage("1541643600914-78b084683601"),
    price50: 30,
    price100: 45,
    stock50: 25,
    stock100: 23,
  },
  {
    title: "Peony Silk",
    handle: "peony-silk",
    line: "mujer",
    description:
      "Suavidad floral. Salida de lichi y hojas verdes, corazón de peonía y rosa de té, fondo de cedro blanco, algodón y almizcle limpio.",
    image: perfumeImage("1563170351-be82bc888aa4"),
    price50: 21,
    price100: 34,
    stock50: 29,
    stock100: 18,
  },
  {
    title: "Baby Cotton",
    handle: "baby-cotton",
    line: "ninos",
    description:
      "Ternura suave. Salida de algodón limpio y pera, corazón de flor de azahar y polvo de arroz, fondo de almizcle blanco y vainilla ligera.",
    image: perfumeImage("1557170334-a9632e77c6e4"),
    price50: 12,
    price100: 18,
    stock50: 27,
    stock100: 16,
  },
  {
    title: "Sweet Bubble",
    handle: "sweet-bubble",
    line: "ninos",
    description:
      "Alegría burbujeante. Salida de mandarina y chicle dulce, corazón de fresa y flor de cerezo, fondo de vainilla, azúcar y almizcle.",
    image: perfumeImage("1458538977777-0549b2370168"),
    price50: 14,
    price100: 20,
    stock50: 20,
    stock100: 22,
  },
  {
    title: "Little Star",
    handle: "little-star",
    line: "ninos",
    description:
      "Un destello dulce. Salida de manzana verde y bergamota, corazón de flor de naranjo y heliotropo, fondo de vainilla suave y cedro claro.",
    image: perfumeImage("1588405748880-12d1d2a59f75"),
    price50: 13,
    price100: 19,
    stock50: 24,
    stock100: 19,
  },
]

const CATEGORIES: { name: string; handle: PerfumeLine; description: string }[] =
  [
    {
      name: "Hombre",
      handle: "hombre",
      description:
        "Fragancias amaderadas, especiadas y frescas para él.",
    },
    {
      name: "Mujer",
      handle: "mujer",
      description: "Composiciones florales, dulces y nocturnas para ella.",
    },
    {
      name: "Niños",
      handle: "ninos",
      description: "Aromas suaves y alegres para los más pequeños.",
    },
  ]

type PriceRow = {
  id?: string
  amount?: number | string
  currency_code?: string | null
  region_id?: string | null
}

type VariantRow = {
  id: string
  title?: string
  sku?: string | null
  manage_inventory?: boolean
  prices?: PriceRow[]
  inventory_items?: { inventory_item_id?: string }[]
}

type ProductRow = {
  id: string
  title?: string
  handle?: string
  status?: string
  categories?: { id: string; handle?: string; name?: string }[]
  variants?: VariantRow[]
  sales_channels?: { id: string }[]
}

type CategoryRow = {
  id: string
  name?: string
  handle?: string
  is_active?: boolean
  is_internal?: boolean
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isConnectionLimit(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.message} ${String(error.cause ?? "")}`
      : String(error)
  return /too many clients|too many connections|remaining connection slots|max clients|sorry, too many/i.test(
    message
  )
}

function skuFor(handle: string, size: "50" | "100") {
  return `${handle.replace(/-/g, "_").toUpperCase()}_${size}`
}

function desiredPrices(existing: PriceRow[] | undefined, amount: number) {
  const prices = existing ?? []
  const usd = prices.find((price) => price.currency_code === "usd")
  const eur = prices.find((price) => price.currency_code === "eur")
  const next: {
    id?: string
    amount: number
    currency_code: string
  }[] = []

  if (usd?.id) {
    next.push({ id: usd.id, amount, currency_code: "usd" })
  } else {
    next.push({ amount, currency_code: "usd" })
  }

  if (eur?.id) {
    next.push({ id: eur.id, amount, currency_code: "eur" })
  } else {
    next.push({ amount, currency_code: "eur" })
  }

  return next
}

function readStorefrontPublishableKey() {
  const envPath = path.resolve(process.cwd(), "../storefront/.env.local")
  if (!fs.existsSync(envPath)) {
    return undefined
  }
  const raw = fs.readFileSync(envPath, "utf8")
  const match = raw.match(/^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(.+)$/m)
  const value = match?.[1]?.trim()
  if (!value) {
    return undefined
  }
  return value
}

export default async function seedPerfumes({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fixes: string[] = []

  const run = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        return await fn()
      } catch (error) {
        if (!isConnectionLimit(error) || attempt === 5) {
          throw error
        }
        const wait = attempt * 4000
        logger.warn(
          `Límite de conexiones en "${label}". Reintento ${attempt}/5 en ${wait / 1000}s.`
        )
        await sleep(wait)
      }
    }
    throw new Error(label)
  }

  logger.info("Sembrando catálogo de perfumes Buy&Get...")

  const { data: salesChannels } = await run("sales channels", () =>
    query.graph({
      entity: "sales_channel",
      fields: ["id", "name"],
    })
  )
  const salesChannel =
    salesChannels.find(
      (channel: { name?: string }) => channel.name === "Default Sales Channel"
    ) ?? salesChannels[0]

  if (!salesChannel?.id) {
    throw new Error("No se encontró el Default Sales Channel.")
  }

  const { data: shippingProfiles } = await run("shipping profiles", () =>
    query.graph({
      entity: "shipping_profile",
      fields: ["id", "name", "type"],
    })
  )
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile?.id) {
    throw new Error("No se encontró un shipping profile.")
  }

  const { data: stockLocations } = await run("stock locations", () =>
    query.graph({
      entity: "stock_location",
      fields: [
        "id",
        "name",
        "sales_channels.id",
        "sales_channels.name",
      ],
    })
  )
  const warehouse =
    stockLocations.find(
      (location: { name?: string }) => location.name === "European Warehouse"
    ) ?? stockLocations[0]

  if (!warehouse?.id) {
    throw new Error("No se encontró European Warehouse.")
  }

  const { data: regions } = await run("regions", () =>
    query.graph({
      entity: "region",
      fields: ["id", "name", "currency_code", "payment_providers.id"],
    })
  )
  const ecuador = regions.find(
    (region: { name?: string }) => region.name === "Ecuador"
  )
  if (!ecuador?.id) {
    throw new Error("No se encontró la región Ecuador.")
  }

  const { data: existingCategories } = await run("categories", () =>
    query.graph({
      entity: "product_category",
      fields: ["id", "name", "handle", "is_active", "is_internal"],
      pagination: { take: 100, skip: 0 },
    })
  )

  const categoriesByHandle = new Map<string, CategoryRow>(
    (existingCategories as CategoryRow[])
      .filter((category) => category.handle)
      .map((category) => [category.handle as string, category])
  )

  const missingCategories = CATEGORIES.filter(
    (category) => !categoriesByHandle.has(category.handle)
  )

  if (missingCategories.length) {
    const { result } = await run("create categories", () =>
      createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: missingCategories.map((category) => ({
            name: category.name,
            handle: category.handle,
            description: category.description,
            is_active: true,
            is_internal: false,
          })),
        },
      })
    )
    for (const category of result as CategoryRow[]) {
      if (category.handle) {
        categoriesByHandle.set(category.handle, category)
      }
    }
    logger.info(
      `Categorías creadas: ${missingCategories.map((c) => c.name).join(", ")}`
    )
  } else {
    logger.info("Categorías Hombre, Mujer y Niños ya existían.")
  }

  const inactivePerfumeCategories = CATEGORIES.map(
    (category) => categoriesByHandle.get(category.handle)
  ).filter(
    (category): category is CategoryRow =>
      !!category && (category.is_active === false || category.is_internal === true)
  )

  if (inactivePerfumeCategories.length) {
    await run("activate perfume categories", () =>
      updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: inactivePerfumeCategories.map((category) => category.id) },
          update: { is_active: true, is_internal: false },
        },
      })
    )
  }

  const { data: existingProducts } = await run("products", () =>
    query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "status",
        "categories.id",
        "categories.handle",
        "categories.name",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.manage_inventory",
        "variants.prices.id",
        "variants.prices.amount",
        "variants.prices.currency_code",
        "variants.inventory_items.inventory_item_id",
        "sales_channels.id",
      ],
      pagination: { take: 200, skip: 0 },
    })
  )

  const products = existingProducts as ProductRow[]
  const productsByHandle = new Map(
    products
      .filter((product) => product.handle)
      .map((product) => [product.handle as string, product])
  )

  const hombre = categoriesByHandle.get("hombre")
  if (!hombre) {
    throw new Error("La categoría Hombre no quedó disponible.")
  }

  const eros = productsByHandle.get(EROS_HANDLE)
  if (!eros) {
    throw new Error("No se encontró el producto Eros Flame Versace.")
  }

  const erosVariant = eros.variants?.[0]
  if (!erosVariant) {
    throw new Error("Eros Flame Versace no tiene variantes.")
  }

  await run("update eros", () =>
    updateProductsWorkflow(container).run({
      input: {
        products: [
          {
            id: eros.id,
            description: EROS_DESCRIPTION,
            metadata: fragranceMetadata(EROS_HANDLE),
            status: ProductStatus.PUBLISHED,
            category_ids: [hombre.id],
            shipping_profile_id: shippingProfile.id,
            sales_channels: [{ id: salesChannel.id }],
            variants: [
              {
                id: erosVariant.id,
                title: "100 ml",
                sku: erosVariant.sku || "EROS-FLAME-VERSACE",
                manage_inventory: true,
                prices: desiredPrices(erosVariant.prices, 15),
              },
            ],
          },
        ],
      },
    })
  )
  logger.info("Eros Flame Versace actualizado: Hombre, 15 USD/EUR, published.")

  const missingPerfumes = PERFUMES.filter(
    (perfume) => !productsByHandle.has(perfume.handle)
  )

  if (missingPerfumes.length) {
    await run("create perfumes", () =>
      createProductsWorkflow(container).run({
        input: {
          products: missingPerfumes.map((perfume) => {
            const category = categoriesByHandle.get(perfume.line)
            if (!category) {
              throw new Error(`Falta la categoría ${perfume.line}.`)
            }
            return {
              title: perfume.title,
              handle: perfume.handle,
              description: perfume.description,
              metadata: fragranceMetadata(perfume.handle),
              status: ProductStatus.PUBLISHED,
              thumbnail: perfume.image,
              shipping_profile_id: shippingProfile.id,
              category_ids: [category.id],
              images: [{ url: perfume.image }],
              options: [
                {
                  title: "Tamaño",
                  values: ["50 ml", "100 ml"],
                },
              ],
              variants: [
                {
                  title: "50 ml",
                  sku: skuFor(perfume.handle, "50"),
                  manage_inventory: true,
                  options: { Tamaño: "50 ml" },
                  prices: [
                    { amount: perfume.price50, currency_code: "usd" },
                    { amount: perfume.price50, currency_code: "eur" },
                  ],
                },
                {
                  title: "100 ml",
                  sku: skuFor(perfume.handle, "100"),
                  manage_inventory: true,
                  options: { Tamaño: "100 ml" },
                  prices: [
                    { amount: perfume.price100, currency_code: "usd" },
                    { amount: perfume.price100, currency_code: "eur" },
                  ],
                },
              ],
              sales_channels: [{ id: salesChannel.id }],
            }
          }),
        },
      })
    )
    logger.info(
      `Perfumes creados: ${missingPerfumes.map((perfume) => perfume.title).join(", ")}`
    )
  } else {
    logger.info("Los perfumes nuevos ya existían. No se duplicaron.")
  }

  const catalogCopy = [
    ...PERFUMES.map((perfume) => ({
      handle: perfume.handle,
      description: perfume.description,
    })),
    { handle: EROS_HANDLE, description: EROS_DESCRIPTION },
  ]
  const copyUpdates = catalogCopy
    .map((item) => {
      const product = productsByHandle.get(item.handle)
      if (!product) {
        return null
      }
      return {
        id: product.id,
        description: item.description,
        metadata: fragranceMetadata(item.handle),
      }
    })
    .filter((item): item is { id: string; description: string; metadata: ReturnType<typeof fragranceMetadata> } => !!item)

  if (copyUpdates.length) {
    await run("update fragrance copy", () =>
      updateProductsWorkflow(container).run({
        input: { products: copyUpdates },
      })
    )
    logger.info(`Ficha olfativa actualizada en ${copyUpdates.length} perfumes.`)
  }

  const { data: refreshedProducts } = await run("refresh products", () =>
    query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "status",
        "categories.id",
        "categories.handle",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.inventory_items.inventory_item_id",
      ],
      pagination: { take: 200, skip: 0 },
    })
  )

  const refreshed = refreshedProducts as ProductRow[]
  const refreshedByHandle = new Map(
    refreshed
      .filter((product) => product.handle)
      .map((product) => [product.handle as string, product])
  )

  const stockTargets = new Map<string, number>()
  stockTargets.set("EROS-FLAME-VERSACE", 20)
  for (const perfume of PERFUMES) {
    stockTargets.set(skuFor(perfume.handle, "50"), perfume.stock50)
    stockTargets.set(skuFor(perfume.handle, "100"), perfume.stock100)
  }

  const perfumeProducts = [EROS_HANDLE, ...PERFUMES.map((perfume) => perfume.handle)]
    .map((handle) => refreshedByHandle.get(handle))
    .filter((product): product is ProductRow => !!product)

  const variantsNeedingItems: {
    id: string
    sku: string
    title: string
    qty: number
  }[] = []
  const itemQuantities = new Map<string, number>()

  for (const product of perfumeProducts) {
    for (const variant of product.variants ?? []) {
      const sku =
        variant.sku ||
        (product.handle === EROS_HANDLE ? "EROS-FLAME-VERSACE" : "")
      const qty = stockTargets.get(sku) ?? 20
      const itemId = variant.inventory_items?.find(
        (item) => item.inventory_item_id
      )?.inventory_item_id
      if (itemId) {
        itemQuantities.set(itemId, qty)
      } else if (sku) {
        variantsNeedingItems.push({
          id: variant.id,
          sku,
          title: `${product.title} ${variant.title ?? ""}`.trim(),
          qty,
        })
      }
    }
  }

  if (variantsNeedingItems.length) {
    const { result: createdItems } = await run("create inventory items", () =>
      createInventoryItemsWorkflow(container).run({
        input: {
          items: variantsNeedingItems.map((variant) => ({
            sku: variant.sku,
            title: variant.title,
            requires_shipping: true,
            location_levels: [
              {
                location_id: warehouse.id,
                stocked_quantity: variant.qty,
              },
            ],
          })),
        },
      })
    )

    await run("link inventory items", () =>
      createLinksWorkflow(container).run({
        input: variantsNeedingItems.map((variant, index) => ({
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.INVENTORY]: {
            inventory_item_id: createdItems[index].id,
          },
          data: { required_quantity: 1 },
        })),
      })
    )
    logger.info(
      `Inventario creado para ${variantsNeedingItems.length} variante(s) sin ítem.`
    )
  }

  if (itemQuantities.size) {
    const { data: levels } = await run("inventory levels", () =>
      query.graph({
        entity: "inventory_level",
        fields: ["id", "inventory_item_id", "location_id", "stocked_quantity"],
        filters: {
          inventory_item_id: Array.from(itemQuantities.keys()),
          location_id: warehouse.id,
        },
      })
    )

    const existingItemIds = new Set(
      (levels as { inventory_item_id?: string }[])
        .map((level) => level.inventory_item_id)
        .filter((id): id is string => !!id)
    )

    const missingLevels = Array.from(itemQuantities.entries())
      .filter(([itemId]) => !existingItemIds.has(itemId))
      .map(([inventory_item_id, stocked_quantity]) => ({
        inventory_item_id,
        location_id: warehouse.id,
        stocked_quantity,
      }))

    if (missingLevels.length) {
      await run("create inventory levels", () =>
        createInventoryLevelsWorkflow(container).run({
          input: { inventory_levels: missingLevels },
        })
      )
      logger.info(
        `Niveles de inventario creados en European Warehouse: ${missingLevels.length}.`
      )
    }
  }

  for (const category of CATEGORIES) {
    const record = categoriesByHandle.get(category.handle)
    if (!record) {
      continue
    }
    const ids = perfumeProducts
      .filter((product) => {
        const belongs =
          (category.handle === "hombre" && product.handle === EROS_HANDLE) ||
          PERFUMES.find((perfume) => perfume.handle === product.handle)?.line ===
            category.handle
        if (!belongs) {
          return false
        }
        const alreadyLinked = (product.categories ?? []).some(
          (linked) => linked.id === record.id || linked.handle === category.handle
        )
        return !alreadyLinked
      })
      .map((product) => product.id)

    if (!ids.length) {
      continue
    }

    await run(`link ${category.handle}`, () =>
      batchLinkProductsToCategoryWorkflow(container).run({
        input: { id: record.id, add: ids },
      })
    )
  }

  const { data: collections } = await run("collections", () =>
    query.graph({
      entity: "product_collection",
      fields: ["id", "title", "handle", "products.id"],
      pagination: { take: 50, skip: 0 },
    })
  )

  let destacados = (
    collections as { id: string; handle?: string; products?: { id: string }[] }[]
  ).find((collection) => collection.handle === "destacados")

  if (!destacados) {
    const { result } = await run("create collection", () =>
      createCollectionsWorkflow(container).run({
        input: {
          collections: [{ title: "Destacados", handle: "destacados" }],
        },
      })
    )
    destacados = {
      id: result[0].id,
      handle: "destacados",
      products: [],
    }
    logger.info("Colección Destacados creada.")
  } else {
    logger.info("Colección Destacados ya existía.")
  }

  const featuredIds = FEATURED_HANDLES.map((handle) => {
    const product = refreshedByHandle.get(handle)
    if (!product) {
      throw new Error(`Falta el perfume destacado ${handle}.`)
    }
    return product.id
  })
  const alreadyFeatured = new Set(
    (destacados.products ?? []).map((product) => product.id)
  )
  const toFeature = featuredIds.filter((id) => !alreadyFeatured.has(id))

  if (toFeature.length) {
    await run("link destacados", () =>
      batchLinkProductsToCollectionWorkflow(container).run({
        input: { id: destacados!.id, add: toFeature },
      })
    )
    logger.info(`Destacados: se agregaron ${toFeature.length} perfumes.`)
  }

  const clothingCategoryIds = (existingCategories as CategoryRow[])
    .filter(
      (category) =>
        category.handle &&
        CLOTHING_CATEGORY_HANDLES.includes(category.handle) &&
        category.is_active !== false
    )
    .map((category) => category.id)

  if (clothingCategoryIds.length) {
    await run("deactivate clothing categories", () =>
      updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: clothingCategoryIds },
          update: { is_active: false },
        },
      })
    )
    logger.info("Categorías de ropa desactivadas.")
  }

  const clothingIds = refreshed
    .filter((product) => {
      if (!product.handle || product.handle === EROS_HANDLE) {
        return false
      }
      if (PERFUMES.some((perfume) => perfume.handle === product.handle)) {
        return false
      }
      if (CLOTHING_HANDLES.includes(product.handle)) {
        return product.status !== ProductStatus.DRAFT
      }
      return (product.categories ?? []).some(
        (category) =>
          category.handle &&
          CLOTHING_CATEGORY_HANDLES.includes(category.handle)
      ) && product.status !== ProductStatus.DRAFT
    })
    .map((product) => product.id)

  const draftedTitles = refreshed
    .filter((product) => clothingIds.includes(product.id))
    .map((product) => product.title)

  if (clothingIds.length) {
    await run("draft clothing", () =>
      updateProductsWorkflow(container).run({
        input: {
          selector: { id: clothingIds },
          update: { status: ProductStatus.DRAFT },
        },
      })
    )
    logger.info(`Pasados a draft: ${draftedTitles.join(", ")}`)
  } else {
    logger.info("Los productos de ropa ya estaban en draft o no existen.")
  }

  const ecuadorProviders = (
    ecuador.payment_providers as { id?: string }[] | undefined
  )?.map((provider) => provider.id)
  if (!ecuadorProviders?.includes("pp_system_default")) {
    const nextProviders = Array.from(
      new Set([...(ecuadorProviders ?? []), "pp_system_default"])
    ).filter((id): id is string => !!id)
    await run("ecuador payment provider", () =>
      updateRegionsWorkflow(container).run({
        input: {
          selector: { id: ecuador.id },
          update: { payment_providers: nextProviders },
        },
      })
    )
    fixes.push(
      "Se agregó pp_system_default a los proveedores de pago de Ecuador."
    )
  }

  const linkedChannels = (
    warehouse.sales_channels as { id?: string }[] | undefined
  )?.map((channel) => channel.id)
  if (!linkedChannels?.includes(salesChannel.id)) {
    await run("link warehouse channel", () =>
      linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: warehouse.id, add: [salesChannel.id] },
      })
    )
    fixes.push(
      "European Warehouse quedó vinculado al Default Sales Channel."
    )
  }

  const publishableToken = readStorefrontPublishableKey()
  const { data: apiKeys } = await run("api keys", () =>
    query.graph({
      entity: "api_key",
      fields: ["id", "title", "type", "token", "sales_channels.id"],
      filters: { type: "publishable" },
    })
  )

  const publishableKeys = apiKeys as {
    id: string
    title?: string
    token?: string
    sales_channels?: { id: string }[]
  }[]
  const storefrontKey = publishableToken
    ? publishableKeys.find((key) => key.token === publishableToken)
    : undefined
  const keysToCheck = storefrontKey ? [storefrontKey] : publishableKeys

  for (const key of keysToCheck) {
    const linked = (key.sales_channels ?? []).some(
      (channel) => channel.id === salesChannel.id
    )
    if (!linked) {
      await run("link publishable key", () =>
        linkSalesChannelsToApiKeyWorkflow(container).run({
          input: { id: key.id, add: [salesChannel.id] },
        })
      )
      fixes.push(
        `La publishable key "${key.title ?? key.id}" quedó vinculada al Default Sales Channel.`
      )
    }
  }

  const { data: fulfillmentSets } = await run("fulfillment sets", () =>
    query.graph({
      entity: "fulfillment_set",
      fields: [
        "id",
        "name",
        "service_zones.id",
        "service_zones.name",
        "service_zones.geo_zones.id",
        "service_zones.geo_zones.country_code",
        "service_zones.geo_zones.type",
        "service_zones.shipping_options.id",
        "service_zones.shipping_options.name",
        "service_zones.shipping_options.price_type",
        "service_zones.shipping_options.provider_id",
        "service_zones.shipping_options.shipping_profile_id",
        "service_zones.shipping_options.prices.id",
        "service_zones.shipping_options.prices.amount",
        "service_zones.shipping_options.prices.currency_code",
        "service_zones.shipping_options.rules.id",
        "service_zones.shipping_options.rules.attribute",
        "service_zones.shipping_options.rules.value",
        "service_zones.shipping_options.rules.operator",
      ],
    })
  )

  type ShippingOptionRow = {
    id: string
    name?: string
    prices?: PriceRow[]
    rules?: { id: string; attribute?: string; value?: string; operator?: string }[]
  }
  type ZoneRow = {
    id: string
    name?: string
    geo_zones?: { country_code?: string }[]
    shipping_options?: ShippingOptionRow[]
  }

  const ecuadorZones: ZoneRow[] = []
  for (const set of fulfillmentSets as { service_zones?: ZoneRow[] }[]) {
    for (const zone of set.service_zones ?? []) {
      const matches = (zone.geo_zones ?? []).some(
        (geo) => geo.country_code?.toLowerCase() === "ec"
      )
      if (matches || zone.name?.toLowerCase() === "ecuador") {
        ecuadorZones.push(zone)
      }
    }
  }

  const storeOptions = ecuadorZones.flatMap((zone) =>
    (zone.shipping_options ?? []).filter((option) => {
      const isReturn = (option.rules ?? []).find(
        (rule) => rule.attribute === "is_return"
      )
      return isReturn?.value !== "true"
    })
  )

  if (!storeOptions.length && ecuadorZones[0]) {
    await run("create ecuador shipping", () =>
      createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Standard Shipping Ecuador",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: ecuadorZones[0].id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: "Standard",
              description: "Envío a Ecuador.",
              code: "standard-ec",
            },
            prices: [{ currency_code: "usd", amount: 10 }],
            rules: [
              {
                attribute: "enabled_in_store",
                value: "true",
                operator: "eq",
              },
              {
                attribute: "is_return",
                value: "false",
                operator: "eq",
              },
            ],
          },
        ],
      })
    )
    fixes.push(
      "Se creó la opción de envío Standard Shipping Ecuador con precio en USD y habilitada para la tienda."
    )
  }

  for (const option of storeOptions) {
    const hasUsd = (option.prices ?? []).some(
      (price) => price.currency_code === "usd" && Number(price.amount) > 0
    )
    if (!hasUsd) {
      const prices = (option.prices ?? []).map((price) => ({
        id: price.id,
        amount: Number(price.amount),
        currency_code: price.currency_code ?? undefined,
      }))
      prices.push({ currency_code: "usd", amount: 10 })
      await run(`usd price ${option.id}`, () =>
        updateShippingOptionsWorkflow(container).run({
          input: [
            {
              id: option.id,
              prices,
            },
          ],
        })
      )
      fixes.push(
        `La opción "${option.name ?? option.id}" de Ecuador ahora tiene precio en USD.`
      )
    }

    const enabled = (option.rules ?? []).find(
      (rule) => rule.attribute === "enabled_in_store"
    )
    const isReturn = (option.rules ?? []).find(
      (rule) => rule.attribute === "is_return"
    )
    const ruleUpdates: { id: string; value: string }[] = []
    const ruleCreates: {
      shipping_option_id: string
      attribute: string
      operator: "eq"
      value: string
    }[] = []

    if (!enabled) {
      ruleCreates.push({
        shipping_option_id: option.id,
        attribute: "enabled_in_store",
        operator: "eq",
        value: "true",
      })
    } else if (enabled.value !== "true" && enabled.id) {
      ruleUpdates.push({ id: enabled.id, value: "true" })
    }

    if (!isReturn) {
      ruleCreates.push({
        shipping_option_id: option.id,
        attribute: "is_return",
        operator: "eq",
        value: "false",
      })
    }

    if (ruleCreates.length || ruleUpdates.length) {
      await run(`shipping rules ${option.id}`, () =>
        batchShippingOptionRulesWorkflow(container).run({
          input: {
            create: ruleCreates,
            update: ruleUpdates,
          },
        })
      )
      fixes.push(
        `La opción "${option.name ?? option.id}" quedó habilitada para la tienda.`
      )
    }
  }

  if (!ecuadorZones.length) {
    logger.warn(
      "No se encontró una service zone de Ecuador. Revisa el stock location."
    )
  }

  if (!fixes.length) {
    fixes.push(
      "Ecuador ya tenía pp_system_default, envío en USD habilitado para la tienda, warehouse y publishable key en el Default Sales Channel."
    )
  }

  logger.info("Correcciones de checkout Ecuador:")
  for (const fix of fixes) {
    logger.info(`- ${fix}`)
  }
  logger.info("Seed de perfumes terminado.")
}
