import { CryptoDashboard } from '@/components/CryptoDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin, TrendingUp, DollarSign, FileText } from 'lucide-react';

export default function CryptoTaxes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cryptocurrency Tax Tracking</h1>
          <p className="text-gray-600">Import transactions, calculate gains, and generate Form 8949</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bitcoin className="h-4 w-4 text-orange-600" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,230</div>
              <p className="text-xs text-green-600">+12.5% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Realized Gains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,450</div>
              <p className="text-xs text-muted-foreground">Year to date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Tax Owed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,028</div>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">This tax year</p>
            </CardContent>
          </Card>
        </div>

        <CryptoDashboard />
      </div>
    </div>
  );
}
