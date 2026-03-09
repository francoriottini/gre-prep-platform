import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/auth";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

const updateSchema = z.object({
  id: z.string().uuid(),
  reviewer_1: z.string().uuid().nullable().optional(),
  reviewer_2: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "reviewed", "published"]).optional()
});

export async function GET(request: Request) {
  if (!isAdminRequest(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const supabase = createSupabaseServiceClient();

  let query = supabase
    .from("questions")
    .select(
      "id, topic, subtopic, difficulty, stem, status, reviewer_1, reviewer_2, created_at, published_at"
    )
    .eq("section", "quant")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status === "draft" || status === "reviewed" || status === "published") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] }, { status: 200 });
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const supabase = createSupabaseServiceClient();

  const patch: Record<string, unknown> = {};
  if ("reviewer_1" in payload) {
    patch.reviewer_1 = payload.reviewer_1 ?? null;
  }
  if ("reviewer_2" in payload) {
    patch.reviewer_2 = payload.reviewer_2 ?? null;
  }
  if (payload.status) {
    patch.status = payload.status;
    patch.published_at = payload.status === "published" ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from("questions")
    .update(patch)
    .eq("id", payload.id)
    .select("id, status, reviewer_1, reviewer_2, published_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 200 });
}
