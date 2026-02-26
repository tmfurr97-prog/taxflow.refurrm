import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Link2, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function QuickBooksIntegration() {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleConnect = () => {
    console.log("Connecting to QuickBooks Online...");
    // OAuth flow would be implemented here
    setTimeout(() => setConnected(true), 1000);
  };

  const handleSync = () => {
    setSyncing(true);
    console.log("Syncing with QuickBooks...");
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <Card className="border-teal/20">
      <CardHeader>
        <CardTitle className="font-heading text-charcoal flex items-center gap-2">
          <Link2 className="h-5 w-5 text-teal" />
          QuickBooks Online
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Sync your categorized transactions directly to QuickBooks Online
            </p>
            <Button onClick={handleConnect} className="bg-teal hover:bg-teal-dark text-charcoal">
              Connect QuickBooks
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-teal/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-teal" />
              <span className="text-sm text-charcoal font-medium">Connected to QuickBooks</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-charcoal">142</p>
                <p className="text-xs text-muted-foreground">Synced Transactions</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-charcoal">Today</p>
                <p className="text-xs text-muted-foreground">Last Sync</p>
              </div>
            </div>

            <Button onClick={handleSync} disabled={syncing} className="w-full" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
