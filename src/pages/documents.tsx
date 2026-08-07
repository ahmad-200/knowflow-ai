import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  fetchDocuments,
  deleteDocument,
  uploadDocument,
  type Document,
} from "../lib/api";
import { formatRelativeTime } from "../lib/utils";

const statusConfig = {
  processing: {
    icon: Clock,
    label: "Processing",
    variant: "warning" as const,
  },
  ready: {
    icon: CheckCircle2,
    label: "Ready",
    variant: "success" as const,
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    variant: "destructive" as const,
  },
};

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success(`Deleted "${title}"`);
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 50 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 50 MB.");
        return;
      }

      setUploading(true);
      setUploadProgress("Uploading to storage...");

      try {
        const title = file.name.replace(/\.pdf$/i, "");
        setUploadProgress("Processing document...");
        const doc = await uploadDocument(file, title);
        setDocuments((prev) => [doc, ...prev]);
        setUploadOpen(false);
        toast.success(`"${title}" uploaded successfully`, {
          action: {
            label: "Go to Chat",
            onClick: () => navigate("/chat"),
          },
          duration: 6000,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed. Please try again.";
        toast.error(message);
      } finally {
        setUploading(false);
        setUploadProgress(null);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your PDF documents
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : documents.length > 0 ? (
        <>
          {/* Status summary */}
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <strong className="text-foreground">{documents.length}</strong> total
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>{documents.filter((d) => d.status === "ready").length} ready</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>{documents.filter((d) => d.status === "processing").length} processing</span>
              </span>
            </div>
            {documents.some((d) => d.status === "ready") && (
              <Button size="sm" onClick={() => navigate("/chat")}>
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Ask questions in Chat
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {documents.map((doc) => {
              const status = statusConfig[doc.status];
              const StatusIcon = status.icon;
              return (
                <Card key={doc.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{doc.file_name}</span>
                        {doc.page_count != null && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>{doc.page_count} pages</span>
                          </>
                        )}
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{formatRelativeTime(doc.created_at)}</span>
                      </div>
                    </div>
                    <Badge variant={status.variant}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                    {doc.status === "ready" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => navigate("/chat")}
                      >
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                        Ask
                      </Button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">
              No documents yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload your first PDF to start asking questions.
            </p>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload your first PDF
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={(open) => !uploading && setUploadOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload PDF</DialogTitle>
            <DialogDescription>
              Select a PDF file to add to your knowledge base (max 50 MB).
            </DialogDescription>
          </DialogHeader>

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{uploadProgress}</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              {isDragActive ? (
                <p className="text-sm font-medium text-primary">Drop your PDF here</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Drag & drop your PDF here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse files
                  </p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}