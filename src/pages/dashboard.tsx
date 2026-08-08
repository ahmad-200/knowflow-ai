import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquareText,
  ArrowRight,
  Upload,
  Sparkles,
  BookOpen,
  LayoutDashboard,
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
      {/* Welcome section — animated gradient hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/[0.04] via-primary/[0.01] to-background p-6 lg:p-8 animate-fade-in">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-accent/[0.03] to-primary/[0.02] animate-gradient-x bg-[length:200%_100%] pointer-events-none" />

        {/* Decorative floating circles */}
        <div className="absolute top-4 right-12 w-24 h-24 rounded-full bg-gradient-to-br from-primary/[0.06] to-transparent animate-float pointer-events-none" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-8 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent/[0.05] to-transparent animate-float pointer-events-none" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-8 w-10 h-10 rounded-full bg-gradient-to-br from-primary/[0.04] to-transparent animate-float pointer-events-none" style={{ animationDelay: "3s" }} />

        <div className="relative space-y-6">
          {/* Welcome greeting */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-on-primary shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight gradient-text drop-shadow-sm">
                Welcome back
              </h1>
            </div>
          </div>

          {/* Inline action chips */}
          <p className="text-sm text-muted-foreground -mb-1">
            Where would you like to go?
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="group inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-lg px-4 py-2 text-sm font-medium text-foreground shadow-glass hover:shadow-glass-lg hover:bg-white/90 hover:border-primary/30 hover:scale-105 active:scale-[0.97] transition-all duration-200 cursor-pointer border border-white/20 stagger-1"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/documents")}
              className="group inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-lg px-4 py-2 text-sm font-medium text-foreground shadow-glass hover:shadow-glass-lg hover:bg-white/90 hover:border-primary/30 hover:scale-105 active:scale-[0.97] transition-all duration-200 cursor-pointer border border-white/20 stagger-2"
            >
              <Upload className="h-4 w-4 text-primary" />
              <span>Documents</span>
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="group inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-lg px-4 py-2 text-sm font-medium text-foreground shadow-glass hover:shadow-glass-lg hover:bg-white/90 hover:border-accent/30 hover:scale-105 active:scale-[0.97] transition-all duration-200 cursor-pointer border border-white/20 stagger-3"
            >
              <MessageSquareText className="h-4 w-4 text-accent" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-darker rounded-xl p-5 hover:-translate-y-1 hover:shadow-glass-lg transition-all duration-300 animate-fade-in stagger-1">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-7 w-12 rounded-md" />
              ) : (
                <p className="text-2xl font-bold text-foreground tabular-nums">{readyDocs.length}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">Documents ready</p>
            </div>
          </div>
        </div>

        <div className="glass-darker rounded-xl p-5 hover:-translate-y-1 hover:shadow-glass-lg transition-all duration-300 animate-fade-in stagger-2">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 text-accent">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-7 w-12 rounded-md" />
              ) : (
                <p className="text-2xl font-bold text-foreground tabular-nums">{sessions.length}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">Chat sessions</p>
            </div>
          </div>
        </div>

        <div className="glass-darker rounded-xl p-5 hover:-translate-y-1 hover:shadow-glass-lg transition-all duration-300 animate-fade-in stagger-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-7 w-12 rounded-md" />
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
        </div>
      </div>

      {/* Recent chats */}
      <div className="animate-fade-in stagger-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Recent chats
            </h2>
            <div className="h-px flex-1 w-20 bg-gradient-to-r from-border to-transparent hidden sm:block" />
          </div>
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
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="space-y-2">
            {recentSessions.map((session, idx) => (
              <button
                key={session.id}
                onClick={() => navigate(`/chat/${session.id}`)}
                className="w-full flex items-center gap-3 rounded-xl border border-white/20 bg-white/85 backdrop-blur-xl p-4 hover:shadow-glass-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left group"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/50 group-hover:from-primary/10 group-hover:to-primary/5 transition-colors duration-200">
                  <MessageSquareText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
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
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <Card className="glass-darker border-white/20 shadow-glass hover:shadow-glass-lg transition-all duration-300">
            <CardContent className="p-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 animate-float">
                  <MessageSquareText className="h-8 w-8 text-primary" />
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
                <Button onClick={() => navigate("/chat")} variant="accent">
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