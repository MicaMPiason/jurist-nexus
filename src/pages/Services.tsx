import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Plus, Search, Filter, DollarSign, FileText, Clock, Users, Edit, Trash2, CheckCircle } from 'lucide-react';
import { MetricsCard } from '@/components/MetricsCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Client = Tables<'clients'>;
type Process = Tables<'processes'> & { client?: Client };
type Service = Tables<'services'> & { client?: Client; process?: Process };

const Services = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedEditClient, setSelectedEditClient] = useState<string>('');
  const [editProcesses, setEditProcesses] = useState<Process[]>([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    client_id: '',
    process_id: '',
    value: '',
    next_task: '',
    next_task_date: '',
    status: 'ativo' as const
  });

  useEffect(() => {
    fetchClients();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchProcessesByClient(selectedClient);
    } else {
      setProcesses([]);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedEditClient) {
      fetchProcessesByClientForEdit(selectedEditClient);
    } else {
      setEditProcesses([]);
    }
  }, [selectedEditClient]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    }
  };

  const fetchProcessesByClient = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProcesses(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar processos",
        description: "Não foi possível carregar os processos do cliente.",
        variant: "destructive",
      });
    }
  };

  const fetchProcessesByClientForEdit = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEditProcesses(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar processos",
        description: "Não foi possível carregar os processos do cliente.",
        variant: "destructive",
      });
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          client:clients(*),
          process:processes(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar serviços",
        description: "Não foi possível carregar os serviços.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.client_id || !newService.process_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          client_id: newService.client_id,
          process_id: newService.process_id,
          name: newService.name,
          description: newService.description,
          value: newService.value ? parseFloat(newService.value) : null,
          next_task: newService.next_task,
          next_task_date: newService.next_task_date || null,
          status: newService.status
        })
        .select(`
          *,
          client:clients(*),
          process:processes(*)
        `)
        .single();

      if (error) throw error;

      setServices([data, ...services]);
      setNewService({
        name: '',
        description: '',
        client_id: '',
        process_id: '',
        value: '',
        next_task: '',
        next_task_date: '',
        status: 'ativo'
      });
      setSelectedClient('');
      setIsAddDialogOpen(false);
      
      toast({
        title: "Serviço criado",
        description: "O serviço foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar serviço",
        description: "Não foi possível criar o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setSelectedEditClient(service.client_id);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedService = async () => {
    if (!editingService) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .update({
          name: editingService.name,
          description: editingService.description,
          client_id: editingService.client_id,
          process_id: editingService.process_id,
          value: editingService.value,
          next_task: editingService.next_task,
          next_task_date: editingService.next_task_date,
          status: editingService.status
        })
        .eq('id', editingService.id)
        .select(`
          *,
          client:clients(*),
          process:processes(*)
        `)
        .single();

      if (error) throw error;

      setServices(services.map(s => s.id === editingService.id ? data : s));
      setEditingService(null);
      setSelectedEditClient('');
      setIsEditDialogOpen(false);
      
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar serviço",
        description: "Não foi possível atualizar o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setServices(services.filter(s => s.id !== serviceId));
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir serviço",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Service['status']) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Ativo</Badge>;
      case 'pausado':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pausado</Badge>;
      case 'concluido':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Concluído</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus serviços jurídicos
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Serviço</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="service-name">Nome do Serviço</Label>
                <Input
                  id="service-name"
                  placeholder="Nome do serviço"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="service-description">Descrição</Label>
                <Textarea
                  id="service-description"
                  placeholder="Descrição do serviço"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service-client">Cliente</Label>
                <Select 
                  value={selectedClient} 
                  onValueChange={(value) => {
                    setSelectedClient(value);
                    setNewService({ ...newService, client_id: value, process_id: '' });
                  }}
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
                <Label htmlFor="service-process">Processo</Label>
                <Select 
                  value={newService.process_id} 
                  onValueChange={(value) => setNewService({ ...newService, process_id: value })}
                  disabled={!selectedClient}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedClient ? "Selecione um processo" : "Primeiro selecione um cliente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map((process) => (
                      <SelectItem key={process.id} value={process.id}>
                        {process.number} - {process.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service-value">Valor</Label>
                <Input
                  id="service-value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newService.value}
                  onChange={(e) => setNewService({ ...newService, value: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service-next-task">Próxima Tarefa</Label>
                <Input
                  id="service-next-task"
                  placeholder="Próxima tarefa"
                  value={newService.next_task}
                  onChange={(e) => setNewService({ ...newService, next_task: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service-next-task-date">Data da Próxima Tarefa</Label>
                <Input
                  id="service-next-task-date"
                  type="date"
                  value={newService.next_task_date}
                  onChange={(e) => setNewService({ ...newService, next_task_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddService}>
                Criar Serviço
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar serviços..." className="pl-8" />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pausado">Pausado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total de Serviços"
          value={loading ? "..." : services.length.toString()}
          icon={FileText}
        />
        <MetricsCard
          title="Receita Total"
          value={loading ? "..." : `R$ ${services.reduce((sum, service) => sum + (service.value || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
        <MetricsCard
          title="Serviços Ativos"
          value={loading ? "..." : services.filter(service => service.status === 'ativo').length.toString()}
          icon={Clock}
        />
        <MetricsCard
          title="Clientes Únicos"
          value={loading ? "..." : new Set(services.map(service => service.client_id)).size.toString()}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Serviço</th>
                  <th className="text-left py-3 px-4 font-medium">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium">Valor</th>
                  <th className="text-left py-3 px-4 font-medium">Próxima Tarefa</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                      Carregando serviços...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                      Nenhum serviço encontrado. Crie seu primeiro serviço!
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="border-b">
                      <td className="px-6 py-4">
                        <div className="font-medium">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-muted-foreground">{service.description}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Processo: {service.process?.number}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {service.client?.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {service.value ? `R$ ${service.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {service.next_task || '-'}
                        {service.next_task_date && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(service.next_task_date).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(service.status)}
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Completar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditService(service)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>
          {editingService && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-service-name">Nome do Serviço</Label>
                <Input
                  id="edit-service-name"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-service-description">Descrição</Label>
                <Textarea
                  id="edit-service-description"
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-service-client">Cliente</Label>
                <Select 
                  value={selectedEditClient} 
                  onValueChange={(value) => {
                    setSelectedEditClient(value);
                    setEditingService({ ...editingService, client_id: value, process_id: '' });
                  }}
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
                <Label htmlFor="edit-service-process">Processo</Label>
                <Select 
                  value={editingService.process_id} 
                  onValueChange={(value) => setEditingService({ ...editingService, process_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um processo" />
                  </SelectTrigger>
                  <SelectContent>
                    {editProcesses.map((process) => (
                      <SelectItem key={process.id} value={process.id}>
                        {process.number} - {process.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-service-value">Valor</Label>
                <Input
                  id="edit-service-value"
                  type="number"
                  step="0.01"
                  value={editingService.value || ''}
                  onChange={(e) => setEditingService({ ...editingService, value: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-service-next-task">Próxima Tarefa</Label>
                <Input
                  id="edit-service-next-task"
                  value={editingService.next_task || ''}
                  onChange={(e) => setEditingService({ ...editingService, next_task: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-service-next-task-date">Data da Próxima Tarefa</Label>
                <Input
                  id="edit-service-next-task-date"
                  type="date"
                  value={editingService.next_task_date || ''}
                  onChange={(e) => setEditingService({ ...editingService, next_task_date: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-service-status">Status</Label>
                <Select 
                  value={editingService.status} 
                  onValueChange={(value: 'ativo' | 'pausado' | 'concluido') => setEditingService({ ...editingService, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditedService}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Services;