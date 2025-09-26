import { useState } from "react";
import { 
  LayoutDashboard, 
  Brain, 
  Scale, 
  Briefcase, 
  Calendar, 
  Users, 
  CreditCard 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

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
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

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
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive: navIsActive }) =>
                        `flex items-center ${collapsed ? "justify-center px-0 mx-1" : "gap-3 px-4 mx-2"} py-3 rounded-lg transition-all duration-200 ${
                          isActive(item.url)
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-bridge-md"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}