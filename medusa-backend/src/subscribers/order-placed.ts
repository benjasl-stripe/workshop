import { 
    OrderService, 
    PaymentCollectionService 
  } from "@medusajs/medusa";
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  logger.info("An order was just placed")
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',data)

  
}

export const config: SubscriberConfig = {
  event: `order.placed`,
}