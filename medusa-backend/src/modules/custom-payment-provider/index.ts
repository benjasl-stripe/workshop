// src/modules/custom-payment-provider/index.ts
import CustomPaymentProviderService from "./service";
import { ModuleProvider, Modules } from "@medusajs/framework/utils";

export default ModuleProvider(Modules.PAYMENT, {
  services: [CustomPaymentProviderService],  // Register the service here
});
