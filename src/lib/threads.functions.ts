import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type StoredMessage = {
  id: string;
  role: string;
  parts: Json[];
};

export type ThreadSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ThreadSummary[]> => {
    const { data, error } = await context.supabase
      .from("threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((t) => ({ id: t.id, title: t.title, updatedAt: t.updated_at }));
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ThreadSummary> => {
    const { data, error } = await context.supabase
      .from("threads")
      .insert({ user_id: context.userId })
      .select("id, title, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id, title: data.title, updatedAt: data.updated_at };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("threads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string(), title: z.string().trim() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("threads")
      .update({ title: data.title || "New conversation" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: thread, error } = await context.supabase
      .from("threads")
      .select("id, title, updated_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!thread) return null;

    const { data: rows, error: rowsError } = await context.supabase
      .from("messages")
      .select("id, role, parts, created_at")
      .eq("thread_id", data.id)
      .order("created_at", { ascending: true });
    if (rowsError) throw new Error(rowsError.message);

    const messages: StoredMessage[] = (rows ?? []).map((row) => ({
      id: row.id,
      role: row.role,
      parts: (Array.isArray(row.parts) ? row.parts : []) as Json[],
    }));

    return {
      thread: { id: thread.id, title: thread.title, updatedAt: thread.updated_at },
      messages,
    };
  });

export const listMemories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("memories")
      .select("id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const forgetMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("memories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
