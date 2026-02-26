import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EFileSubmissionProps {
  taxFormId: string;
  taxYear: number;
  submissionType: 'federal' | 'state' | 'both';
  stateCode?: string;
  isValid: boolean;
  signatureData?: any;
  onSubmissionComplete: (submissionId: string) => void;
}



export function EFileSubmission({ 
  taxFormId,
  taxYear,
  submissionType, 
  stateCode, 
  isValid,
  signatureData,
  onSubmissionComplete 
}: EFileSubmissionProps) {

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const currentYear = new Date().getFullYear();
  const isPriorYear = taxYear < currentYear;

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    if (isPriorYear) {
      toast.error('Prior year returns cannot be e-filed. Please print and mail your return.');
      return;
    }

    if (!isValid) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // Call edge function to validate and submit
      const { data, error } = await supabase.functions.invoke('validate-and-efile', {
        body: { taxFormId, submissionType, stateCode }
      });

      if (error) throw error;


      // Save submission to database
      const { data: submission, error: dbError } = await supabase
        .from('efile_submissions')
        .insert({
          tax_form_id: taxFormId,
          submission_type: submissionType,
          state_code: stateCode,
          status: data.status,
          submission_id: data.submissionId,
          irs_acknowledgment: data.irsAcknowledgment,
          state_acknowledgment: data.stateAcknowledgment,
          validation_errors: data.validationErrors || [],
          signature_data: signatureData,
          submission_date: new Date().toISOString(),
          acknowledgment_date: data.status === 'submitted' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (dbError) throw dbError;


      setSubmissionData(data);
      setSubmitted(true);
      toast.success('Form submitted successfully!');
      onSubmissionComplete(data.submissionId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit E-File</CardTitle>
        <CardDescription>
          Electronically file your tax return with the IRS
          {submissionType !== 'federal' && ' and state'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPriorYear && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              <strong>Prior Year Return:</strong> E-filing is not available for {taxYear}. 
              Please print and mail your return to the IRS.
            </AlertDescription>
          </Alert>
        )}
        
        {!submitted && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tax Year:</span>
                <Badge>{taxYear}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filing Type:</span>
                <Badge>{submissionType.toUpperCase()}</Badge>
              </div>
              {stateCode && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">State:</span>
                  <Badge variant="outline">{stateCode}</Badge>
                </div>
              )}
            </div>

            {!isPriorYear && (
              <Alert>
                <AlertDescription>
                  By submitting, you authorize the electronic filing of your tax return.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleSubmit} 
              disabled={!isValid || submitting || isPriorYear}
              className="w-full"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!submitting && <Send className="mr-2 h-4 w-4" />}
              {isPriorYear ? 'E-File Not Available' : 'Submit E-File'}
            </Button>
          </>
        )}


        {submitted && submissionData && (
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your return has been submitted successfully!
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Submission ID:</span>
                <span className="font-mono">{submissionData.submissionId}</span>
              </div>
              {submissionData.irsAcknowledgment && (
                <div className="flex justify-between">
                  <span className="font-medium">IRS Acknowledgment:</span>
                  <span className="font-mono">{submissionData.irsAcknowledgment}</span>
                </div>
              )}
              {submissionData.stateAcknowledgment && (
                <div className="flex justify-between">
                  <span className="font-medium">State Acknowledgment:</span>
                  <span className="font-mono">{submissionData.stateAcknowledgment}</span>
                </div>
              )}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
