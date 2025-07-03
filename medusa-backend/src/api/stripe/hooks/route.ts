import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { Modules } from "@medusajs/framework/utils"
import Stripe from "stripe";
const stripe = new Stripe(process.env.SECRET_STRIPE_API_KEY, {
  apiVersion: "2022-11-15",
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {

  // START HERE:
  // Construct the event using the raw body and signature to verify the authenticity of the webhook event

       
};
