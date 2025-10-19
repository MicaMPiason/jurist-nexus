import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === "/auth";

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      navigate("/auth");
    }
  }, [user, loading, isAuthPage, navigate]);

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
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-6 shadow-bridge-sm sticky top-0 z-10">
            <div className="flex items-center flex-1">
              <SidebarTrigger className="mr-4" />
              <div>
                <h1 className="text-lg font-semibold text-primary">Bridge</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão Jurídica</p>
              </div>
            </div>
            <ThemeSwitcher value={theme} onChange={setTheme} />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}