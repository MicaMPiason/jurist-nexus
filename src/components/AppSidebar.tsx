import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Brain, 
  Scale, 
  Briefcase, 
  Calendar, 
  Users, 
  CreditCard,
  User,
  Settings,
  LogOut,
  Bell,
  Palette,
  Globe
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarUpload } from "@/components/AvatarUpload";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Análise IA", url: "/analysis", icon: Brain },
  { title: "Processos", url: "/processes", icon: Scale },
  { title: "Serviços", url: "/services", icon: Briefcase },
  { title: "Agenda", url: "/calendar", icon: Calendar },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Cobranças", url: "/billing", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [profile, setProfile] = useState({ name: "", email: "", avatar_url: "" });
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
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('name, email, avatar_url')
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

  const handleAvatarUpdate = (url: string) => {
    setProfile(prev => ({ ...prev, avatar_url: url }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-56"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <div className={collapsed ? "p-2 flex justify-center" : "p-4"}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'} mb-6`}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">Bridge</h2>
                <p className="text-xs text-sidebar-foreground/70">Legal Management</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/70 px-4">
              Menu Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            {collapsed ? (
              <div className="flex flex-col items-center py-4">
                <Dock 
                  magnification={60} 
                  distance={100}
                  panelHeight={48}
                  className="flex-col gap-2 bg-transparent px-2"
                >
                  {items.map((item) => (
                    <DockItem key={item.title}>
                      <DockLabel>{item.title}</DockLabel>
                      <DockIcon>
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          className={({ isActive: navIsActive }) =>
                            `flex items-center justify-center w-full h-full rounded-lg transition-all duration-200 ${
                              isActive(item.url)
                                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-bridge-md"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }`
                          }
                        >
                          <item.icon className="h-5 w-5" />
                        </NavLink>
                      </DockIcon>
                    </DockItem>
                  ))}
                </Dock>
              </div>
            ) : (
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={({ isActive: navIsActive }) =>
                          `flex items-center gap-3 px-4 mx-2 py-3 rounded-lg transition-all duration-200 ${
                            isActive(item.url)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-bridge-md"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Account Section */}
        <div className="mt-auto border-t border-sidebar-border p-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                className={`w-full ${collapsed ? "p-2 justify-center" : "p-3 justify-start gap-3"} h-auto`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.name 
                      ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : user?.email?.[0].toUpperCase() || ""
                    }
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col items-start text-left w-full min-w-0 px-2">
                    <span className="text-sm font-medium w-full max-w-full truncate">
                      {profile.name 
                        ? profile.name.split(' ').length > 1 
                          ? `${profile.name.split(' ')[0]} ${profile.name.split(' ').slice(-1)[0]}`
                          : profile.name
                        : "Usuário"
                      }
                    </span>
                    <span className="text-[10px] text-muted-foreground w-full max-w-full truncate">
                      {user?.email}
                    </span>
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-96 p-0" 
              align={collapsed ? "start" : "end"}
              side={collapsed ? "right" : "top"}
            >
              <Tabs defaultValue="profile" className="w-full">
                <div className="p-4 pb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <AvatarUpload
                      currentAvatarUrl={profile.avatar_url}
                      userId={user.id}
                      userInitials={profile.name 
                        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
                        : user?.email?.[0].toUpperCase() || ""
                      }
                      onAvatarUpdate={handleAvatarUpdate}
                    />
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
                            <Label className="text-xs font-medium">Perfil Visível</Label>
                            <p className="text-xs text-muted-foreground">Outros usuários podem ver seu perfil</p>
                          </div>
                          <Switch
                            checked={settings.privacy.profileVisible}
                            onCheckedChange={(value) => updateSettings('privacy', 'profileVisible', value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-xs font-medium">Compartilhar Dados</Label>
                            <p className="text-xs text-muted-foreground">Permitir análise anônima de uso</p>
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
      </SidebarContent>
    </Sidebar>
  );
}