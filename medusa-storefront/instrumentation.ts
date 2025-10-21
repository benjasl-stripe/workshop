// This file runs before any other code in Next.js
// It's the perfect place to polyfill localStorage for server-side rendering

export function register() {
  // Only run on server-side
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
}

