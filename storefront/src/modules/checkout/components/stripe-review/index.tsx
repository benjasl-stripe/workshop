"use client";

import React, { useState } from "react";
import { Heading, Text, clx } from "@medusajs/ui";
import { placeOrder } from "@lib/data/cart"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useSearchParams } from "next/navigation";
import { Button } from "@medusajs/ui"

const StripeReview = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams();
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isOpen = searchParams.get("step") === "review";

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard);

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  

    const onPaymentCompleted = async () => {
      await placeOrder()
        .catch((err) => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setSubmitting(false)
        })
    }



  const handlePaymentConfirmation = async () => {
    if (!stripe || !elements) {
      // Stripe.js has not loaded
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card Element not found");
      }

      const client_secret = cart.payment_collection.payment_sessions[0].data.client_secret || null
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret as string,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${cart.billing_address?.first_name} ${cart.billing_address?.last_name}`,
              address: {
                city: cart.billing_address?.city || undefined,
                country: cart.billing_address?.country_code || undefined,
                line1: cart.billing_address?.address_1 || undefined,
                line2: cart.billing_address?.address_2 || undefined,
                postal_code: cart.billing_address?.postal_code || undefined,
                state: cart.billing_address?.province || undefined,
              },
              email: cart.email,
              phone: cart.billing_address?.phone || undefined,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || "An unexpected error occurred.");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Payment succeeded
        console.log("Payment succeeded:", paymentIntent.id);
        // Redirect to order success page or display success message
        return onPaymentCompleted()
      } else {
        // Handle any other statuses (e.g., requires_action)
        setError("Payment failed. Please try again.");
      }
    } catch (stripeError: any) {
      setError(stripeError.message || "An error occurred while confirming your payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          {error && (
            <Text className="text-red-500 mb-4" data-testid="payment-error-message">
              {error}
            </Text>
          )}
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Medusa
                Store&apos;s Privacy Policy.
              </Text>
            </div>
          </div>
          <Button
            className={`${isProcessing ? "opacity-50" : ""} btn-primary`}
            onClick={handlePaymentConfirmation}
            disabled={isProcessing}
            data-testid="submit-order-button"
          >
            {isProcessing ? "Processing..." : "Place Order"}




          </Button>
        </>
      )}
    </div>
  );
};

export default StripeReview;
