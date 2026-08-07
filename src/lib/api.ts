// Real API layer for KnowFlow AI — connects to Supabase + Edge Functions
import { supabase } from "./supabase";

const EDGE_FUNCTION_URL =
  "https://zibbybksaogdqqycqyrw.supabase.co/functions/v1";

export interface Document {
  id: string;
  title: string;
  file_name: string;
  status: "processing" | "ready" | "error";
  page_count: number | null;
  uploaded_by: string;
  created_at: string;
}

export interface Citation {
  chunkId?: string;
  documentId?: string;
  documentTitle?: string;
  document_name: string;
  page_number: number;
  snippet: string;
  excerpt?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
}

// --- Helpers ---

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// --- Documents ---

export async function fetchDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    file_name: d.file_name,
    status: d.status as Document["status"],
    page_count: d.page_count,
    uploaded_by: d.user_id,
    created_at: d.created_at,
  }));
}

export async function deleteDocument(id: string): Promise<void> {
  // Get the storage path first
  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("storage_path, file_name")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  // Delete from storage
  if (doc?.storage_path) {
    await supabase.storage.from("documents").remove([doc.storage_path]);
  }

  // Delete from table (RLS + cascade handles chunks)
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function uploadDocument(
  file: File,
  title: string
): Promise<Document> {
  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("You must be logged in to upload");

  // 1. Upload file to storage — use user_id folder (required by RLS)
  const filePath = `${user.id}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      contentType: file.type || "application/pdf",
      cacheControl: "3600",
    });

  if (uploadError) throw new Error(uploadError.message);

  // 2. Create document record with user_id (required by RLS)
  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({
      title,
      user_id: user.id,
      file_name: file.name,
      file_type: file.type || "application/pdf",
      file_size: file.size,
      storage_path: filePath,
      status: "processing",
    })
    .select()
    .single();

  if (insertError) {
    // Cleanup storage on failure
    await supabase.storage.from("documents").remove([filePath]);
    throw new Error(insertError.message);
  }

  // 3. Trigger document processing (fire-and-forget)
  try {
    const headers = await getAuthHeaders();
    await fetch(`${EDGE_FUNCTION_URL}/process-document`, {
      method: "POST",
      headers,
      body: JSON.stringify({ documentId: doc.id }),
    });
  } catch {
    // Processing failure won't block the upload — document stays as "processing"
    console.warn("Failed to trigger document processing");
  }

  return {
    id: doc.id,
    title: doc.title,
    file_name: doc.file_name,
    status: doc.status as Document["status"],
    page_count: doc.page_count,
    uploaded_by: doc.user_id,
    created_at: doc.created_at,
  };
}

// --- Chat Sessions ---

export async function fetchSessions(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Fetch message counts per session (optimised)
  const sessionIds = (data ?? []).map((s) => s.id);
  const counts: Record<string, number> = {};
  if (sessionIds.length > 0) {
    const { data: msgData } = await supabase
      .from("chat_messages")
      .select("session_id")
      .in("session_id", sessionIds);
    for (const m of msgData ?? []) {
      counts[m.session_id] = (counts[m.session_id] ?? 0) + 1;
    }
  }

  return (data ?? []).map((s) => ({
    id: s.id,
    title: s.title ?? "New chat",
    messages: Array.from({ length: counts[s.id] ?? 0 }),
    created_at: s.created_at,
  }));
}

export async function fetchSessionMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((m) => ({
    id: m.id,
    role: m.role as ChatMessage["role"],
    content: m.content,
    citations: m.citations ?? undefined,
    created_at: m.created_at,
  }));
}

export async function createSession(): Promise<ChatSession> {
  // Get the current user (required by RLS — user_id column must match auth.uid())
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("You must be logged in to create a chat");

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ title: "New chat", user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    title: data.title ?? "New chat",
    messages: [],
    created_at: data.created_at,
  };
}

// --- Chat (RAG) ---

export async function streamChatResponse(
  question: string,
  sessionId: string,
  onToken: (token: string) => void
): Promise<Citation[]> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${EDGE_FUNCTION_URL}/rag-chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: question,
      sessionId,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(errBody || "RAG chat request failed");
  }

  const data = await response.json();

  // Simulate streaming by breaking the answer into words
  const words = data.answer.split(" ");
  for (let i = 0; i < words.length; i++) {
    onToken((i > 0 ? " " : "") + words[i]);
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
  }

  // Map citations to the expected format
  const citations: Citation[] = (data.citations ?? []).map(
    (c: { documentTitle?: string; excerpt?: string; documentId?: string }) => ({
      document_name: c.documentTitle ?? "Document",
      page_number: 1,
      snippet: c.excerpt ?? "",
    })
  );

  return citations;
}