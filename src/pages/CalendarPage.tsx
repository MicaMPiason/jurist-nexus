import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Scale, CheckCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CalendarPage() {
  const currentMonth = "Agosto 2025";
  const nextMonth = "Setembro 2025";
  
  const months = [
    {
      name: currentMonth,
      eventsCount: "7 evento(s)",
      isCurrent: true,
      events: [
        { date: 20, type: "deadline" },
        { date: 21, type: "meeting" },
        { date: 23, type: "deadline" },
        { date: 25, type: "meeting" },
        { date: 26, type: "meeting" },
      ],
    },
    {
      name: nextMonth,
      eventsCount: "1 evento(s)",
      isCurrent: false,
      events: [
        { date: 15, type: "hearing" },
      ],
    },
  ];

  const upcomingEvents = [
    {
      client: "Maria da Silva",
      date: "24/08/2025",
      type: "Tarefa",
      process: "Ação Judicial 2312131",
      task: "Reunião de alinhamento",
    },
  ];

  const getEventTypeClasses = (type: string) => {
    switch (type) {
      case "deadline":
        return "bg-destructive text-destructive-foreground";
      case "meeting":
        return "bg-primary text-primary-foreground";
      case "hearing":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "tarefa":
        return <Badge variant="secondary" className="bg-primary/10 text-primary">Tarefa</Badge>;
      case "audiência":
        return <Badge variant="secondary" className="bg-accent/10 text-accent">Audiência</Badge>;
      case "reunião":
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Reunião</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const CalendarMonth = ({ month }: { month: any }) => (
    <Card className={`shadow-bridge-sm ${month.isCurrent ? 'border-primary/30' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{month.name}</CardTitle>
          <CardDescription className="text-xs">{month.eventsCount}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Days of week header */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar grid */}
          {Array.from({ length: 35 }, (_, i) => {
            const date = i - 5; // Adjust for month start
            const hasEvent = month.events.find((e: any) => e.date === date);
            
            if (date < 1 || date > 31) {
              return <div key={i} className="h-8"></div>;
            }
            
            return (
              <div key={i} className="h-8 flex items-center justify-center relative">
                <span className={`text-sm ${month.isCurrent && date === 19 ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                  {date}
                </span>
                {hasEvent && (
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${getEventTypeClasses(hasEvent.type)}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">
            Calendário com eventos e prazos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {months.map((month, index) => (
          <CalendarMonth key={index} month={month} />
        ))}
      </div>

      {/* Upcoming Events */}
      <Card className="shadow-bridge-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Próximos Eventos
          </CardTitle>
          <CardDescription>
            {upcomingEvents.length} evento{upcomingEvents.length !== 1 ? 's' : ''} próximo{upcomingEvents.length !== 1 ? 's' : ''}
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
                    Data
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Processo/Serviço
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Evento
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((event, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm">{event.client}</td>
                    <td className="py-3 px-4 text-sm font-medium">{event.date}</td>
                    <td className="py-3 px-4">
                      {getEventTypeBadge(event.type)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{event.process}</td>
                    <td className="py-3 px-4 text-sm">{event.task}</td>
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

      {/* Legend */}
      <Card className="shadow-bridge-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span>Prazos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Reuniões</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span>Audiências</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}