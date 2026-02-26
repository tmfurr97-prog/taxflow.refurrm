import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Ticket, Plus, Copy, CheckCircle, XCircle, Users, RefreshCw, ShieldCheck
} from "lucide-react";
import { Link } from "wouter";

export default function AdminPromoCodes() {
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const meQuery = trpc.auth.me.useQuery();
  const user = meQuery.data;

  const codesQuery = trpc.promoCodes.adminList.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const generateMutation = trpc.promoCodes.generate.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Promo code created",
        description: `Code: ${data.code}`,
      });
      codesQuery.refetch();
      setLabel("");
      setMaxUses(1);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const revokeMutation = trpc.promoCodes.revoke.useMutation({
    onSuccess: () => {
      toast({ title: "Code revoked" });
      codesQuery.refetch();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied!", description: `${code} copied to clipboard` });
  };

  if (meQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ShieldCheck className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400 text-lg">Admin access required</p>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const codes = codesQuery.data || [];
  const totalRedemptions = codes.reduce((sum, c) => sum + c.usedCount, 0);
  const activeCodes = codes.filter(c => c.isActive).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-emerald-400" />
            Beta Promo Codes
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate invite codes that grant free Pro-tier access to testers
          </p>
        </div>
        <Link href="/admin/returns">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800">
            Returns Dashboard
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{codes.length}</p>
            <p className="text-slate-500 text-xs mt-1">Total Codes</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{activeCodes}</p>
            <p className="text-slate-500 text-xs mt-1">Active Codes</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{totalRedemptions}</p>
            <p className="text-slate-500 text-xs mt-1">Total Redemptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Generate New Code */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Generate New Beta Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Label (optional)</label>
              <Input
                placeholder="e.g. Beta Tester - Jane Smith"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Max Uses</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-400">
            <p className="font-medium text-slate-300 mb-1">What this code grants:</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> Full TaxGPT AI access</li>
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> Crypto tax tracking</li>
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> Audit Defense hub</li>
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> Business entity management</li>
              <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> SmartBooks Academy (full access)</li>
              <li className="flex items-center gap-1.5"><XCircle className="w-3 h-3 text-slate-600" /> Remote Returns (paid separately)</li>
              <li className="flex items-center gap-1.5"><XCircle className="w-3 h-3 text-slate-600" /> Notary services (paid separately)</li>
            </ul>
          </div>
          <Button
            onClick={() => generateMutation.mutate({ label: label || undefined, maxUses, tierGrant: "beta_pro" })}
            disabled={generateMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
          >
            {generateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Generate Code
          </Button>
        </CardContent>
      </Card>

      {/* Existing Codes */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Ticket className="w-4 h-4 text-slate-400" />
            All Promo Codes
            {codesQuery.isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500 ml-1" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No codes yet. Generate your first beta code above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {codes.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    c.isActive ? "bg-slate-800/50 border-slate-700" : "bg-slate-900/50 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-emerald-400 font-mono font-bold text-sm">{c.code}</code>
                      <Badge className={`text-xs border-0 ${c.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                        {c.isActive ? "Active" : "Revoked"}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                        Beta Pro
                      </Badge>
                    </div>
                    {c.label && (
                      <p className="text-slate-400 text-xs mt-1">{c.label}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {c.usedCount} / {c.maxUses} uses
                      </span>
                      {c.redemptions && c.redemptions.length > 0 && (
                        <span>
                          Redeemed: {c.redemptions.map(r =>
                            new Date(r.redeemedAt).toLocaleDateString()
                          ).join(", ")}
                        </span>
                      )}
                      <span>Created {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {c.isActive && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyCode(c.code)}
                          className="border-slate-700 text-slate-300 bg-transparent hover:bg-slate-700 gap-1.5 h-8"
                        >
                          {copied === c.code ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copied === c.code ? "Copied" : "Copy"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revokeMutation.mutate({ id: c.id })}
                          disabled={revokeMutation.isPending}
                          className="border-red-900 text-red-400 bg-transparent hover:bg-red-950 h-8"
                        >
                          Revoke
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <p className="text-slate-400 text-sm font-medium mb-2">How to share a code</p>
          <p className="text-slate-500 text-xs leading-relaxed">
            Share the code with your beta tester. They go to <strong className="text-slate-400">Profile → Redeem Promo Code</strong> and enter the code. 
            Their account will immediately be upgraded to Beta Pro access — no payment required. 
            Remote Returns and notary services remain paid separately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
