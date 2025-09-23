import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === "/auth";
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      navigate("/auth");
    }
  }, [user, loading, isAuthPage, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setEditedName(data.name || "");
    }
  };

  const updateProfile = async () => {
    if (!user || !editedName.trim()) return;

    const { error } = await supabase
      .from('profiles')
      .update({ name: editedName.trim() })
      .eq('user_id', user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message,
      });
    } else {
      setProfile(prev => ({ ...prev, name: editedName.trim() }));
      setIsEditing(false);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    }
  };

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
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Olá, {profile.name || user?.email}
                </span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {profile.name 
                            ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
                            : user?.email?.[0].toUpperCase()
                          }
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block">Conta</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {profile.name 
                              ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : user?.email?.[0].toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {profile.name || "Usuário"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <Separator className="mb-4" />

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="profile-name" className="text-xs font-medium">
                            Nome
                          </Label>
                          {isEditing ? (
                            <div className="flex gap-2 mt-1">
                              <Input
                                id="profile-name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Seu nome"
                              />
                              <Button size="sm" onClick={updateProfile} className="h-8 px-2">
                                Salvar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setIsEditing(false);
                                  setEditedName(profile.name || "");
                                }}
                                className="h-8 px-2"
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm">
                                {profile.name || "Não informado"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsEditing(true)}
                                className="h-8 px-2"
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs font-medium">E-mail</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair da conta
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
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