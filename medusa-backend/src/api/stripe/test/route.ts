import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import Axios from "axios";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Get payment session ID from request body
    const  paymentSessionId  = 'payses_01JK4J0NV5KJ9PWZDQMS87A699'

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
    const ordersResponse = await axiosInstance.get('/admin/orders');

    if (ordersResponse.data && ordersResponse.data.orders) {
      const orders = ordersResponse.data.orders;

      // Loop through orders and check payment session ID by calling order details
      for (const order of orders) {
        // Get the full details of the order using its ID
        const orderDetailsResponse = await axiosInstance.get(`/admin/orders/${order.id}`);

        const orderDetails = orderDetailsResponse.data;
console.log(orderDetails.order.payment_collections[0].payments[0].payment_session_id )

        if (orderDetails.order.payment_collections[0].payments && Array.isArray(orderDetails.order.payment_collections[0].payments)) {
          const payment = orderDetails.order.payment_collections[0].payments.find(p => p.payment_session_id === paymentSessionId);
          if (payment) {
            // If payment session ID is found, return the associated order ID
            return res.status(200).json({ orderId: orderDetails.order.id });
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
}




