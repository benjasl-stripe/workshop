"use client"; // Add this directive at the top of your file

import React, { useState, useEffect } from "react";  // Import React
import { listCartShippingMethods } from "@lib/data/fulfillment";
import { listCartPaymentMethods } from "@lib/data/payment";
import { HttpTypes } from "@medusajs/types";
import Addresses from "@modules/checkout/components/addresses";


import Shipping from "@modules/checkout/components/shipping";
import Payment from "@modules/checkout/components/payment"; // payment component for stripe subscriptions
import Review from "@modules/checkout/components/review"; // review component for subscriptions


// Module 3: Add Elements to Collect Card details 
// Import the stripe elements and Stripe libraries.
// Add the code below this line:


// Module 3: Add Elements to Collect Card details 
// Load Stripe with your publishable key. 
// Add the code below this line:


export default function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null;
  customer: HttpTypes.StoreCustomer | null;
}) {
  if (!cart) {
    return null;
  }

  const [shippingMethods, setShippingMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchMethods = async () => {
      const shipping = await listCartShippingMethods(cart.id);
      const payment = await listCartPaymentMethods(cart.region?.id ?? "");

      setShippingMethods(shipping || []);
      setPaymentMethods(payment || []);
    };

    fetchMethods();
  }, [cart]);

  if (!shippingMethods.length || !paymentMethods.length) {
    return null;
  }

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      
      
      {/* Module 3: Add stripe Elements to collect card details. Replace thw code block below: */}

       {/* <Elements stripe={stripePromise}> replace this entire line.*/}
          <Payment cart={cart} availablePaymentMethods={paymentMethods} />
          <Review cart={cart} />
       {/* </Elements> replace this entire line. */}
  
    </div>
  );
}
