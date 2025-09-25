import { useEffect, useState } from "react";
import { Scale, Clock, Calendar, CheckSquare } from "lucide-react";
import { MetricsCard } from "@/components/MetricsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, isAfter, isBefore, addDays, startOfWeek, endOfWeek, isSameDay, getDaysInMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardMetrics {
  activeProcesses: number;
  duesToday: number;
  hearingsThisWeek: number;
  pendingTasks: number;
}

interface UpcomingTask {
  client: string;
  deadline: string;
  type: string;
  process: string;
  task: string;
  priority: string;
  date: Date;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeProcesses: 0,
    duesToday: 0,
    hearingsThisWeek: 0,
    pendingTasks: 0,
  });
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [monthlyEvents, setMonthlyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar processos
      const { data: processes } = await supabase
        .from('processes')
        .select(`
          id,
          number,
          subject,
          status,
          created_at,
          clients:client_id (name)
        `)
        .eq('user_id', user.id);

      // Buscar serviços
      const { data: services } = await supabase
        .from('services')
        .select(`
          id,
          name,
          next_task_date,
          next_task,
          status,
          clients:client_id (name)
        `)
        .eq('user_id', user.id);

      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      const monthStart = startOfMonth(today);

      // Calcular métricas
      const activeProcesses = processes?.filter(p => p.status === 'em_andamento').length || 0;
      
      const tasksToday = services?.filter(s => 
        s.next_task_date && isSameDay(parseISO(s.next_task_date), today)
      ).length || 0;

      const pendingTasks = services?.filter(s => 
        s.next_task_date && isAfter(parseISO(s.next_task_date), today)
      ).length || 0;

      setMetrics({
        activeProcesses,
        duesToday: tasksToday,
        hearingsThisWeek: 0, // Placeholder - can be extended with hearing data
        pendingTasks,
      });

      // Preparar próximas tarefas
      const tasks: UpcomingTask[] = [];
      services?.forEach((service: any) => {
        if (service.next_task_date && service.next_task) {
          const taskDate = parseISO(service.next_task_date);
          tasks.push({
            client: service.clients?.name || 'Cliente não informado',
            deadline: format(taskDate, 'dd/MM/yyyy', { locale: ptBR }),
            type: 'Serviço',
            process: service.name,
            task: service.next_task,
            priority: isSameDay(taskDate, today) ? 'high' : isAfter(taskDate, addDays(today, 7)) ? 'low' : 'medium',
            date: taskDate,
          });
        }
      });

      // Ordenar por data
      tasks.sort((a, b) => a.date.getTime() - b.date.getTime());
      setUpcomingTasks(tasks.slice(0, 5));

      // Preparar eventos do mês para o calendário
      const events: any[] = [];
      services?.forEach((service: any) => {
        if (service.next_task_date) {
          const taskDate = parseISO(service.next_task_date);
          if (taskDate >= monthStart) {
            events.push({
              date: taskDate,
              type: 'service',
              title: service.next_task || service.name,
            });
          }
        }
      });

      setMonthlyEvents(events);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM yyyy', { locale: ptBR });

  const metricsData = [
    {
      title: "Processos Ativos",
      value: metrics.activeProcesses.toString(),
      icon: Scale,
      variant: "primary" as const,
    },
    {
      title: "Prazos para Hoje",
      value: metrics.duesToday.toString(),
      icon: Clock,
      variant: "warning" as const,
    },
    {
      title: "Audiências na Semana",
      value: metrics.hearingsThisWeek.toString(),
      icon: Calendar,
      variant: "default" as const,
    },
    {
      title: "Tarefas Pendentes",
      value: metrics.pendingTasks.toString(),
      icon: CheckSquare,
      variant: "success" as const,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Visão geral dos seus processos e atividades jurídicas
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {metricsData.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Calendar */}
        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="hidden sm:inline">Agenda do Mês - {currentMonth}</span>
              <span className="sm:hidden">{format(currentDate, 'MMM yyyy', { locale: ptBR })}</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Próximos eventos e prazos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-3 md:mb-4">
              {/* Days of week header */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                <div key={day} className="text-center text-[10px] md:text-xs text-muted-foreground font-medium py-1 md:py-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
              
              {/* Calendar grid */}
              {Array.from({ length: 35 }, (_, i) => {
                const daysInMonth = getDaysInMonth(currentDate);
                const monthStart = startOfMonth(currentDate);
                const startDay = monthStart.getDay();
                const date = i - startDay + 1;
                const today = new Date();
                const isToday = date > 0 && date <= daysInMonth && isSameDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), date), today);
                
                const dayEvents = monthlyEvents.filter(event => 
                  date > 0 && date <= daysInMonth && 
                  isSameDay(event.date, new Date(currentDate.getFullYear(), currentDate.getMonth(), date))
                );
                
                const hasEvent = dayEvents.length > 0;
                
                if (date < 1 || date > daysInMonth) {
                  return <div key={i} className="h-6 md:h-8"></div>;
                }
                
                return (
                  <div key={i} className="h-6 md:h-8 flex items-center justify-center relative">
                    <span className={`text-xs md:text-sm font-medium ${
                      isToday 
                        ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-[10px] md:text-xs' 
                        : 'text-foreground hover:bg-muted/50 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center transition-colors'
                    }`}>
                      {date}
                    </span>
                    {hasEvent && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center text-[10px] md:text-xs text-muted-foreground">
              • {monthlyEvents.length} evento{monthlyEvents.length !== 1 ? 's' : ''} este mês
            </div>
          </CardContent>
        </Card>

        {/* Status Chart */}
        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full"></div>
                  <span className="text-xs md:text-sm">Em Andamento</span>
                </div>
                <span className="text-xs md:text-sm font-medium">{metrics.activeProcesses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-accent rounded-full"></div>
                  <span className="text-xs md:text-sm">Tarefas Pendentes</span>
                </div>
                <span className="text-xs md:text-sm font-medium">{metrics.pendingTasks}</span>
              </div>
              <div className="mt-3 md:mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary transition-all duration-300" style={{
                  width: `${metrics.activeProcesses + metrics.pendingTasks > 0 ? (metrics.activeProcesses / (metrics.activeProcesses + metrics.pendingTasks)) * 100 : 0}%`
                }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card className="shadow-bridge-sm">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Próximos Prazos e Tarefas</CardTitle>
          <CardDescription className="text-xs md:text-sm">Acompanhe suas próximas atividades</CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">
                    Prazo
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    Processo/Serviço
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">
                    Tarefa
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingTasks.map((task, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium">{task.client}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-warning">{task.deadline}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4">
                      <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0.5">
                        {task.type}
                      </Badge>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-muted-foreground hidden sm:table-cell">{task.process}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4">
                      <div className="text-xs md:text-sm">{task.task}</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground sm:hidden mt-1">{task.process}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}