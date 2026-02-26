import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';

interface CategorySuggestionsProps {
  transactionName: string;
  merchantName: string;
  amount: number;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_RULES = {
  'Office Supplies': ['staples', 'office depot', 'amazon', 'supplies'],
  'Travel': ['airline', 'hotel', 'uber', 'lyft', 'rental', 'airbnb'],
  'Meals & Entertainment': ['restaurant', 'cafe', 'starbucks', 'food', 'dining'],
  'Vehicle': ['gas', 'fuel', 'shell', 'chevron', 'auto', 'repair'],
  'Professional Services': ['legal', 'accounting', 'consulting', 'lawyer'],
  'Advertising': ['google ads', 'facebook', 'meta', 'marketing'],
  'Utilities': ['electric', 'water', 'internet', 'phone', 'verizon', 'att'],
  'Insurance': ['insurance', 'state farm', 'geico', 'allstate'],
  'Education': ['udemy', 'coursera', 'university', 'tuition', 'training'],
};

export function CategorySuggestions({ transactionName, merchantName, amount, onSelectCategory }: CategorySuggestionsProps) {
  const getSuggestions = () => {
    const text = `${transactionName} ${merchantName}`.toLowerCase();
    const suggestions: string[] = [];

    for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        suggestions.push(category);
      }
    }

    return suggestions.slice(0, 3);
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      <Sparkles className="h-4 w-4 text-purple-500" />
      <span className="text-sm text-gray-600">AI Suggestions:</span>
      {suggestions.map((category) => (
        <Button
          key={category}
          size="sm"
          variant="outline"
          onClick={() => onSelectCategory(category)}
          className="h-7 text-xs"
        >
          {category}
        </Button>
      ))}
    </div>
  );
}