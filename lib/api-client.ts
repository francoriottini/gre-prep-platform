"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await getAccessToken();
  const headers = new Headers(init.headers ?? {});
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers
  });
}
