// types/next-headers.d.ts
declare module 'next/headers' {
  export function cookies(): {
    get(name: string): { name: string; value: string } | undefined;
    getAll(): Array<{ name: string; value: string }>;
    set(name: string, value: string, options?: any): void;
    // Add other methods as needed
  };
  
  export function headers(): Headers;
  
  // Add other exports from next/headers
}