import { Plus, Search, Scale, Clock, Calendar, MoreHorizontal, CheckCircle, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MetricsCard } from "@/components/MetricsCard";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Processes() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProcess, setNewProcess] = useState({
    number: "",
    title: "",
    client: "",
    court: "",
    type: "Cível",
    nextDate: "Nenhuma tarefa pendente",
    status: "Ativo",
  });

  const [processesInProgress, setProcessesInProgress] = useState([
    {
      id: "123",
      number: "123232132",
      title: "Processo contra o banco",
      client: "cliente teste",
      court: "Tribunal",
      type: "Cível",
      nextDate: "Nenhuma tarefa pendente",
      status: "Ativo",
    },
  ]);

  const [processesWaitingHearing, setProcessesWaitingHearing] = useState([
    {
      id: "456",
      number: "2312131",
      title: "Ação Judicial",
      client: "Maria da Silva",
      court: "Varas",
      type: "Cível",
      nextDate: "23/08/2025 - Tarefa",
      status: "Ativo",
    },
  ]);

  const handleAddProcess = () => {
    const newId = Date.now().toString();
    const processToAdd = {
      id: newId,
      ...newProcess
    };

    // Add to processes in progress by default
    setProcessesInProgress(prev => [...prev, processToAdd]);

    // Reset form
    setNewProcess({
      number: "",
      title: "",
      client: "",
      court: "",
      type: "Cível",
      nextDate: "Nenhuma tarefa pendente",
      status: "Ativo",
    });

    setIsAddDialogOpen(false);

    toast({
      title: "Processo adicionado",
      description: "O novo processo foi adicionado com sucesso.",
    });
  };

  const handleConcludeProcess = (processId: string) => {
    // Update process status to concluded
    setProcessesInProgress(prev => 
      prev.map(process => 
        process.id === processId 
          ? { ...process, status: "Concluído" }
          : process
      )
    );
    setProcessesWaitingHearing(prev => 
      prev.map(process => 
        process.id === processId 
          ? { ...process, status: "Concluído" }
          : process
      )
    );
    toast({
      title: "Processo concluído",
      description: "O processo foi marcado como concluído com sucesso.",
    });
  };

  const handleEditProcess = (processId: string) => {
    toast({
      title: "Editar processo",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

  const handleDeleteProcess = (processId: string) => {
    setProcessesInProgress(prev => prev.filter(process => process.id !== processId));
    setProcessesWaitingHearing(prev => prev.filter(process => process.id !== processId));
    toast({
      title: "Processo excluído",
      description: "O processo foi excluído com sucesso.",
      variant: "destructive",
    });
  };

  const totalProcesses = processesInProgress.length + processesWaitingHearing.length;

  const metrics = [
    {
      title: "Total de Processos",
      value: totalProcesses.toString(),
      icon: Scale,
      variant: "primary" as const,
    },
    {
      title: "Em Andamento",
      value: processesInProgress.length.toString(),
      icon: Clock,
      variant: "warning" as const,
    },
    {
      title: "Aguardando Audiência",
      value: processesWaitingHearing.length.toString(),
      icon: Calendar,
      variant: "success" as const,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "ativo":
        return <Badge variant="secondary" className="bg-accent/10 text-accent">Ativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const ProcessCard = ({ 
    process, 
    onConclude, 
    onEdit, 
    onDelete 
  }: { 
    process: any;
    onConclude: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => (
    <Card className="shadow-bridge-sm hover:shadow-bridge-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-card-foreground">{process.title}</h3>
              {getStatusBadge(process.status)}
            </div>
            <p className="text-sm text-muted-foreground mb-1">Nº {process.number}</p>
            <p className="text-sm text-muted-foreground">Cliente: {process.client}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onConclude(process.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Concluir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(process.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => onDelete(process.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tribunal:</span>
            <span>{process.court}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo:</span>
            <span>{process.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Próxima:</span>
            <span className="font-medium">{process.nextDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Processos</h1>
          <p className="text-muted-foreground">
            Gerenciamento completo de processos jurídicos
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-bridge-glow transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Novo Processo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Processo</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo processo jurídico.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">
                  Número
                </Label>
                <Input
                  id="number"
                  value={newProcess.number}
                  onChange={(e) => setNewProcess(prev => ({ ...prev, number: e.target.value }))}
                  className="col-span-3"
                  placeholder="Ex: 123456789"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input
                  id="title"
                  value={newProcess.title}
                  onChange={(e) => setNewProcess(prev => ({ ...prev, title: e.target.value }))}
                  className="col-span-3"
                  placeholder="Ex: Ação de Indenização"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Cliente
                </Label>
                <Input
                  id="client"
                  value={newProcess.client}
                  onChange={(e) => setNewProcess(prev => ({ ...prev, client: e.target.value }))}
                  className="col-span-3"
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="court" className="text-right">
                  Tribunal
                </Label>
                <Input
                  id="court"
                  value={newProcess.court}
                  onChange={(e) => setNewProcess(prev => ({ ...prev, court: e.target.value }))}
                  className="col-span-3"
                  placeholder="Ex: Tribunal de Justiça"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <Select 
                  value={newProcess.type} 
                  onValueChange={(value) => setNewProcess(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cível">Cível</SelectItem>
                    <SelectItem value="Criminal">Criminal</SelectItem>
                    <SelectItem value="Trabalhista">Trabalhista</SelectItem>
                    <SelectItem value="Tributário">Tributário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nextDate" className="text-right">
                  Próxima Data
                </Label>
                <Input
                  id="nextDate"
                  value={newProcess.nextDate}
                  onChange={(e) => setNewProcess(prev => ({ ...prev, nextDate: e.target.value }))}
                  className="col-span-3"
                  placeholder="Ex: 25/12/2024 - Audiência"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                onClick={handleAddProcess}
                disabled={!newProcess.title || !newProcess.client || !newProcess.number}
              >
                Adicionar Processo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-bridge-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar processos..." 
                className="w-full pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="aguardando_audiencia">Aguardando Audiência</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Buscar cliente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                <SelectItem value="maria">Maria da Silva</SelectItem>
                <SelectItem value="teste">cliente teste</SelectItem>
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

      {/* Processes in Progress */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-foreground">Processos em Andamento</h2>
          <Badge variant="outline">{processesInProgress.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processesInProgress.map((process) => (
            <ProcessCard 
              key={process.id} 
              process={process} 
              onConclude={handleConcludeProcess}
              onEdit={handleEditProcess}
              onDelete={handleDeleteProcess}
            />
          ))}
        </div>
      </div>

      {/* Processes Waiting Hearing */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-foreground">Processos Aguardando Audiência</h2>
          <Badge variant="outline">{processesWaitingHearing.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processesWaitingHearing.map((process) => (
            <ProcessCard 
              key={process.id} 
              process={process} 
              onConclude={handleConcludeProcess}
              onEdit={handleEditProcess}
              onDelete={handleDeleteProcess}
            />
          ))}
        </div>
      </div>
    </div>
  );
}