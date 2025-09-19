import { Plus, Search, Users, Edit, Trash2, MoreHorizontal, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Clients() {
  const clients = [
    {
      id: "1",
      name: "cliente teste",
      email: "teste@teste.com",
      phone: "Não informado",
      processes: "1",
      since: "19/08/2025",
    },
    {
      id: "2",
      name: "Maria da Silva",
      email: "maria@exemplo.com",
      phone: "Não informado",
      processes: "1",
      since: "02/08/2025",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Cadastro e gestão de clientes
          </p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-bridge-glow transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card className="shadow-bridge-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar clientes..." 
              className="w-full pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="shadow-bridge-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Clientes Cadastrados
          </CardTitle>
          <CardDescription>
            Total de {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
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
                    E-mail
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Telefone
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Processos
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Cliente Desde
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{client.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{client.email}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{client.phone}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        {client.processes}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{client.since}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-bridge-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold text-card-foreground">{clients.length}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-bridge-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos este Mês</p>
                <p className="text-2xl font-bold text-card-foreground">2</p>
              </div>
              <div className="p-3 bg-accent/10 text-accent rounded-lg">
                <Plus className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-bridge-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processos Ativos</p>
                <p className="text-2xl font-bold text-card-foreground">2</p>
              </div>
              <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
                <Scale className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}