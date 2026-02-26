export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category?: string;
  type?: 'income' | 'expense';
  merchant?: string;
  source?: string;
}

export interface Receipt {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category?: string;
}

export interface MatchedPair {
  transaction: Transaction;
  receipt: Receipt;
  confidence: number;
}

export function matchTransactionsToReceipts(
  transactions: Transaction[],
  receipts: Receipt[]
): MatchedPair[] {
  const matches: MatchedPair[] = [];

  for (const transaction of transactions) {
    for (const receipt of receipts) {
      const amountMatch = Math.abs(transaction.amount - receipt.amount) < 0.01;
      const dateMatch =
        Math.abs(
          new Date(transaction.date).getTime() - new Date(receipt.date).getTime()
        ) <
        3 * 24 * 60 * 60 * 1000; // within 3 days

      if (amountMatch && dateMatch) {
        matches.push({
          transaction,
          receipt,
          confidence: amountMatch && dateMatch ? 0.95 : 0.6,
        });
      }
    }
  }

  return matches;
}

export function categorizeTransaction(description: string): string {
  const lower = description.toLowerCase();

  if (lower.includes('uber') || lower.includes('lyft') || lower.includes('doordash') || lower.includes('grubhub')) {
    return 'Gig Income';
  }
  if (lower.includes('gas') || lower.includes('shell') || lower.includes('exxon') || lower.includes('chevron')) {
    return 'Vehicle - Fuel';
  }
  if (lower.includes('amazon') || lower.includes('office depot') || lower.includes('staples')) {
    return 'Office Supplies';
  }
  if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('coffee') || lower.includes('starbucks')) {
    return 'Meals & Entertainment';
  }
  if (lower.includes('hotel') || lower.includes('airbnb') || lower.includes('flight') || lower.includes('airline')) {
    return 'Travel';
  }
  if (lower.includes('software') || lower.includes('subscription') || lower.includes('saas')) {
    return 'Software & Subscriptions';
  }
  if (lower.includes('insurance')) {
    return 'Insurance';
  }
  if (lower.includes('phone') || lower.includes('verizon') || lower.includes('at&t') || lower.includes('t-mobile')) {
    return 'Phone & Communications';
  }

  return 'Uncategorized';
}

// Alias for backward compatibility
export const matchTransactionsWithReceipts = matchTransactionsToReceipts;
