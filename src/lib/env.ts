import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL harus berupa URL yang valid"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY tidak boleh kosong"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
})

export const getEnv = () => {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  })

  if (!parsed.success) {
    console.error("❌ Konfigurasi Environment Variable tidak valid:", parsed.error.format())
    // Di dev mode kita log error tanpa langsung crash total agar proses setup awal tetap nyaman
    if (process.env.NODE_ENV === "production") {
      throw new Error("Konfigurasi Environment Variable gagal divalidasi")
    }
  }

  return parsed.data ?? {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  }
}

export const env = getEnv()
