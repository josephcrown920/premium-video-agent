import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

function isNewKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function supabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (isNewKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

export type AuthedContext = {
  userId: string;
  supabase: ReturnType<typeof createClient<Database>>;
  accessToken: string;
};

/** Validates the bearer token on a raw server-route Request. */
export async function authenticateRequest(request: Request): Promise<AuthedContext | null> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (token.split(".").length !== 3) return null;

  const supabase = createClient<Database>(url, key, {
    global: { fetch: supabaseFetch(key), headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { userId: data.claims.sub, supabase, accessToken: token };
}
