import { createSupabaseAnonServerClient } from "@/lib/supabase-server";

type HeaderReader = {
  get(name: string): string | null;
};

export function extractBearerToken(headers: HeaderReader): string | null {
  const authHeader = headers.get("authorization");
  if (!authHeader) {
    return null;
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token.trim();
}

export async function getAuthenticatedUserId(headers: HeaderReader): Promise<string | null> {
  const token = extractBearerToken(headers);
  if (!token) {
    return null;
  }

  const supabase = createSupabaseAnonServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}

export function isAdminRequest(headers: HeaderReader): boolean {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return false;
  }
  const provided = headers.get("x-admin-key");
  return provided === expected;
}
