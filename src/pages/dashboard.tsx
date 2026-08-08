import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquareText,
  ArrowRight,
  Upload,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { fetchDocuments, fetchSessions, type Document, type ChatSession } from "../lib/api";
import { formatRelativeTime } from "../lib/utils";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [docs, chats] = await Promise.all([
          fetchDocuments(),
          fetchSessions(),
        ]);
        setDocuments(docs);
        setSessions(chats);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const readyDocs = documents.filter((d) => d.status === "ready");
  const processingDocs = documents.filter((d) => d.status === "processing");
  const recentSessions = sessions.filter((s) => s.messages.length > 0).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome section — animated gradient hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/[0.04] via-primary/[0.02] to-accent/[0.04] p-6 lg:p-8 animate-gradient-x bg-[length:200%_200%]">
        {/* Decorative floating circles */}
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/5 animate-float" style={{ animationDelay: "0s", animationDuration: "7s" }} />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent/5 animate-float" style={{ animationDelay: "1s", animationDuration: "9s" }} />
        <div className="absolute top-1/2 right-12 h-16 w-16 rounded-full bg-primary/[0.03] animate-float" style={{ animationDelay: "2s", animationDuration: "8s" }} />

        <div className="relative space-y-4">
          <h1 className="font-heading text-2xl font-bold tracking-tight gradient-text drop-shadow-sm">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload a document and start asking questions.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              onClick={() => navigate("/documents")}
              variant="outline"
              size="sm"
              className="rounded-full bg-white/70 backdrop-blur-lg shadow-glass hover:shadow-glass-lg hover:scale-[1.05] active:scale-[0.97] transition-all duration-150"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload a document
            </Button>
            <Button
              onClick={() => navigate("/chat")}
              size="sm"
              className="rounded-full shadow-glass hover:shadow-glass-lg hover:scale-[1.05] active:scale-[0.97] transition-all duration-150"
            >
              <MessageSquareText className="mr-2 h-4 w-4" />
              Start a chat
            </Button>
          </div>
        </div>
      </div>

      {/* Stats — glass cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-darker hover:-translate-y-1 hover:shadow-glass-lg transition-all duration-300 border-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground tabular-nums">{readyDocs.length}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">Documents ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-darker hover:-translate-y-1 hover:shadow-glass-lg transition-all duration-300 border-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-shadow duration-300 hover:shadow-lg hover:shadow-accent/20">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground tabular-nums">{sessions.length}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">Chat sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-darker hover:-translate-y-1 hover:shadow-glass-lg transition-all duration-300 border-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-foreground/10 text-muted-foreground transition-shadow duration-300 hover:shadow-lg hover:shadow-muted-foreground/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground tabular-nums">{documents.length}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {processingDocs.length > 0
                    ? `${processingDocs.length} processing`
                    : "Total uploaded"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent chats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground relative">
            Recent chats
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chat")}
            className="gap-1"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/chat/${session.id}`)}
                className="w-full flex items-center gap-3 rounded-lg border border-border/60 glass-darker p-4 hover:-translate-y-0.5 hover:shadow-glass-lg hover:border-primary/20 transition-all duration-200 cursor-pointer text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.messages.length} messages ·{" "}
                    {formatRelativeTime(session.created_at)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <Card className="glass-darker border-none">
            <CardContent className="p-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted animate-float">
                  <MessageSquareText className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                No chats yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Upload a document, then start a conversation to ask questions and get instant answers.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => navigate("/documents")} variant="outline" className="rounded-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF
                </Button>
                <Button onClick={() => navigate("/chat")} className="rounded-full">
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  Start chatting
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}