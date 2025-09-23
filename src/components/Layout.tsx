import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === "/auth";

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      navigate("/auth");
    }
  }, [user, loading, isAuthPage, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't show sidebar on auth page
  if (isAuthPage || !user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card px-6 shadow-bridge-sm">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-primary">Bridge</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão Jurídica</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Olá, {user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </header>
          <div className="flex-1 p-6 bg-background">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}