import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SmartTimeline() {
  const monthlyData = [
    { month: "Jan", expenses: 2400, income: 4000 },
    { month: "Feb", expenses: 2800, income: 3800 },
    { month: "Mar", expenses: 3200, income: 4500 },
    { month: "Apr", expenses: 2900, income: 4200 },
    { month: "May", expenses: 3400, income: 4800 },
    { month: "Jun", expenses: 3100, income: 4600 },
  ];

  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const avgMonthly = totalExpenses / monthlyData.length;

  return (
    <Card className="border-teal/20">
      <CardHeader>
        <CardTitle className="font-heading text-charcoal flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal" />
          Smart Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-teal/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-charcoal">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-bold text-charcoal">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Avg/Month</p>
            <p className="text-lg font-bold text-charcoal">${avgMonthly.toFixed(0)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#C8CDD0" />
            <XAxis dataKey="month" stroke="#2E2E2E" />
            <YAxis stroke="#2E2E2E" />
            <Tooltip />
            <Line type="monotone" dataKey="income" stroke="#50E3E3" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
