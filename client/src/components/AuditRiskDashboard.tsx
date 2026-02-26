import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuditRiskDashboard() {
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRiskAnalysis();
  }, []);

  const loadRiskAnalysis = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-audit-risk', {
        body: { taxYear: new Date().getFullYear() },
      });

      if (error) throw error;
      setRiskData(data);
    } catch (error: any) {
      toast({
        title: 'Error loading risk analysis',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return 'Low';
    if (score < 70) return 'Medium';
    return 'High';
  };

  if (loading) {
    return <div>Loading risk analysis...</div>;
  }

  const overallScore = riskData?.overallScore || 45;
  const categories = riskData?.categories || [
    { name: 'Home Office', score: 65, amount: 12000, factors: ['Large deduction relative to income'] },
    { name: 'Meals & Entertainment', score: 40, amount: 8500, factors: ['Within normal range'] },
    { name: 'Vehicle Expenses', score: 75, amount: 15000, factors: ['High mileage claimed', 'Limited documentation'] },
    { name: 'Travel', score: 25, amount: 4200, factors: ['Well documented'] },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Audit Risk Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-4xl font-bold ${getRiskColor(overallScore)}`}>
                {overallScore}/100
              </span>
              <Badge variant={overallScore > 70 ? 'destructive' : overallScore > 30 ? 'default' : 'secondary'}>
                {getRiskLevel(overallScore)} Risk
              </Badge>
            </div>
            <Progress value={overallScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Based on deduction patterns, documentation quality, and IRS audit triggers
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Category Risk Analysis</h3>
        {categories.map((category: any) => (
          <Card key={category.name}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {category.score > 70 ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : category.score > 30 ? (
                      <Info className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <h4 className="font-semibold">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${category.amount.toLocaleString()} deducted
                      </p>
                    </div>
                  </div>
                  <Badge variant={category.score > 70 ? 'destructive' : category.score > 30 ? 'default' : 'secondary'}>
                    Risk: {category.score}
                  </Badge>
                </div>
                <Progress value={category.score} className="h-2" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Risk Factors:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {category.factors.map((factor: string, idx: number) => (
                      <li key={idx}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure all vehicle expenses have supporting mileage logs</li>
                <li>• Review home office deduction calculation for accuracy</li>
                <li>• Maintain receipts for all business meals over $75</li>
                <li>• Consider consulting a tax professional for high-risk items</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
