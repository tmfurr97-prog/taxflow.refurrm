export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
}

// Overload for single receipt vs existing receipts
export function detectDuplicates(receipt: any, existingReceipts: any[]): any[];
// Overload for array of transactions
export function detectDuplicates(transactions: Transaction[]): Transaction[][];
// Implementation
export function detectDuplicates(receiptOrTransactions: any, existingReceipts?: any[]): any {
  if (Array.isArray(existingReceipts)) {
    return (existingReceipts as any[]).filter((r: any) =>
      r.id !== receiptOrTransactions.id &&
      Math.abs((r.amount || 0) - (receiptOrTransactions.amount || 0)) < 0.01 &&
      r.merchant_name === receiptOrTransactions.merchant_name
    );
  }
  const transactions = receiptOrTransactions as Transaction[];
  const groups: Transaction[][] = [];
  const seen = new Set<string>();

  for (let i = 0; i < transactions.length; i++) {
    if (seen.has(transactions[i].id)) continue;

    const duplicates: Transaction[] = [transactions[i]];

    for (let j = i + 1; j < transactions.length; j++) {
      if (seen.has(transactions[j].id)) continue;

      const a = transactions[i];
      const b = transactions[j];

      const sameAmount = Math.abs(a.amount - b.amount) < 0.01;
      const sameDate = a.date === b.date;
      const similarDesc =
        a.description.toLowerCase().trim() === b.description.toLowerCase().trim();

      if (sameAmount && sameDate && similarDesc) {
        duplicates.push(transactions[j]);
        seen.add(transactions[j].id);
      }
    }

    if (duplicates.length > 1) {
      groups.push(duplicates);
      duplicates.forEach((t) => seen.add(t.id));
    }
  }

  return groups;
}

export function removeDuplicates(transactions: Transaction[]): Transaction[] {
  const groups = detectDuplicates(transactions);
  const toRemove = new Set<string>();

  for (const group of groups) {
    // Keep the first, remove the rest
    group.slice(1).forEach((t) => toRemove.add(t.id));
  }

  return transactions.filter((t) => !toRemove.has(t.id));
}
