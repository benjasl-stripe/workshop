import Stripe from 'stripe';


import { 
    AbstractPaymentProvider, 
    BigNumber 
  } from "@medusajs/framework/utils";
  import { 
    Logger, 
    PaymentProviderError, 
    PaymentProviderSessionResponse, 
    PaymentSessionStatus, 
    UpdatePaymentProviderSession, 
    ProviderWebhookPayload, 
    WebhookActionResult 
  } from "@medusajs/framework/types";
  
  type Options = {};
  
  type InjectedDependencies = {
    logger: Logger;
  };
  
  class BensPaymentProviderService extends AbstractPaymentProvider<Options> {

    protected logger_: Logger;
    private stripe_: Stripe;

    static identifier = "bens-payment";
  
    constructor(container: InjectedDependencies, options: Options) {
        super(container, options);
        this.logger_ = container.logger;
        this.stripe_ = new Stripe('sk_test_51QjOTUBBEuoYhGJjXyl2QedUCNJFGnG21EJiOGhYvm262zg04zlhEphPq3pQSdmhjZtKCfkNm2J7qEa1pSw40dF800ZQJd7boc', {
        apiVersion: '2020-08-27', // Use the latest stable version
        });
    }

  
    static validateOptions(options: Record<string, any>) {
      // No validation needed for bens
    }
  
    async initiatePayment(context: any): Promise<PaymentProviderError | PaymentProviderSessionResponse> {

        try {
        
          const dollarAmount = context.amount; // Assuming this is in dollars
          const amountInCents = Math.round(dollarAmount * 100); // Convert dollars to cents
          this.logger_.info(`Initiating Stripe payment for amount in cents: ${amountInCents}`);
    
          const paymentIntent = await this.stripe_.paymentIntents.create({
            amount: amountInCents,
            currency: context.currency || 'usd',
            metadata: { 
              order_id: context.order_id, // Optionally, add relevant metadata
            },
          });
    
          return {
            id: paymentIntent.id,
            data: { client_secret: paymentIntent.client_secret },
            status: "pending" as PaymentSessionStatus, // Set initial status to "pending"

          };
        } catch (error) {
          this.logger_.error('Stripe initiation error:', error);
          return { error: new PaymentProviderError(error.message) };
        }
      }
  
    async authorizePayment(paymentSessionData: Record<string, unknown>, context: Record<string, unknown>): Promise<any> {
      this.logger_.info(`Authorizing bens payment session: ${paymentSessionData.id}`);
      return {
        data: paymentSessionData,
        status: "authorized" as PaymentSessionStatus,
      };
    }

    async createSubscription(context: any): Promise<any> {
      const { customer_id, plan_id } = context;
      
      const customer = await this.stripe_.customers.retrieve(customer_id) || await this.stripe_.customers.create({ id: customer_id });
      
      const subscription = await this.stripe_.subscriptions.create({
        customer: customer.id,
        items: [{ plan: plan_id }],
      });
  
      return subscription;
    }
  }
  
    async capturePayment(paymentData: Record<string, unknown>): Promise<any> {
      this.logger_.info(`Capturing bens payment session: ${paymentData.id}`);
      return {
        id: paymentData.id,
        status: "captured",
        data: paymentData
      };
    }
  
    async cancelPayment(paymentData: Record<string, unknown>): Promise<any> {
      this.logger_.info(`Cancelling bens payment session: ${paymentData.id}`);
      return {
        id: paymentData.id,
        status: "canceled",
        data: paymentData
      };
    }
  
    async deletePayment(paymentSessionData: Record<string, unknown>): Promise<any> {
      this.logger_.info(`Deleting bens payment session: ${paymentSessionData.id}`);
      return {};
    }
  
    async getPaymentStatus(paymentSessionData: Record<string, unknown>): Promise<PaymentSessionStatus | "error"> {
      this.logger_.info(`Getting status for bens payment session: ${paymentSessionData.id}`);
      return "captured";
    }
  
    async refundPayment(paymentData: Record<string, unknown>, refundAmount: number): Promise<any> {
      this.logger_.info(`Refunding bens payment session: ${paymentData.id}`);
      return {
        id: paymentData.id,
        status: "refunded",
        refunded_amount: refundAmount
      };
    }
  
    async retrievePayment(paymentSessionData: Record<string, unknown>): Promise<any> {
      this.logger_.info(`Retrieving bens payment session: ${paymentSessionData.id}`);
      return {
        id: paymentSessionData.id,
        status: "retrieved",
        data: paymentSessionData
      };
    }
  
    async updatePayment(context: UpdatePaymentProviderSession): Promise<any> {
      this.logger_.info(`Updating bens payment session: ${context.data.id}`);
      return { id: context.data.id, data: context.data };
    }
  
    async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
      this.logger_.info(`Processing webhook for bens payment: ${payload.data.event_type}`);
      return {
        action: "not_supported",
        data: {}
      };
    }
  
    async listPaymentMethods(context: { customer_id: string }): Promise<any[]> {
      this.logger_.info(`Listing bens payment methods for customer: ${context.customer_id}`);
      return [
        {
          id: "bens-method-id",
          type: "bens",
          data: {}
        }
      ];
    }
  }
  
  export default BensPaymentProviderService;
  