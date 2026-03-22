import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EFileValidation } from '@/components/EFileValidation';
import { EFileSubmission } from '@/components/EFileSubmission';
import { EFileStatusTracker } from '@/components/EFileStatusTracker';
import { SignatureCapture } from '@/components/SignatureCapture';
import { supabase } from '@/lib/supabase';
import { FileText, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EFile() {
  const [taxForms, setTaxForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [signatureData, setSignatureData] = useState<any>(null);
  const [step, setStep] = useState<'select' | 'validate' | 'sign' | 'submit'>('select');

  useEffect(() => {
    loadTaxForms();
  }, []);

  const loadTaxForms = async () => {
    const { data, error } = await supabase
      .from('tax_forms')
      .select('*')
      .order('tax_year', { ascending: false });
    if (!error && data) setTaxForms(data);
  };

  const handleValidationComplete = (valid: boolean, errors: any[]) => {
    setIsValid(valid);
    setValidationErrors(errors);
    if (valid) setStep('sign');
  };

  const handleSignatureComplete = (signature: string, data: any) => {
    setSignatureData({ signature, ...data });
    setStep('submit');
    toast.success('Signature captured successfully');
  };

  const handleSubmissionComplete = () => {
    setStep('select');
    setSelectedForm(null);
    setSignatureData(null);
    setIsValid(false);
    toast.success('E-file submitted successfully!');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">IRS E-File</h1>
        <p className="text-gray-600">Electronically file your federal and state tax returns</p>
      </div>

      <Tabs defaultValue="file" className="space-y-6">
        <TabsList>
          <TabsTrigger value="file">
            <Send className="h-4 w-4 mr-2" />
            File Return
          </TabsTrigger>
          <TabsTrigger value="status">
            <CheckCircle className="h-4 w-4 mr-2" />
            Filing Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-6">
          {step === 'select' && (
            <Card>
              <CardHeader>
                <CardTitle>Select Tax Return</CardTitle>
                <CardDescription>Choose the tax return you want to e-file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={(id) => setSelectedForm(taxForms.find(f => f.id === id))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tax form" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxForms.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.form_type} - {form.tax_year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedForm && (
                  <Button onClick={() => setStep('validate')} className="w-full">
                    Continue to Validation
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {step === 'validate' && selectedForm && (
            <EFileValidation
              formData={selectedForm.form_data || {}}
              onValidationComplete={handleValidationComplete}
            />
          )}

          {step === 'sign' && selectedForm && (
            <SignatureCapture
              onSignatureComplete={handleSignatureComplete}
              taxpayerName={selectedForm.form_data?.taxpayerName || 'Taxpayer'}
              spouseName={selectedForm.form_data?.spouseName}
            />
          )}

          {step === 'submit' && selectedForm && signatureData && (
            <EFileSubmission
              taxFormId={selectedForm.id}
              taxYear={selectedForm.tax_year}
              submissionType={selectedForm.form_type.startsWith('state-') ? 'state' : 'federal'}
              stateCode={selectedForm.form_type.startsWith('state-') ? selectedForm.form_type.split('-')[1] : undefined}
              isValid={isValid}
              onSubmissionComplete={handleSubmissionComplete}
            />
          )}
        </TabsContent>

        <TabsContent value="status">
          <EFileStatusTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
