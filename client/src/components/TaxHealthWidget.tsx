import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export default function TaxHealthWidget() {
  const healthScore = 85;
  const metrics = [
    { label: "Receipts Captured", value: 142, target: 200, status: "good" },
    { label: "Transactions Matched", value: 89, target: 100, status: "warning" },
    { label: "Categories Reviewed", value: 95, target: 100, status: "good" },
  ];

  return (
    <Card className="border-teal/20 bg-gradient-to-br from-white to-teal/5">
      <CardHeader>
        <CardTitle className="font-heading text-charcoal flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal" />
          Tax Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-teal">{healthScore}%</div>
          <p className="text-sm text-muted-foreground mt-1">Audit Ready</p>
        </div>
        
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal">{metric.label}</span>
                <span className="text-muted-foreground">
                  {metric.value}/{metric.target}
                </span>
              </div>
              <Progress value={(metric.value / metric.target) * 100} className="h-2" />
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 bg-teal/10 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
          <p className="text-sm text-charcoal">
            You're on track! Keep capturing receipts to maintain audit readiness.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
