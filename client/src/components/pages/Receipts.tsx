import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, TrendingUp, FileText } from 'lucide-react';
import { ReceiptManagerV2 } from '@/components/ReceiptManagerV2';
import { MileageTrackerV2 } from '@/components/MileageTrackerV2';
import { HomeOfficeCalculatorV2 } from '@/components/HomeOfficeCalculatorV2';

export default function Receipts() {
  const taxYear = useMemo(() => new Date().getFullYear(), []);
  const { data: receiptList = [] } = trpc.receipts.list.useQuery({ taxYear });

  const receiptCount = receiptList.length;
  const totalExpenses = receiptList.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
  const deductibleTotal = receiptList
    .filter(r => r.isDeductible)
    .reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Receipt & Expense Tracking</h1>
          <p className="text-gray-600">Upload receipts, track mileage, and manage business expenses</p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                Receipts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receiptCount}</div>
              <p className="text-xs text-muted-foreground">Uploaded this year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Tracked this year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Potential Deductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${deductibleTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Business expenses tracked</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
          {/* Receipt Scanner */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Receipts</h2>
            <ReceiptManagerV2 />
          </section>

          {/* Mileage */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mileage Tracking</h2>
            <MileageTrackerV2 />
          </section>

          {/* Home Office */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Home Office Deduction</h2>
            <HomeOfficeCalculatorV2 />
          </section>
        </div>
      </div>
    </div>
  );
}
