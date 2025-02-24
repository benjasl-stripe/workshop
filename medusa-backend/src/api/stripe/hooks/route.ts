import { MedusaRequest, MedusaResponse, OrderService } from "@medusajs/medusa";
import Axios from "axios";




import Stripe from "stripe";

const stripe = new Stripe("sk_test_51QjOTUBBEuoYhGJjXyl2QedUCNJFGnG21EJiOGhYvm262zg04zlhEphPq3pQSdmhjZtKCfkNm2J7qEa1pSw40dF800ZQJd7boc", {
  apiVersion: "2022-11-15",
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const sig = req.headers["stripe-signature"] as string;
  const rawBody = req.body;
  const endpointSecret = 'whsec_edd132ec3d4de9e4073c10d24b1ece902a6d003cf40f64af6bb752c8bffcc3c3';
  let event = req.body;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log(event);

      if (invoice.status === "paid") {
        console.log("Payment successful!");


        try {
          // Get payment session ID from request body
          const  paymentSessionId  = invoice.subscription_details.metadata.session_id;
      
          if (!paymentSessionId) {
            return res.status(400).json({ message: "Payment session ID is required" });
          }
      
          // Create Axios instance to interact with Medusa API
          const axiosInstance = Axios.create({
            baseURL: 'http://localhost:9000', // Ensure your Medusa server is running on this URL
            headers: {
              Authorization: `Basic ${
                Buffer.from(`sk_2dc3c55046fc1863ca5eeaaaaf1cc8d00ce80151c32a32bc142ced20936d0cef`).toString("base64")
              }`,
              'Content-Type': 'application/json',
            },
          });
      
          // Fetch all orders and check payment session ID associated with them
          const ordersResponse = await axiosInstance.get('/admin/orders?limit=20&order=-created_at');
      
          if (ordersResponse.data && ordersResponse.data.orders) {
            const orders = ordersResponse.data.orders;
      
            // Loop through orders and check payment session ID by calling order details
            for (const order of orders) {
              // Get the full details of the order using its ID
              const orderDetailsResponse = await axiosInstance.get(`/admin/orders/${order.id}`);
              const orderDetails = orderDetailsResponse.data;
              if (orderDetails.order.payment_collections[0].payments && Array.isArray(orderDetails.order.payment_collections[0].payments)) {
                const payment = orderDetails.order.payment_collections[0].payments.find(p => p.payment_session_id === paymentSessionId);
                if (payment) {
                  // If payment session ID is found, return the associated order ID
                  //return res.status(200).json({ orderId: orderDetails.order.id });
                  
                  // now you can update the order status
                  const ordercomplete = await  axiosInstance.post(`/admin/orders/${orderDetails.order.id}/complete`);
                  // add json body to the request

                  
                  const paymentupdate = await  axiosInstance.post(`/admin/payments/${payment.id}/capture`);

                  //update payment_Status, this is what teh object looks like;
                  return res.status(200).json({ message: `Order status updated to complete: ${paymentupdate.data}` });
                }
              }
            }
      
            // If no matching payment session ID found
            return res.status(404).json({ message: "Payment session not found in any order" });
          } else {
            return res.status(404).json({ message: "No orders found" });
          }
        } catch (err) {
          console.error("Error in POST handler:", err);
          return res.status(500).json({ message: err.message });
        }

        
      } else {
        console.log("Payment failed or not completed.");
      }
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      break;

    default:
  }

  res.json({ received: true });
}
