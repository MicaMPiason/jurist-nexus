import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

export function MetricsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = "default" 
}: MetricsCardProps) {
  const getCardClasses = () => {
    switch (variant) {
      case "primary":
        return "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10";
      case "success":
        return "border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10";
      case "warning":
        return "border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10";
      case "destructive":
        return "border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10";
      default:
        return "border-border";
    }
  };

  const getIconClasses = () => {
    switch (variant) {
      case "primary":
        return "text-primary bg-primary/10";
      case "success":
        return "text-accent bg-accent/10";
      case "warning":
        return "text-warning bg-warning/10";
      case "destructive":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <Card className={`shadow-bridge-sm hover:shadow-bridge-md transition-all duration-200 ${getCardClasses()}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold text-card-foreground">
              {value}
            </p>
            {trend && (
              <p className={`text-xs flex items-center gap-1 ${
                trend.isPositive ? 'text-accent' : 'text-destructive'
              }`}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${getIconClasses()}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}