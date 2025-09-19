import { Plus, Search, Briefcase, Clock, CheckCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MetricsCard } from "@/components/MetricsCard";

export default function Services() {
  const metrics = [
    {
      title: "Total de Serviços",
      value: "1",
      icon: Briefcase,
      variant: "primary" as const,
    },
    {
      title: "Em Execução",
      value: "0",
      icon: Clock,
      variant: "warning" as const,
    },
    {
      title: "Finalizados",
      value: "0",
      icon: CheckCircle,
      variant: "success" as const,
    },
  ];

  const services = [
    {
      id: "1",
      service: "Elaboração de contrato",
      client: "Maria da Silva",
      value: "R$ 1,23",
      nextTask: "20/10/2025 - Tarefa",
      status: "A fazer",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "a fazer":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">A fazer</Badge>;
      case "em execução":
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Em execução</Badge>;
      case "finalizado":
        return <Badge variant="secondary" className="bg-accent/10 text-accent">Finalizado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground">
            Gestão de serviços jurídicos prestados
          </p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-bridge-glow transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-bridge-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar serviços..." 
                className="w-full pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="a_fazer">A fazer</SelectItem>
                <SelectItem value="em_execucao">Em execução</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Buscar cliente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                <SelectItem value="maria">Maria da Silva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Services Table */}
      <Card className="shadow-bridge-sm">
        <CardHeader>
          <CardTitle>Serviços</CardTitle>
          <CardDescription>
            Lista de todos os serviços ({services.length} serviço{services.length !== 1 ? 's' : ''})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Serviço
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Valor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Próxima Tarefa
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{service.service}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{service.client}</td>
                    <td className="py-3 px-4 text-sm font-medium text-accent">{service.value}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{service.nextTask}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(service.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Concluir
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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