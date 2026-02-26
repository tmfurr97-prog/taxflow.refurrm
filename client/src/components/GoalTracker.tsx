import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, DollarSign, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GoalTracker() {
  const goals = [
    {
      title: "Maximize Deductions",
      current: 12450,
      target: 15000,
      icon: DollarSign,
      color: "text-teal",
    },
    {
      title: "Reduce Tax Liability",
      current: 3200,
      target: 5000,
      icon: TrendingDown,
      color: "text-emerald-500",
    },
  ];

  return (
    <Card className="border-teal/20">
      <CardHeader>
        <CardTitle className="font-heading text-charcoal flex items-center gap-2">
          <Target className="h-5 w-5 text-teal" />
          Financial Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const progress = (goal.current / goal.target) * 100;
          
          return (
            <div key={goal.title} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${goal.color}`} />
                  <span className="font-medium text-charcoal">{goal.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
        
        <Button className="w-full bg-teal hover:bg-teal-dark text-charcoal font-semibold">
          Adjust Goals
        </Button>
      </CardContent>
    </Card>
  );
}
