import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Send,
  MessageSquareText,
  Plus,
  ChevronRight,
  Sparkles,
  FileText,
  Library,
  Bot,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  fetchSessions,
  fetchSessionMessages,
  createSession,
  streamChatResponse,
  type ChatMessage,
  type ChatSession,
} from "../lib/api";
import { formatRelativeTime, cn } from "../lib/utils";

function renderRichText(content: string): string {
  let text = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(
    /^&gt; (.*)$/gm,
    '<blockquote class="border-l-2 border-accent pl-3 my-2 text-muted-foreground italic">$1</blockquote>'
  );
  text = text.replace(/\n/g, "<br/>");
  return text;
}

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Auto-create a session when visiting /chat without one
  useEffect(() => {
    if (!sessionId && !loadingSessions) {
      createSession().then((session) => {
        setSessions((prev) => [session, ...prev]);
        navigate(`/chat/${session.id}`, { replace: true });
      });
    }
  }, [sessionId, loadingSessions, navigate]);

  // Load messages when session changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    fetchSessionMessages(sessionId)
      .then(setMessages)
      .finally(() => setLoadingMessages(false));
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedContent]);

  const handleNewSession = async () => {
    const session = await createSession();
    setSessions((prev) => [session, ...prev]);
    navigate(`/chat/${session.id}`);
  };

  const handleSendMessage = async () => {
    const question = input.trim();
    if (!question || streaming) return;

    setInput("");
    setStreaming(true);
    setStreamedContent("");

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: question,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      let fullContent = "";

      const citations = await streamChatResponse(
        question,
        sessionId!,
        (token) => {
          fullContent += token;
          setStreamedContent(fullContent);
        }
      );

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: fullContent,
        citations,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamedContent("");
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("We couldn't get an answer right now — try again?");
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-7rem)] flex gap-4 animate-fade-in">
      {/* Session list (sidebar) */}
      <aside className="hidden md:flex w-72 flex-col shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Chats
          </h2>
          <Button variant="outline" size="sm" onClick={handleNewSession}>
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>

        {loadingSessions ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-1 overflow-y-auto pr-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/chat/${session.id}`)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all duration-150 cursor-pointer",
                  session.id === sessionId
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
                    session.id === sessionId
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <MessageSquareText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.messages.length > 0
                      ? `${session.messages.length} messages · ${formatRelativeTime(session.created_at)}`
                      : "New chat"}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-150",
                    session.id === sessionId
                      ? "text-primary translate-x-0.5"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
            <MessageSquareText className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No chats yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleNewSession}
            >
              <Plus className="mr-1 h-4 w-4" />
              Start a chat
            </Button>
          </div>
        )}
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {!sessionId && !streaming ? (
              // Empty state — no session selected
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-2 tracking-tight">
                  Ask anything about your documents
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
                  KnowFlow AI searches your uploaded PDFs and answers with
                  citations so you can verify every fact.
                </p>
                <div className="w-full max-w-md space-y-2">
                  {[
                    "What is the parental leave policy?",
                    "What are the IT security requirements?",
                    "Summarize the remote work guidelines",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="group w-full text-left rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary/60 transition-colors duration-200 shrink-0" />
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                  <Library className="h-4 w-4" />
                  <span>
                    Upload PDFs in the{" "}
                    <button
                      onClick={() => navigate("/documents")}
                      className="text-primary underline-offset-2 hover:underline cursor-pointer font-medium"
                    >
                      Documents
                    </button>{" "}
                    section first, then ask questions here.
                  </span>
                </div>
              </div>
            ) : loadingMessages ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-2/3 rounded-xl" />
                <Skeleton className="h-24 w-3/4 rounded-xl" />
              </div>
            ) : messages.length === 0 && !streaming ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-2 tracking-tight">
                  Ask anything
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                  Start by asking a question below. Answers include citations so
                  you can verify the source.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {streaming && (
                  <div className="flex gap-3 animate-fade-in">
                    <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/10">
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary text-xs font-bold">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl rounded-tl-sm bg-gradient-to-br from-muted to-muted/80 px-4 py-3 text-sm text-foreground max-w-[85%] shadow-sm">
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            renderRichText(streamedContent) +
                            '<span class="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5 align-middle rounded-sm" />',
                        }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-border p-3 lg:p-4 bg-gradient-to-t from-background/50 to-transparent">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents..."
                className="flex-1 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm outline-none transition-all duration-150 focus:border-ring focus:bg-white focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50 shadow-sm"
                disabled={streaming}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || streaming}
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground/60">
              Answers are grounded in your uploaded documents
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary to-primary/90 px-4 py-3 text-sm text-on-primary shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/5">
        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary text-xs font-bold">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 max-w-[85%]">
        <div
          className="rounded-2xl rounded-tl-sm bg-gradient-to-br from-muted to-muted/80 px-4 py-3 text-sm text-foreground shadow-sm"
          dangerouslySetInnerHTML={{ __html: renderRichText(message.content) }}
        />
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.citations.map((citation, idx) => (
              <Badge key={idx} variant="outline" className="gap-1.5 py-1 hover:bg-muted transition-colors duration-150">
                <FileText className="h-3 w-3 text-muted-foreground" />
                {citation.document_name}
                <span className="text-muted-foreground">
                  · p.{citation.page_number}
                </span>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}