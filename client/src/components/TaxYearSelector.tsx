import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

interface TaxYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function TaxYearSelector({ selectedYear, onYearChange }: TaxYearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];
  const isPriorYear = selectedYear < currentYear;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="tax-year">Tax Year</Label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => onYearChange(parseInt(value))}
          >
            <SelectTrigger id="tax-year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year} {year === currentYear && '(Current Year)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPriorYear && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Prior Year Return:</strong> IRS regulations require prior year returns to be printed and mailed. 
            E-filing is only available for registered tax preparers.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
