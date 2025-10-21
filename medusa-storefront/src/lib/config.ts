import Medusa from "@medusajs/js-sdk"

// Mock localStorage for server-side environments
if (typeof window === "undefined") {
  const store: Record<string, string> = {}
  
  class LocalStorageMock {
    getItem(key: string): string | null {
      return store[key] || null
    }
    
    setItem(key: string, value: string): void {
      store[key] = String(value)
    }
    
    removeItem(key: string): void {
      delete store[key]
    }
    
    clear(): void {
      Object.keys(store).forEach((key) => delete store[key])
    }
    
    get length(): number {
      return Object.keys(store).length
    }
    
    key(index: number): string | null {
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
  
  // @ts-ignore - Polyfill localStorage for server-side
  globalThis.localStorage = new LocalStorageMock()
}

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  auth: {
    type: "session",
  },
})
