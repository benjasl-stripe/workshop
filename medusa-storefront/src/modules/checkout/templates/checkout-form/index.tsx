"use client"; // Add this directive at the top of your file

import React, { useState, useEffect } from "react";  // Import React
import { listCartShippingMethods } from "@lib/data/fulfillment";
import { listCartPaymentMethods } from "@lib/data/payment";
import { HttpTypes } from "@medusajs/types";
import Addresses from "@modules/checkout/components/addresses";


import Shipping from "@modules/checkout/components/shipping";
import Payment from "@modules/checkout/components/payment"; // payment component for stripe subscriptions
import Review from "@modules/checkout/components/review"; // review component for subscriptions


//// add this import for stripe
//import { loadStripe } from "@stripe/stripe-js";
//import { Elements } from "@stripe/react-stripe-js";

//// Load Stripe with your publishable key
//const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

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
      
      {/* <Elements stripe={stripePromise}> */}
    
        <Payment cart={cart} availablePaymentMethods={paymentMethods} />
        <Review cart={cart} />
        
      {/* </Elements>*/}
      
  
    </div>
  );
}
