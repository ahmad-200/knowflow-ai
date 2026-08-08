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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome section */}
      <div className="rounded-2xl bg-muted/50 p-6 lg:p-8">
        <div className="space-y-4">
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload a document and start asking questions.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button onClick={() => navigate("/documents")} variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload a document
            </Button>
            <Button onClick={() => navigate("/chat")} size="sm">
              <MessageSquareText className="mr-2 h-4 w-4" />
              Start a chat
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
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

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
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
          <h2 className="font-heading text-lg font-bold text-foreground">
            Recent chats
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
                className="w-full flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors duration-150 cursor-pointer text-left"
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
          <Card>
            <CardContent className="p-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                  <MessageSquareText className="h-7 w-7 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                No chats yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Upload a document, then start a conversation to ask questions and get instant answers.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => navigate("/documents")} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF
                </Button>
                <Button onClick={() => navigate("/chat")}>
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