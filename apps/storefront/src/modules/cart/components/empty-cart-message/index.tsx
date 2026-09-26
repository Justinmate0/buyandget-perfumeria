import { Heading, Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div className="py-48 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        Carrito
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        Todavía no hay fragancias en tu carrito. Empieza por la tienda y
        encuentra la tuya.
      </Text>
      <div>
        <InteractiveLink href="/store">Ver perfumes</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
