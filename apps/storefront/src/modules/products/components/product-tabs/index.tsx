"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Información del producto",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Envíos y devoluciones",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

function metadataText(product: HttpTypes.StoreProduct, key: string) {
  const raw = product.metadata?.[key]
  if (typeof raw !== "string") {
    return null
  }
  const value = raw.trim()
  if (!value || value === "-") {
    return null
  }
  return value
}

function sizeLabel(product: HttpTypes.StoreProduct) {
  const fromMetadata = metadataText(product, "size")
  if (fromMetadata) {
    return fromMetadata
  }

  const sizes = Array.from(
    new Set(
      (product.variants ?? [])
        .map((variant) => variant.title?.trim())
        .filter(
          (title): title is string =>
            !!title && !/^default/i.test(title)
        )
    )
  )

  return sizes.length ? sizes.join(" / ") : null
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const fields = [
    { label: "Concentración", value: metadataText(product, "concentration") },
    { label: "Tamaño", value: sizeLabel(product) },
    { label: "Familia olfativa", value: metadataText(product, "family") },
    { label: "Notas de salida", value: metadataText(product, "top_notes") },
    { label: "Notas de corazón", value: metadataText(product, "heart_notes") },
    { label: "Notas de fondo", value: metadataText(product, "base_notes") },
  ].filter((field) => field.value)

  if (!fields.length) {
    return null
  }

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-4 small:grid-cols-2 small:gap-x-8">
        {fields.map((field) => (
          <div key={field.label}>
            <span className="font-semibold">{field.label}</span>
            <p>{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Envíos</span>
            <p className="max-w-sm">
              Enviamos a Ecuador y a Europa. En Ecuador el pedido sale en 1 a
              2 días hábiles y llega en 3 a 5. En Europa el plazo habitual es
              de 5 a 10 días hábiles. Cada frasco viaja en caja protegida.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Cambios</span>
            <p className="max-w-sm">
              Si recibes otra fragancia o un frasco dañado, lo cambiamos sin
              costo. Escríbenos dentro de los 14 días siguientes a la entrega,
              con el frasco sin usar.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Devoluciones</span>
            <p className="max-w-sm">
              Puedes devolver un perfume sellado dentro de los 14 días
              posteriores a recibirlo. Reembolsamos el valor del producto una
              vez que llega de vuelta a la perfumería.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
