import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"

type StoreCurrency = {
  currency_code?: string | null
  is_default?: boolean | null
}

export default async function ({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id"],
  })

  const storeId = stores[0]?.id
  if (!storeId) {
    throw new Error("No se encontró la tienda.")
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: storeId },
      update: {
        supported_currencies: [
          { currency_code: "usd", is_default: true },
          { currency_code: "eur", is_default: false },
        ],
      },
    },
  })

  const { data: updatedStores } = await query.graph({
    entity: "store",
    fields: ["supported_currencies.*"],
  })

  const currencies = (updatedStores[0]?.supported_currencies ??
    []) as StoreCurrency[]
  const defaultCurrency = currencies.find((currency) => currency.is_default)

  for (const currency of currencies) {
    logger.info(
      `supported_currency ${currency.currency_code} is_default=${currency.is_default}`
    )
  }

  logger.info(
    `Moneda por defecto: ${defaultCurrency?.currency_code ?? "ninguna"}`
  )
}
