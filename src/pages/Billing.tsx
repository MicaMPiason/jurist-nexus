import { Plus, Search, CreditCard, DollarSign, TrendingUp, AlertTriangle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MetricsCard } from "@/components/MetricsCard";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Invoice = {
  id: string;
  client_id: string;
  client_name: string;
  service_id?: string;
  service_name?: string;
  amount: number;
  due_date: string;
  status: string;
  issue_date: string;
  description?: string;
};

type Client = {
  id: string;
  name: string;
};

export default function Billing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    status: "pendente",
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load data
  useEffect(() => {
    if (user) {
      loadInvoices();
      loadClients();
    }
  }, [user]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data: invoicesData, error } = await supabase
        .from("invoices")
        .select(`
          *,
          clients:client_id (name),
          services:service_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedInvoices = invoicesData?.map((inv: any) => ({
        id: inv.id,
        client_id: inv.client_id,
        client_name: inv.clients?.name || "Cliente não encontrado",
        service_id: inv.service_id,
        service_name: inv.services?.name || "N/A",
        amount: inv.amount,
        due_date: inv.due_date,
        status: inv.status,
        issue_date: inv.issue_date,
        description: inv.description,
      })) || [];

      setInvoices(formattedInvoices);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar cobranças",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calculate metrics
  const totalRevenue = invoices
    .filter((inv) => inv.status === "pago")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === "pendente")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueAmount = invoices
    .filter((inv) => inv.status === "vencida")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = invoices
    .filter((inv) => {
      const date = new Date(inv.issue_date);
      return (
        inv.status === "pago" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  const metrics = [
    {
      title: "Receita Total",
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      variant: "success" as const,
    },
    {
      title: "Contas a Receber",
      value: `R$ ${pendingAmount.toFixed(2)}`,
      icon: CreditCard,
      variant: "warning" as const,
    },
    {
      title: "Vencidas",
      value: `R$ ${overdueAmount.toFixed(2)}`,
      icon: AlertTriangle,
      variant: "destructive" as const,
    },
    {
      title: "Este Mês",
      value: `R$ ${monthlyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      variant: "primary" as const,
    },
  ];

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.client_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) || 
      invoice.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const handleSaveInvoice = async () => {
    if (!editingInvoice) return;

    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          client_id: editingInvoice.client_id,
          service_id: editingInvoice.service_id,
          amount: editingInvoice.amount,
          issue_date: editingInvoice.issue_date,
          due_date: editingInvoice.due_date,
          status: editingInvoice.status,
          description: editingInvoice.description,
        })
        .eq("id", editingInvoice.id);

      if (error) throw error;

      toast({
        title: "Cobrança atualizada",
        description: "A cobrança foi atualizada com sucesso.",
      });

      setIsEditDialogOpen(false);
      setEditingInvoice(null);
      loadInvoices();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cobrança",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateInvoice = async () => {
    if (!user || !newInvoice.client_id || !newInvoice.amount || !newInvoice.issue_date || !newInvoice.due_date) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("invoices").insert({
        user_id: user.id,
        client_id: newInvoice.client_id,
        service_id: newInvoice.service_id,
        amount: newInvoice.amount,
        issue_date: newInvoice.issue_date,
        due_date: newInvoice.due_date,
        status: newInvoice.status || "pendente",
        description: newInvoice.description,
      });

      if (error) throw error;

      toast({
        title: "Cobrança criada",
        description: "A cobrança foi criada com sucesso.",
      });

      setIsCreateDialogOpen(false);
      setNewInvoice({ status: "pendente" });
      loadInvoices();
    } catch (error: any) {
      toast({
        title: "Erro ao criar cobrança",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta cobrança?")) return;

    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Cobrança excluída",
        description: "A cobrança foi excluída com sucesso.",
      });

      loadInvoices();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir cobrança",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "pago" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cobrança marcada como paga",
        description: "A cobrança foi atualizada com sucesso.",
      });

      loadInvoices();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cobrança",
        description: error.message,
        variant: "destructive",
      });
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
        <Button
          className="bg-gradient-primary hover:shadow-bridge-glow transition-all duration-200"
          onClick={() => setIsCreateDialogOpen(true)}
        >
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            Total de {filteredInvoices.length} cobrança{filteredInvoices.length !== 1 ? 's' : ''}
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Nenhuma cobrança encontrada
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{invoice.client_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{invoice.service_name}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-accent">
                        R$ {invoice.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(invoice.issue_date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {new Date(invoice.due_date).toLocaleDateString("pt-BR")}
                      </td>
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
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Marcar como Pago
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
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
              {(() => {
                // Calculate revenues by month for the last 3 months
                const monthlyRevenues = new Map<string, number>();
                const now = new Date();
                
                // Initialize last 3 months with 0
                for (let i = 0; i < 3; i++) {
                  const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const key = `${date.getFullYear()}-${date.getMonth()}`;
                  monthlyRevenues.set(key, 0);
                }
                
                // Sum up paid invoices by month
                invoices
                  .filter(inv => inv.status === "pago")
                  .forEach(inv => {
                    const date = new Date(inv.issue_date);
                    const key = `${date.getFullYear()}-${date.getMonth()}`;
                    monthlyRevenues.set(key, (monthlyRevenues.get(key) || 0) + inv.amount);
                  });
                
                // Convert to array and format
                return Array.from(monthlyRevenues.entries())
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([key, value]) => {
                    const [year, month] = key.split('-');
                    const date = new Date(parseInt(year), parseInt(month), 1);
                    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                    return (
                      <div key={key} className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground capitalize">{monthName}</span>
                        <span className="font-medium">R$ {value.toFixed(2)}</span>
                      </div>
                    );
                  });
              })()}
              {invoices.filter(inv => inv.status === "pago").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma receita registrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const upcomingInvoices = invoices
                  .filter(inv => inv.status === "pendente")
                  .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                  .slice(0, 3);
                
                if (upcomingInvoices.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum vencimento próximo
                    </p>
                  );
                }
                
                return upcomingInvoices.map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                    <div>
                      <p className="text-sm font-medium">{invoice.client_name}</p>
                      <p className="text-xs text-muted-foreground">{invoice.description || invoice.service_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-warning">R$ {invoice.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cobrança</DialogTitle>
          </DialogHeader>
          {editingInvoice && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-client">Cliente *</Label>
                <Select
                  value={editingInvoice.client_id}
                  onValueChange={(value) => setEditingInvoice({ ...editingInvoice, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Input
                  id="edit-description"
                  value={editingInvoice.description || ""}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Valor *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingInvoice.amount}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: parseFloat(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-issue-date">Data de Emissão *</Label>
                <Input
                  id="edit-issue-date"
                  type="date"
                  value={editingInvoice.issue_date}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, issue_date: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-due-date">Data de Vencimento *</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editingInvoice.due_date}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingInvoice.status.toLowerCase()} 
                  onValueChange={(value) => setEditingInvoice({ ...editingInvoice, status: value.charAt(0).toUpperCase() + value.slice(1) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveInvoice}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Cobrança</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-client">Cliente *</Label>
              <Select
                value={newInvoice.client_id}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-description">Descrição</Label>
              <Input
                id="new-description"
                value={newInvoice.description || ""}
                onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                placeholder="Descrição do serviço"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-amount">Valor *</Label>
              <Input
                id="new-amount"
                type="number"
                step="0.01"
                min="0"
                value={newInvoice.amount || ""}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-issue-date">Data de Emissão *</Label>
              <Input
                id="new-issue-date"
                type="date"
                value={newInvoice.issue_date || ""}
                onChange={(e) => setNewInvoice({ ...newInvoice, issue_date: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-due-date">Data de Vencimento *</Label>
              <Input
                id="new-due-date"
                type="date"
                value={newInvoice.due_date || ""}
                onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-status">Status</Label>
              <Select 
                value={newInvoice.status || "pendente"} 
                onValueChange={(value) => setNewInvoice({ ...newInvoice, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateInvoice}>
              Criar Cobrança
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}