import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import bodyParser from "body-parser";



loadEnv(process.env.NODE_ENV || 'development', process.cwd())
module.exports = defineConfig({
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/bens-payment",
            id: "bens-payment",
            options: {
              // provider options...
              apiKey: "...",
              capture: true,
            }
          }
        ]
      }
    }
  ],
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
})
