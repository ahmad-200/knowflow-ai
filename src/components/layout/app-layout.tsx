import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  MessageSquareText,
  Menu,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth } from "../../lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/chat", label: "Chat", icon: MessageSquareText },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/60 transition-all duration-300 bg-dot-grid-light",
          sidebarOpen ? "w-64" : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20">
              KF
            </div>
            {sidebarOpen && (
              <span className="font-heading font-bold text-lg text-foreground">
                KnowFlow AI
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <div key={item.to} className="relative">
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
                )}
                <Link
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02]"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User area */}
        <div className="p-3 border-t border-border/60">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted/70 transition-colors duration-150 cursor-pointer">
                <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-150">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-foreground">
                  {user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || ""}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 backdrop-blur-sm px-4 lg:px-6">
          {/* Decorative bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-muted transition-colors cursor-pointer group">
                <Avatar className="h-7 w-7 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-150">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-foreground">
                  {user?.email?.split("@")[0] || "User"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-foreground">{user?.email?.split("@")[0] || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}