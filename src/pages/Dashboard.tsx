import { Scale, Clock, Calendar, CheckSquare, Upload, FileText, Brain } from "lucide-react";
import { MetricsCard } from "@/components/MetricsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const metrics = [
    {
      title: "Processos Ativos",
      value: "2",
      icon: Scale,
      variant: "primary" as const,
    },
    {
      title: "Prazos para Hoje",
      value: "1",
      icon: Clock,
      variant: "warning" as const,
    },
    {
      title: "Audiências na Semana",
      value: "0",
      icon: Calendar,
      variant: "default" as const,
    },
    {
      title: "Tarefas Pendentes",
      value: "3",
      icon: CheckSquare,
      variant: "success" as const,
    },
  ];

  const upcomingTasks = [
    {
      client: "Maria da Silva",
      deadline: "23/08/2025",
      type: "Tarefa",
      process: "Ação Judicial 2312131",
      task: "Conferir documentos",
      priority: "high",
    },
    {
      client: "Maria da Silva",
      deadline: "24/08/2025",
      type: "Tarefa",
      process: "Ação Judicial 2312131",
      task: "Reunião de alinhamento",
      priority: "medium",
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
        {metrics.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Calendar */}
        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="hidden sm:inline">Agenda do Mês - Agosto 2025</span>
              <span className="sm:hidden">Agosto 2025</span>
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
                const date = i - 5; // Adjust for month start
                const hasEvent = [20, 21, 23, 25, 26].includes(date);
                const isToday = date === 19;
                
                if (date < 1 || date > 31) {
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
              • 7 eventos este mês
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
                <span className="text-xs md:text-sm font-medium">1</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-accent rounded-full"></div>
                  <span className="text-xs md:text-sm">Aguardando Audiência</span>
                </div>
                <span className="text-xs md:text-sm font-medium">1</span>
              </div>
              <div className="mt-3 md:mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary w-1/2 transition-all duration-300"></div>
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