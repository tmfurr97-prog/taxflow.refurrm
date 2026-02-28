import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Link2, X } from 'lucide-react';
import type { MatchedPair } from '@/utils/transactionMatching';

interface MatchedPairCardProps {
  pair: MatchedPair;
  onUnmatch: (pairId: string) => void;
}

export function MatchedPairCard({ pair, onUnmatch }: MatchedPairCardProps) {
  const confidenceColor = pair.confidence >= 0.9 ? 'bg-green-500' : pair.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-orange-500';
  const confidenceText = pair.confidence >= 0.9 ? 'High' : pair.confidence >= 0.7 ? 'Medium' : 'Low';

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">Matched Transaction</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUnmatch(pair.transaction.id)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{pair.transaction.source}</Badge>
            <span className="text-sm font-medium">Transaction</span>
          </div>
          <p className="text-sm text-muted-foreground">{pair.transaction.merchant}</p>
          <p className="text-sm">{new Date(pair.transaction.date).toLocaleDateString()}</p>
          <p className="text-lg font-bold">${pair.transaction.amount.toFixed(2)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <span className="text-sm font-medium">Receipt</span>
          </div>
          <p className="text-sm text-muted-foreground">{pair.receipt.merchant}</p>
          <p className="text-sm">{new Date(pair.receipt.date).toLocaleDateString()}</p>
          <p className="text-lg font-bold">${pair.receipt.amount.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex flex-wrap gap-1">
          {((pair as any).matchedBy ?? []).map((reason: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {reason}
            </Badge>
          ))}
        </div>
        <Badge className={`${confidenceColor} text-gray-900`}>
          {confidenceText} ({Math.round(pair.confidence * 100)}%)
        </Badge>
      </div>
    </Card>
  );
}
