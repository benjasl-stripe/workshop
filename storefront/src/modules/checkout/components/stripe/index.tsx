"use client";

import { RadioGroup } from "@headlessui/react";
import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants";
import { initiatePaymentSession } from "@lib/data/cart";
import { CheckCircleSolid, CreditCard } from "@medusajs/icons";
import { Button, Container, Heading, Text, clx } from "@medusajs/ui";
import ErrorMessage from "@modules/checkout/components/error-message";
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container";
import Divider from "@modules/common/components/divider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";

import { CardElement, useStripe, useElements, StripeCardElementOptions } from "@stripe/react-stripe-js";

const StripePayment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any;
  availablePaymentMethods: any[];
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  );

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
      },
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  );


  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams.get("step") === "payment";

  const isStripe = isStripeFunc(selectedPaymentMethod);


  const BensPaymentProviderId='pp_bens-payment_bens-payment'
  const isBensPaymentProvider = (providerId) => {
    return BensPaymentProviderId.includes(providerId);
  };



  const setPaymentMethod = async (method: string) => {
    setError(null);
    console.log('cart',cart)
    console.log(method)
    setSelectedPaymentMethod(method);
  };


  const setPaymentMethodOriginalBeforeThePlane = async (method: string) => {
    setError(null);
    console.log(method)
    setSelectedPaymentMethod(method);
    if (isBensPaymentProvider(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      });
    }
  };


  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const shouldInputCard =
      isBensPaymentProvider(selectedPaymentMethod) && !activeSession;

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod;

      if (!checkActiveSession) {
        const customerDetails = {
            customer_id: cart.customer.id, // Use the customer_id from the cart
            email: cart.email, // This is available directly in the cart object
            billing_details: {
              name: `${cart.billing_address.first_name} ${cart.billing_address.last_name}`,
              address: {
                city: cart.billing_address.city,
                country: cart.billing_address.country_code,
                line1: cart.billing_address.address_1,
                line2: cart.billing_address.address_2 || undefined,
                postal_code: cart.billing_address.postal_code,
                state: cart.billing_address.province || undefined,
              },
              phone: cart.billing_address.phone || undefined,
            },
        }

        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
          context:{
            ...customerDetails
          }
        });
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
  }, [isOpen]);

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          { availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {isBensPaymentProvider(selectedPaymentMethod) && (
            <div className="mt-4">
              <CardElement
                options={useOptions as StripeCardElementOptions}
                onChange={(e) => {
                  setCardBrand(e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1));
                  setError(e.error?.message || null);
                  setCardComplete(e.complete);
                }}
              />
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripe && !cardComplete) ||
              (!selectedPaymentMethod)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeFunc(selectedPaymentMethod)
              ? "Enter card details"
              : "Continue to review"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment details
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  {/* <CardElement
                    options={useOptions as StripeCardElementOptions}
                    onChange={(e) => {
                      setCardBrand(e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1));
                      setError(e.error?.message || null);
                      setCardComplete(e.complete);
                    }}
                  /> */}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  );
};

export default StripePayment;
