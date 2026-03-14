import { createSupabaseAnonServerClient, createSupabaseServiceClient } from "@/lib/supabase-server";

type HeaderReader = {
  get(name: string): string | null;
};

export type AuthenticatedRequest = {
  accessToken: string;
  userId: string;
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

export async function getAuthenticatedRequest(
  headers: HeaderReader
): Promise<AuthenticatedRequest | null> {
  const accessToken = extractBearerToken(headers);
  if (!accessToken) {
    return null;
  }

  const supabase = createSupabaseAnonServerClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return null;
  }

  return {
    accessToken,
    userId: data.user.id
  };
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return !error && Boolean(data);
}
