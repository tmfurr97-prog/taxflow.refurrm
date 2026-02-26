import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Ticket, CheckCircle, RefreshCw, Sparkles } from "lucide-react";

export default function PromoCodeRedemption() {
  const { toast } = useToast();
  const [code, setCode] = useState("");

  const myRedemption = trpc.promoCodes.myRedemption.useQuery();
  const meQuery = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  const redeemMutation = trpc.promoCodes.redeem.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Beta Pro access activated!",
        description: data.message,
      });
      setCode("");
      myRedemption.refetch();
      utils.auth.me.invalidate();
    },
    onError: (err) => {
      toast({
        title: "Invalid code",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const user = meQuery.data;
  const isBetaPro = (user?.subscriptionTier as string) === "beta_pro" || user?.subscriptionStatus === "beta";
  const redemption = myRedemption.data;

  if (myRedemption.isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4 flex items-center gap-2 text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Ticket className="w-4 h-4 text-emerald-400" />
          Beta Access Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        {redemption || isBetaPro ? (
          <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-emerald-400 font-semibold text-sm">Beta Pro Access Active</p>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Beta Pro
                </Badge>
              </div>
              {redemption && (
                <p className="text-slate-400 text-xs mt-1">
                  Code <code className="text-emerald-400 font-mono">{redemption.code}</code> redeemed on{" "}
                  {new Date(redemption.redeemedAt).toLocaleDateString()}
                </p>
              )}
              <p className="text-slate-500 text-xs mt-1">
                You have full access to TaxGPT, Crypto, Audit Defense, Business Entities, and SmartBooks Academy.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">
              Have a beta invite code? Enter it below to unlock Pro-tier access for free.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="BETA-XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && code.trim()) {
                    redeemMutation.mutate({ code: code.trim() });
                  }
                }}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 font-mono"
              />
              <Button
                onClick={() => redeemMutation.mutate({ code: code.trim() })}
                disabled={!code.trim() || redeemMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
              >
                {redeemMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  "Redeem"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
