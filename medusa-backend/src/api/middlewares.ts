import { 
    defineMiddlewares,
    MedusaNextFunction, 
    MedusaRequest, 
    MedusaResponse, 
  } from "@medusajs/framework/http"
  import { raw } from "body-parser"
  
  export default defineMiddlewares({
    routes: [
        {
            matcher: "/stripe/hooks*",
            bodyParser: false,
            middlewares: [raw({ type: "application/json" })],
        },      
    ],
  })