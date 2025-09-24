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
import { MoreHorizontal, Plus, Search, Filter, Calendar, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { MetricsCard } from '@/components/MetricsCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Client = Tables<'clients'>;
type Process = Tables<'processes'> & { client?: Client };

const Processes = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProcess, setNewProcess] = useState({
    number: '',
    client_id: '',
    type: '',
    court: '',
    subject: '',
    status: 'em_andamento' as const
  });

  useEffect(() => {
    fetchClients();
    fetchProcesses();
  }, []);

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

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('processes')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProcesses(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar processos",
        description: "Não foi possível carregar os processos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProcess = async () => {
    if (!newProcess.client_id || !newProcess.number || !newProcess.type || !newProcess.court || !newProcess.subject) {
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
        .from('processes')
        .insert({
          user_id: user.id,
          client_id: newProcess.client_id,
          number: newProcess.number,
          type: newProcess.type,
          court: newProcess.court,
          subject: newProcess.subject,
          status: newProcess.status
        })
        .select(`
          *,
          client:clients(*)
        `)
        .single();

      if (error) throw error;

      setProcesses([data, ...processes]);
      setNewProcess({
        number: '',
        client_id: '',
        type: '',
        court: '',
        subject: '',
        status: 'em_andamento'
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Processo criado",
        description: "O processo foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar processo",
        description: "Não foi possível criar o processo.",
        variant: "destructive",
      });
    }
  };

  const handleConcludeProcess = async (processId: string) => {
    try {
      const { error } = await supabase
        .from('processes')
        .update({ status: 'concluido' })
        .eq('id', processId);

      if (error) throw error;

      setProcesses(processes.filter(p => p.id !== processId));
      toast({
        title: "Processo concluído",
        description: "O processo foi marcado como concluído.",
      });
    } catch (error) {
      toast({
        title: "Erro ao concluir processo",
        description: "Não foi possível concluir o processo.",
        variant: "destructive",
      });
    }
  };

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedProcess = async () => {
    if (!editingProcess) return;

    try {
      const { data, error } = await supabase
        .from('processes')
        .update({
          number: editingProcess.number,
          client_id: editingProcess.client_id,
          type: editingProcess.type,
          court: editingProcess.court,
          subject: editingProcess.subject,
          status: editingProcess.status
        })
        .eq('id', editingProcess.id)
        .select(`
          *,
          client:clients(*)
        `)
        .single();

      if (error) throw error;

      setProcesses(processes.map(p => p.id === editingProcess.id ? data : p));
      setEditingProcess(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Processo atualizado",
        description: "O processo foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar processo",
        description: "Não foi possível atualizar o processo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProcess = async (processId: string) => {
    try {
      const { error } = await supabase
        .from('processes')
        .delete()
        .eq('id', processId);

      if (error) throw error;

      setProcesses(processes.filter(p => p.id !== processId));
      toast({
        title: "Processo excluído",
        description: "O processo foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir processo",
        description: "Não foi possível excluir o processo.",
        variant: "destructive",
      });
    }
  };

  const processesInProgress = processes.filter(p => p.status === 'em_andamento');
  const processesWaitingHearing = processes.filter(p => p.status === 'aguardando_audiencia');
  const totalProcesses = processes.length;

  const getStatusBadge = (status: Process['status']) => {
    switch (status) {
      case 'em_andamento':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Em Andamento</Badge>;
      case 'aguardando_audiencia':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Aguardando Audiência</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Concluído</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const ProcessCard = ({ process }: { process: Process }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {process.number}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleConcludeProcess(process.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Concluir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditProcess(process)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteProcess(process.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Cliente: <span className="font-medium">{process.client?.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Tipo: <span className="font-medium">{process.type}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Tribunal: <span className="font-medium">{process.court}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Assunto: <span className="font-medium">{process.subject}</span>
          </div>
          <div className="flex items-center justify-between">
            {getStatusBadge(process.status)}
            <span className="text-xs text-muted-foreground">
              {new Date(process.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Processos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus processos jurídicos
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Processo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Processo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="number">Número do Processo</Label>
                <Input
                  id="number"
                  placeholder="0001234-56.2024.8.26.0100"
                  value={newProcess.number}
                  onChange={(e) => setNewProcess({ ...newProcess, number: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={newProcess.client_id} onValueChange={(value) => setNewProcess({ ...newProcess, client_id: value })}>
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
                <Label htmlFor="type">Tipo</Label>
                <Select value={newProcess.type} onValueChange={(value) => setNewProcess({ ...newProcess, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cível">Cível</SelectItem>
                    <SelectItem value="Criminal">Criminal</SelectItem>
                    <SelectItem value="Trabalhista">Trabalhista</SelectItem>
                    <SelectItem value="Tributário">Tributário</SelectItem>
                    <SelectItem value="Família">Família</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="court">Tribunal</Label>
                <Input
                  id="court"
                  placeholder="Tribunal de Justiça"
                  value={newProcess.court}
                  onChange={(e) => setNewProcess({ ...newProcess, court: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Ação de Cobrança"
                  value={newProcess.subject}
                  onChange={(e) => setNewProcess({ ...newProcess, subject: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProcess}>
                Criar Processo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar processos..." className="pl-8" />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="aguardando_audiencia">Aguardando Audiência</SelectItem>
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
          title="Total de Processos"
          value={loading ? "..." : totalProcesses.toString()}
          icon={FileText}
        />
        <MetricsCard
          title="Em Andamento"
          value={loading ? "..." : processesInProgress.length.toString()}
          icon={Calendar}
        />
        <MetricsCard
          title="Aguardando Audiência"
          value={loading ? "..." : processesWaitingHearing.length.toString()}
          icon={Eye}
        />
        <MetricsCard
          title="Novos Este Mês"
          value={loading ? "..." : processes.filter(p => {
            const processDate = new Date(p.created_at);
            const now = new Date();
            return processDate.getMonth() === now.getMonth() && 
                   processDate.getFullYear() === now.getFullYear();
          }).length.toString()}
          icon={Plus}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando processos...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Processos em Andamento</h2>
            {processesInProgress.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum processo em andamento encontrado.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {processesInProgress.map((process) => (
                  <ProcessCard key={process.id} process={process} />
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-bold mb-4">Processos Aguardando Audiência</h2>
            {processesWaitingHearing.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum processo aguardando audiência encontrado.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {processesWaitingHearing.map((process) => (
                  <ProcessCard key={process.id} process={process} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Process Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Processo</DialogTitle>
          </DialogHeader>
          {editingProcess && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-number">Número do Processo</Label>
                <Input
                  id="edit-number"
                  value={editingProcess.number}
                  onChange={(e) => setEditingProcess({ ...editingProcess, number: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-client">Cliente</Label>
                <Select 
                  value={editingProcess?.client_id || ''} 
                  onValueChange={(value) => setEditingProcess(editingProcess ? { ...editingProcess, client_id: value } : null)}
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
                <Label htmlFor="edit-type">Tipo</Label>
                <Select 
                  value={editingProcess.type} 
                  onValueChange={(value) => setEditingProcess({ ...editingProcess, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cível">Cível</SelectItem>
                    <SelectItem value="Criminal">Criminal</SelectItem>
                    <SelectItem value="Trabalhista">Trabalhista</SelectItem>
                    <SelectItem value="Tributário">Tributário</SelectItem>
                    <SelectItem value="Família">Família</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-court">Tribunal</Label>
                <Input
                  id="edit-court"
                  value={editingProcess.court}
                  onChange={(e) => setEditingProcess({ ...editingProcess, court: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-subject">Assunto</Label>
                <Input
                  id="edit-subject"
                  value={editingProcess.subject}
                  onChange={(e) => setEditingProcess({ ...editingProcess, subject: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingProcess.status} 
                  onValueChange={(value) => setEditingProcess({ ...editingProcess, status: value as Process['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="aguardando_audiencia">Aguardando Audiência</SelectItem>
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
            <Button onClick={handleSaveEditedProcess}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Processes;