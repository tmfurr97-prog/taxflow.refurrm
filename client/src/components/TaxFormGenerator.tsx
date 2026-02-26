import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, MapPin, FileEdit, Send } from 'lucide-react';
import { ScheduleCForm } from './ScheduleCForm';

import { Form1040ESForm } from './Form1040ESForm';
import { StateTaxForm } from './StateTaxForm';
import { TaxFormsList } from './TaxFormsList';
import AmendmentSelector from './AmendmentSelector';
import Form1040X from './Form1040X';
import StateAmendmentForm from './StateAmendmentForm';
import { EFileStatusTracker } from './EFileStatusTracker';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';



export function TaxFormGenerator() {
  const [activeTab, setActiveTab] = useState('schedule-c');
  const [userState, setUserState] = useState<string | null>(null);
  const [scheduleCData, setScheduleCData] = useState<any>(null);
  const [selectedFormForAmendment, setSelectedFormForAmendment] = useState<any>(null);
  const [amendmentStep, setAmendmentStep] = useState<'select' | 'amend'>('select');
  const { toast } = useToast();


  useEffect(() => {
    loadUserState();
  }, []);

  const loadUserState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('state')
        .eq('id', user.id)
        .single();

      if (profile?.state) {
        setUserState(profile.state);
      }
    } catch (error) {
      console.error('Error loading user state:', error);
    }
  };

  const handleSelectFormForAmendment = (form: any) => {
    setSelectedFormForAmendment(form);
    setAmendmentStep('amend');
  };

  const handleAmendmentComplete = () => {
    setSelectedFormForAmendment(null);
    setAmendmentStep('select');
    setActiveTab('history');
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Tax Form Generator</h2>
          <p className="text-muted-foreground mt-2">
            Generate filled tax forms from your data
          </p>
        </div>
        <FileText className="h-12 w-12 text-primary" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="schedule-c">Schedule C</TabsTrigger>
          <TabsTrigger value="1040-es">Form 1040-ES</TabsTrigger>
          <TabsTrigger value="state" disabled={!userState}>
            <MapPin className="mr-2 h-4 w-4" />
            State Forms
          </TabsTrigger>
          <TabsTrigger value="amendments">
            <FileEdit className="mr-2 h-4 w-4" />
            Amendments
          </TabsTrigger>
          <TabsTrigger value="efile">
            <Send className="mr-2 h-4 w-4" />
            E-File
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>



        <TabsContent value="schedule-c" className="space-y-4">
          <ScheduleCForm onDataChange={setScheduleCData} />
        </TabsContent>

        <TabsContent value="1040-es" className="space-y-4">
          <Form1040ESForm />
        </TabsContent>

        <TabsContent value="state" className="space-y-4">
          {userState && scheduleCData ? (
            <StateTaxForm 
              stateCode={userState}
              federalAGI={scheduleCData.netProfit || 0}
              federalTaxableIncome={scheduleCData.netProfit || 0}
              scheduleC={scheduleCData}
            />
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">
                Please set your state in your profile and complete Schedule C first.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="amendments" className="space-y-4">
          {amendmentStep === 'select' ? (
            <AmendmentSelector onSelectForm={handleSelectFormForAmendment} />
          ) : selectedFormForAmendment ? (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAmendmentStep('select');
                  setSelectedFormForAmendment(null);
                }}
              >
                ← Back to Selection
              </Button>
              
              {selectedFormForAmendment.form_type === 'schedule-c' || 
               selectedFormForAmendment.form_type === '1040-es' ? (
                <Form1040X 
                  originalForm={selectedFormForAmendment} 
                  onComplete={handleAmendmentComplete}
                />
              ) : selectedFormForAmendment.form_type.startsWith('state-') ? (
                <StateAmendmentForm 
                  originalForm={selectedFormForAmendment}
                  onComplete={handleAmendmentComplete}
                />
              ) : null}
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="efile" className="space-y-4">
          <EFileStatusTracker />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <TaxFormsList />
        </TabsContent>

      </Tabs>
    </div>
  );
}

