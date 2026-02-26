import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EFileValidation } from './EFileValidation';
import { EFileSubmission } from './EFileSubmission';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface EFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxForm: any;
}

export function EFileDialog({ open, onOpenChange, taxForm }: EFileDialogProps) {
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  const handleValidationComplete = (valid: boolean, errors: any[]) => {
    setIsValid(valid);
    setValidationErrors(errors);
  };

  const handleSubmissionComplete = (submissionId: string) => {
    setSubmissionComplete(true);
    setTimeout(() => {
      onOpenChange(false);
      setSubmissionComplete(false);
      setIsValid(false);
    }, 3000);
  };

  const submissionType = taxForm?.form_type.startsWith('state-') ? 'state' : 'federal';
  const stateCode = taxForm?.form_type.startsWith('state-') 
    ? taxForm.form_type.split('-')[1].toUpperCase() 
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>E-File Tax Return</DialogTitle>
          <DialogDescription>
            Electronically file {taxForm?.form_type} for tax year {taxForm?.tax_year}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a demonstration of the e-file workflow. Production implementation requires 
            IRS ERO (Electronic Return Originator) authorization and MeF API credentials.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <EFileValidation 
            formData={taxForm?.form_data || {}}
            onValidationComplete={handleValidationComplete}
          />

          {isValid && !submissionComplete && (
            <EFileSubmission
              taxFormId={taxForm?.id}
              submissionType={submissionType as any}
              stateCode={stateCode}
              isValid={isValid}
              taxYear={new Date().getFullYear()}
              onSubmissionComplete={handleSubmissionComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
