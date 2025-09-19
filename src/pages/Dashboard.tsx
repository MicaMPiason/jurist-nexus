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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos seus processos e atividades jurídicas
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Upload Area */}
        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Analisar Documento Jurídico
            </CardTitle>
            <CardDescription>
              IA extrairá informações automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-gradient-subtle">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Arraste e solte um arquivo PDF ou clique para selecionar
              </p>
              <Button variant="outline" className="mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
              <p className="text-xs text-muted-foreground">
                Máximo 10MB, apenas PDFs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Chart */}
        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <span className="text-sm">Em Andamento</span>
                </div>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-accent rounded-full"></div>
                  <span className="text-sm">Aguardando Audiência</span>
                </div>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card className="shadow-bridge-sm">
        <CardHeader>
          <CardTitle>Próximos Prazos e Tarefas</CardTitle>
          <CardDescription>Acompanhe suas próximas atividades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Prazo Final
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Processo/Serviço
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Tarefa
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingTasks.map((task, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm">{task.client}</td>
                    <td className="py-3 px-4 text-sm font-medium">{task.deadline}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-xs">
                        {task.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{task.process}</td>
                    <td className="py-3 px-4 text-sm">{task.task}</td>
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