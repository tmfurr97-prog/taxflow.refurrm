import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, RefreshCw, TrendingUp, BarChart3, ArrowDownToLine, Unplug } from "lucide-react";

export default function QBOConnect() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: status, isLoading: statusLoading } = trpc.qbo.status.useQuery();

  const [syncRange, setSyncRange] = useState(() => {
    const now = new Date();
    const start = `${now.getFullYear()}-01-01`;
    const end = now.toISOString().slice(0, 10);
    return { startDate: start, endDate: end };
  });

  const syncMutation = trpc.qbo.syncTransactions.useMutation({
    onSuccess: (data) => {
      toast({ title: "Sync complete", description: `${data.inserted} transactions imported into your ledger.` });
      utils.receipts.list.invalidate();
    },
    onError: (err) => toast({ title: "Sync failed", description: err.message, variant: "destructive" }),
  });

  const disconnectMutation = trpc.qbo.disconnect.useMutation({
    onSuccess: () => {
      toast({ title: "QuickBooks disconnected" });
      utils.qbo.status.invalidate();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const plQuery = trpc.qbo.profitLoss.useQuery(
    { startDate: syncRange.startDate, endDate: syncRange.endDate },
    { enabled: !!status?.connected }
  );

  const bsQuery = trpc.qbo.balanceSheet.useQuery(
    { asOfDate: syncRange.endDate },
    { enabled: !!status?.connected }
  );

  function handleConnect() {
    const origin = window.location.origin;
    window.location.href = `/api/qbo/connect?origin=${encodeURIComponent(origin)}`;
  }

  function extractPLSummary(report: Record<string, unknown> | null) {
    if (!report) return null;
    try {
      const rows = (report as { Rows?: { Row?: unknown[] } }).Rows?.Row ?? [];
      const summary: { label: string; value: string }[] = [];
      for (const row of rows as Array<{ type?: string; Summary?: { ColData?: Array<{ value?: string }> } }>) {
        if (row.type === "Section" && row.Summary?.ColData) {
          const label = row.Summary.ColData[0]?.value ?? "";
          const value = row.Summary.ColData[1]?.value ?? "";
          if (label && value) summary.push({ label, value });
        }
      }
      return summary;
    } catch {
      return null;
    }
  }

  const plSummary = extractPLSummary(plQuery.data as Record<string, unknown> | null);

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">QuickBooks Online</h1>
        <p className="text-muted-foreground mt-1">
          Connect your QBO account to import transactions, view your P&amp;L, and pull your balance sheet directly into TaxFlow.
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.connected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
            Connection Status
          </CardTitle>
          <CardDescription>
            {statusLoading
              ? "Checking connection..."
              : status?.connected
              ? `Connected to ${status.companyName || "your QuickBooks company"} (${status.environment})`
              : "Not connected"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          {status?.connected ? (
            <>
              <Badge variant="outline" className="text-green-600 border-green-300">
                {status.environment === "sandbox" ? "Sandbox" : "Live"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                <Unplug className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
              <Button variant="outline" size="sm" onClick={handleConnect}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect} className="bg-[#2CA01C] hover:bg-[#228015] text-white">
              Connect QuickBooks
            </Button>
          )}
        </CardContent>
      </Card>

      {status?.connected && (
        <>
          {/* Date Range Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>Used for transaction sync and P&amp;L report</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 items-end flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={syncRange.startDate}
                  onChange={(e) => setSyncRange((r) => ({ ...r, startDate: e.target.value }))}
                  className="border rounded px-3 py-1.5 text-sm bg-background"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  value={syncRange.endDate}
                  onChange={(e) => setSyncRange((r) => ({ ...r, endDate: e.target.value }))}
                  className="border rounded px-3 py-1.5 text-sm bg-background"
                />
              </div>
            </CardContent>
          </Card>

          {/* Transaction Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownToLine className="h-5 w-5" />
                Import Transactions
              </CardTitle>
              <CardDescription>
                Pull all expense transactions from QuickBooks into your TaxFlow ledger for the selected date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => syncMutation.mutate({ startDate: syncRange.startDate, endDate: syncRange.endDate })}
                disabled={syncMutation.isPending}
              >
                {syncMutation.isPending ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Syncing...</>
                ) : (
                  "Sync Transactions"
                )}
              </Button>
              {syncMutation.data && (
                <p className="text-sm text-muted-foreground mt-3">
                  Last sync: {syncMutation.data.inserted} of {syncMutation.data.total} transactions imported.
                </p>
              )}
            </CardContent>
          </Card>

          {/* P&L Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Profit &amp; Loss
              </CardTitle>
              <CardDescription>
                Live P&amp;L from QuickBooks for the selected date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plQuery.isLoading && <p className="text-sm text-muted-foreground">Loading P&amp;L...</p>}
              {plQuery.error && (
                <p className="text-sm text-destructive">{plQuery.error.message}</p>
              )}
              {plSummary && plSummary.length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {plSummary.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 font-medium">{row.label}</td>
                        <td className="py-2 text-right tabular-nums">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                !plQuery.isLoading && <p className="text-sm text-muted-foreground">No P&amp;L data for this period.</p>
              )}
            </CardContent>
          </Card>

          {/* Balance Sheet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Balance Sheet
              </CardTitle>
              <CardDescription>
                Assets, liabilities, and equity as of {syncRange.endDate}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading balance sheet...</p>}
              {bsQuery.error && (
                <p className="text-sm text-destructive">{bsQuery.error.message}</p>
              )}
              {bsQuery.data && !bsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Balance sheet loaded. {JSON.stringify(bsQuery.data).length > 100 ? "Data available." : "No data."}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
