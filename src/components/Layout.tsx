import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Bell, Palette, Globe, Clock } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      deadlines: true,
      hearings: true,
      newProcesses: true
    },
    display: {
      theme: "system",
      language: "pt-BR",
      timezone: "America/Sao_Paulo"
    },
    privacy: {
      profileVisible: false,
      dataSharing: false
    }
  });

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

  const updateSettings = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    
    toast({
      title: "Configuração salva!",
      description: "Suas preferências foram atualizadas.",
    });
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
                  <PopoverContent className="w-96 p-0" align="end">
                    <Tabs defaultValue="profile" className="w-full">
                      <div className="p-4 pb-0">
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

                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="profile" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs">Perfil</span>
                          </TabsTrigger>
                          <TabsTrigger value="settings" className="flex items-center gap-1">
                            <Settings className="h-3 w-3" />
                            <span className="text-xs">Configurações</span>
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="profile" className="p-4 pt-4 m-0">
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
                      </TabsContent>

                      <TabsContent value="settings" className="p-4 pt-4 m-0 max-h-80 overflow-y-auto">
                        <div className="space-y-6">
                          {/* Notificações */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Bell className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-sm">Notificações</h4>
                            </div>
                            <div className="space-y-3 ml-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-xs font-medium">E-mail</Label>
                                  <p className="text-xs text-muted-foreground">Receber notificações por e-mail</p>
                                </div>
                                <Switch
                                  checked={settings.notifications.email}
                                  onCheckedChange={(value) => updateSettings('notifications', 'email', value)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-xs font-medium">Prazos</Label>
                                  <p className="text-xs text-muted-foreground">Alertas de prazos próximos</p>
                                </div>
                                <Switch
                                  checked={settings.notifications.deadlines}
                                  onCheckedChange={(value) => updateSettings('notifications', 'deadlines', value)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-xs font-medium">Audiências</Label>
                                  <p className="text-xs text-muted-foreground">Lembretes de audiências</p>
                                </div>
                                <Switch
                                  checked={settings.notifications.hearings}
                                  onCheckedChange={(value) => updateSettings('notifications', 'hearings', value)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-xs font-medium">Novos Processos</Label>
                                  <p className="text-xs text-muted-foreground">Notificar novos processos</p>
                                </div>
                                <Switch
                                  checked={settings.notifications.newProcesses}
                                  onCheckedChange={(value) => updateSettings('notifications', 'newProcesses', value)}
                                />
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Aparência */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Palette className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-sm">Aparência</h4>
                            </div>
                            <div className="space-y-3 ml-6">
                              <div>
                                <Label className="text-xs font-medium mb-2 block">Tema</Label>
                                <Select 
                                  value={settings.display.theme} 
                                  onValueChange={(value) => updateSettings('display', 'theme', value)}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="light">Claro</SelectItem>
                                    <SelectItem value="dark">Escuro</SelectItem>
                                    <SelectItem value="system">Sistema</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Localização */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Globe className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-sm">Localização</h4>
                            </div>
                            <div className="space-y-3 ml-6">
                              <div>
                                <Label className="text-xs font-medium mb-2 block">Idioma</Label>
                                <Select 
                                  value={settings.display.language} 
                                  onValueChange={(value) => updateSettings('display', 'language', value)}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                    <SelectItem value="en-US">English (US)</SelectItem>
                                    <SelectItem value="es-ES">Español</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs font-medium mb-2 block">Fuso Horário</Label>
                                <Select 
                                  value={settings.display.timezone} 
                                  onValueChange={(value) => updateSettings('display', 'timezone', value)}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                                    <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                                    <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Privacidade */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <User className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-sm">Privacidade</h4>
                            </div>
                            <div className="space-y-3 ml-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-xs font-medium">Perfil Público</Label>
                                  <p className="text-xs text-muted-foreground">Tornar perfil visível para outros</p>
                                </div>
                                <Switch
                                  checked={settings.privacy.profileVisible}
                                  onCheckedChange={(value) => updateSettings('privacy', 'profileVisible', value)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-xs font-medium">Compartilhamento</Label>
                                  <p className="text-xs text-muted-foreground">Permitir análise de dados</p>
                                </div>
                                <Switch
                                  checked={settings.privacy.dataSharing}
                                  onCheckedChange={(value) => updateSettings('privacy', 'dataSharing', value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
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