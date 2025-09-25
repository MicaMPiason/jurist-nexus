import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth, getDaysInMonth, addMonths, subMonths, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'service' | 'process';
  title: string;
  client: string;
  description?: string;
  source: 'next_task_date';
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendarEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Buscar serviços com next_task_date
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          name,
          next_task_date,
          next_task,
          clients:client_id (name)
        `)
        .eq('user_id', user.id)
        .not('next_task_date', 'is', null);

      if (servicesError) throw servicesError;

      // Buscar processos que tenham alguma data relacionada
      const { data: processes, error: processesError } = await supabase
        .from('processes')
        .select(`
          id,
          number,
          subject,
          created_at,
          clients:client_id (name)
        `)
        .eq('user_id', user.id);

      if (processesError) throw processesError;

      const calendarEvents: CalendarEvent[] = [];

      // Adicionar eventos dos serviços
      services?.forEach((service: any) => {
        if (service.next_task_date) {
          calendarEvents.push({
            id: `service-${service.id}`,
            date: parseISO(service.next_task_date),
            type: 'service',
            title: service.next_task || service.name,
            client: service.clients?.name || 'Cliente não informado',
            description: service.name,
            source: 'next_task_date'
          });
        }
      });

      // Adicionar eventos dos processos (data de criação como exemplo)
      processes?.forEach((process: any) => {
        calendarEvents.push({
          id: `process-${process.id}`,
          date: parseISO(process.created_at),
          type: 'process',
          title: `Processo: ${process.number}`,
          client: process.clients?.name || 'Cliente não informado',
          description: process.subject,
          source: 'next_task_date'
        });
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [user]);

  const currentMonth = format(currentDate, 'MMMM yyyy', { locale: ptBR });
  const nextMonth = format(addMonths(currentDate, 1), 'MMMM yyyy', { locale: ptBR });
  
  const getEventsForMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    return events.filter(event => 
      event.date >= monthStart && event.date <= monthEnd
    );
  };

  const getCurrentMonthEvents = () => getEventsForMonth(currentDate);
  const getNextMonthEvents = () => getEventsForMonth(addMonths(currentDate, 1));

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 10);

  const getEventTypeClasses = (type: string) => {
    switch (type) {
      case "service":
        return "bg-primary text-primary-foreground";
      case "process":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "service":
        return <Badge variant="secondary" className="bg-primary/10 text-primary">Serviço</Badge>;
      case "process":
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Processo</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const months = [
    {
      name: currentMonth,
      eventsCount: `${getCurrentMonthEvents().length} evento(s)`,
      isCurrent: true,
      events: getCurrentMonthEvents(),
      date: currentDate,
    },
    {
      name: nextMonth,
      eventsCount: `${getNextMonthEvents().length} evento(s)`,
      isCurrent: false,
      events: getNextMonthEvents(),
      date: addMonths(currentDate, 1),
    },
  ];

  const CalendarMonth = ({ month }: { month: any }) => {
    const daysInMonth = getDaysInMonth(month.date);
    const monthStart = startOfMonth(month.date);
    const startDay = monthStart.getDay(); // 0 = Sunday

    return (
      <Card className={`shadow-bridge-sm ${month.isCurrent ? 'border-primary/30' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg capitalize">{month.name}</CardTitle>
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
            
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-8"></div>
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = i + 1;
              const fullDate = new Date(month.date.getFullYear(), month.date.getMonth(), date);
              const dayEvents = month.events.filter((event: CalendarEvent) => 
                isSameDay(event.date, fullDate)
              );
              const isToday = isSameDay(fullDate, new Date());
              
              return (
                <div key={date} className="h-8 flex items-center justify-center relative">
                  <span className={`text-sm ${isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                    {date}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((event, eventIndex) => (
                        <div 
                          key={eventIndex}
                          className={`w-1 h-1 rounded-full ${getEventTypeClasses(event.type)}`}
                          title={event.title}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
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
                    <td className="py-3 px-4 text-sm font-medium">
                      {format(event.date, 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="py-3 px-4">
                      {getEventTypeBadge(event.type)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{event.description || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">{event.title}</td>
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