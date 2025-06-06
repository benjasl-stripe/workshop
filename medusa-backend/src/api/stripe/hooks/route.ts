import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { Modules } from "@medusajs/framework/utils"
import Stripe from "stripe";
const stripe = new Stripe(process.env.SECRET_STRIPE_API_KEY, {
  apiVersion: "2022-11-15",
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {

  const sig = req.headers["stripe-signature"] as string;
  const rawBody = req.body;
  let event = req.body;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.SECRET_STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  switch (event.type) {
        // case 'payment_intent.succeeded':
        //     //get the payses_id from the event request body 
        //     const payses_id =  event.data.object.metadata.session_id;

        //     try {
        //         // Resolve the systems payment service
        //         const paymentModuleService = req.scope.resolve(Modules.PAYMENT);
        //         // Wait for 3 seconds before fetching payments
        //         await new Promise(res => setTimeout(res, 3000));  
        //         //get the Medusa Payment Object by the payment_session_id
        //         const paymentSession = await paymentModuleService.retrievePaymentSession(payses_id)
        //         //Capture the payment
        //         const payment = await paymentModuleService.capturePayment({
        //             payment_id: paymentSession.payment.id, // or paymentSession.payment.id if nested
        //         })
        //         res.status(200).json({ received: true, payment: payment });
        //     } catch (err: any) {
        //         console.error("Failed:", err.message);
        //         res.status(500).json({ error: err.message });
        //     }
        // break;
        default:
              // If you want to respond to other events:
              return res.status(200).json({ received: true });
    }
};
