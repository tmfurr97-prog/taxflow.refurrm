import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertCircle } from "lucide-react";

export default function TaxHealthWidget() {
  // Score is 0 until the user has real data. This will be computed from actual receipts/transactions in a future update.
  const healthScore = 0;
  const hasData = healthScore > 0;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Tax Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-2">
          <div className="text-5xl font-bold text-slate-500">{healthScore}%</div>
          <p className="text-sm text-slate-500 mt-1">No data yet</p>
        </div>

        {!hasData && (
          <div className="flex items-start gap-2 p-3 bg-slate-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-400">
              Upload your first document to start building your Tax Health Score.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
