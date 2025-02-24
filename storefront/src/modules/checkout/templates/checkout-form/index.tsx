"use client"; // Add this directive at the top of your file

import React, { useState, useEffect } from "react";  // Import React
import { listCartShippingMethods } from "@lib/data/fulfillment";
import { listCartPaymentMethods } from "@lib/data/payment";
import { HttpTypes } from "@medusajs/types";
import Addresses from "@modules/checkout/components/addresses";
//import Payment from "@modules/checkout/components/payment";
//import Review from "@modules/checkout/components/review";

import Shipping from "@modules/checkout/components/shipping";
import StripePaymentSubs from "@modules/checkout/components/stripe-subs"; // payment component for stripe subscriptions
import StripeReviewSubs from "@modules/checkout/components/stripe-review-subs"; // review component for subscriptions
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK || "");

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

      <Elements stripe={stripePromise}>
        <StripePaymentSubs cart={cart} availablePaymentMethods={paymentMethods} />
        <StripeReviewSubs cart={cart} />
        {/* <StripeReview cart={cart} /> */}
      </Elements>
    </div>
  );
}
