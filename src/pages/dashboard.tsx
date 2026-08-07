import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquareText,
  ArrowRight,
  Upload,
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
  const recentSessions = sessions.filter((s) => s.messages.length > 0).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Welcome back 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Ask questions about your documents and get instant answers.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/documents")}
          className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Upload a document</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Add a PDF to the knowledge base
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </button>

        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-200 cursor-pointer group text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <MessageSquareText className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Start a new chat</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ask about your documents
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{readyDocs.length}</p>
                )}
                <p className="text-xs text-muted-foreground">Documents ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
                )}
                <p className="text-xs text-muted-foreground">Chat sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{documents.length}</p>
                )}
                <p className="text-xs text-muted-foreground">Total uploaded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent chats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Recent chats
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chat")}
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/chat/${session.id}`)}
                className="w-full flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:shadow-sm hover:border-primary/20 transition-all duration-200 cursor-pointer text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.messages.length} messages ·{" "}
                    {formatRelativeTime(session.created_at)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquareText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No chats yet. Start a new conversation!
              </p>
              <Button
                variant="accent"
                size="sm"
                className="mt-4"
                onClick={() => navigate("/chat")}
              >
                Start a chat
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}