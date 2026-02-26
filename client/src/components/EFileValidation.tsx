import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

interface EFileValidationProps {
  formData: any;
  onValidationComplete: (isValid: boolean, errors: ValidationError[]) => void;
}

export function EFileValidation({ formData, onValidationComplete }: EFileValidationProps) {
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [validated, setValidated] = useState(false);

  const validateForm = () => {
    setValidating(true);
    const validationErrors: ValidationError[] = [];

    // Taxpayer Information
    if (!formData.taxpayerName) {
      validationErrors.push({ field: 'Taxpayer Name', message: 'Required for e-filing' });
    }
    if (!formData.ssn || formData.ssn.length !== 9) {
      validationErrors.push({ field: 'SSN', message: 'Valid 9-digit SSN required' });
    }
    if (!formData.address) {
      validationErrors.push({ field: 'Address', message: 'Mailing address required' });
    }

    // Income validation
    if (!formData.totalIncome || formData.totalIncome < 0) {
      validationErrors.push({ field: 'Income', message: 'Total income must be specified' });
    }

    setTimeout(() => {
      setErrors(validationErrors);
      setValidated(true);
      setValidating(false);
      onValidationComplete(validationErrors.length === 0, validationErrors);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>E-File Validation</CardTitle>
        <CardDescription>Validate your form before electronic filing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!validated && (
          <Button onClick={validateForm} disabled={validating} className="w-full">
            {validating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Validate Form
          </Button>
        )}

        {validated && errors.length === 0 && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Form validated successfully. Ready for e-filing.
            </AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && (
          <div className="space-y-2">
            <Alert className="border-red-500 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errors.length} validation error(s) found
              </AlertDescription>
            </Alert>
            {errors.map((error, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <span className="font-medium">{error.field}:</span> {error.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
