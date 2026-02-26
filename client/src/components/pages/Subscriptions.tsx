import SubscriptionManagement from '@/components/SubscriptionManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Calendar, TrendingUp, Award } from 'lucide-react';

export default function Subscriptions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
          <p className="text-gray-600">Manage your subscription, billing history, and payment methods</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Pro</div>
              <p className="text-xs text-muted-foreground">$29/month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Next Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Dec 15</div>
              <p className="text-xs text-muted-foreground">2024</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Total Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,450</div>
              <p className="text-xs text-muted-foreground">In tax savings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-600" />
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Jan 2024</div>
              <p className="text-xs text-muted-foreground">11 months</p>
            </CardContent>
          </Card>
        </div>

        <SubscriptionManagement />
      </div>
    </div>
  );
}
