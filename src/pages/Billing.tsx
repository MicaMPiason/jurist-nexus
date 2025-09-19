import { Plus, Search, CreditCard, DollarSign, TrendingUp, AlertTriangle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MetricsCard } from "@/components/MetricsCard";

export default function Billing() {
  const metrics = [
    {
      title: "Receita Total",
      value: "R$ 1,23",
      icon: DollarSign,
      variant: "success" as const,
    },
    {
      title: "Contas a Receber",
      value: "R$ 1,23",
      icon: CreditCard,
      variant: "warning" as const,
    },
    {
      title: "Vencidas",
      value: "R$ 0,00",
      icon: AlertTriangle,
      variant: "destructive" as const,
    },
    {
      title: "Este Mês",
      value: "R$ 1,23",
      icon: TrendingUp,
      variant: "primary" as const,
    },
  ];

  const invoices = [
    {
      id: "1",
      client: "Maria da Silva",
      service: "Elaboração de contrato",
      amount: "R$ 1,23",
      dueDate: "20/10/2025",
      status: "Pendente",
      issueDate: "19/08/2025",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pago":
        return <Badge variant="secondary" className="bg-accent/10 text-accent">Pago</Badge>;
      case "pendente":
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Pendente</Badge>;
      case "vencida":
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Vencida</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cobranças</h1>
          <p className="text-muted-foreground">
            Gestão financeira e cobrança de serviços
          </p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-bridge-glow transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Nova Cobrança
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Filters */}
      <Card className="shadow-bridge-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar cobranças..." 
                className="w-full pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="shadow-bridge-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Cobranças e Faturas
          </CardTitle>
          <CardDescription>
            Total de {invoices.length} cobrança{invoices.length !== 1 ? 's' : ''}
          </CardDescription>
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
                    Serviço
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Valor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Data Emissão
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Vencimento
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{invoice.client}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{invoice.service}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-accent">{invoice.amount}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{invoice.issueDate}</td>
                    <td className="py-3 px-4 text-sm font-medium">{invoice.dueDate}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(invoice.status)}
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
                            <CreditCard className="h-4 w-4 mr-2" />
                            Marcar como Pago
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle>Receitas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Agosto 2025</span>
                <span className="font-medium">R$ 1,23</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Julho 2025</span>
                <span className="font-medium">R$ 0,00</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Junho 2025</span>
                <span className="font-medium">R$ 0,00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                <div>
                  <p className="text-sm font-medium">Maria da Silva</p>
                  <p className="text-xs text-muted-foreground">Elaboração de contrato</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-warning">R$ 1,23</p>
                  <p className="text-xs text-muted-foreground">20/10/2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}