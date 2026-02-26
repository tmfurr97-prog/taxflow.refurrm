import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const ENTITY_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship', description: 'Simplest structure, no separation from owner' },
  { value: 'llc', label: 'LLC', description: 'Liability protection, flexible taxation' },
  { value: 's_corp', label: 'S-Corporation', description: 'Pass-through taxation, salary + distributions' },
  { value: 'c_corp', label: 'C-Corporation', description: 'Separate tax entity, best for raising capital' },
  { value: 'partnership', label: 'Partnership', description: 'Multiple owners, shared profits' }
];

const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

export default function EntityFormation({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    entity_name: '',
    entity_type: '',
    state: '',
    business_address: '',
    registered_agent: '',
    formation_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('business_entities').insert({
        ...formData,
        user_id: user.id
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Business entity created successfully!' });
      if (onComplete) onComplete();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Form New Business Entity
        </CardTitle>
        <CardDescription>Step {step} of 3</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Choose Your Business Structure</h3>
            <div className="grid gap-3">
              {ENTITY_TYPES.map(type => (
                <Card key={type.value} className={`cursor-pointer transition-all ${formData.entity_type === type.value ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setFormData({ ...formData, entity_type: type.value })}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{type.label}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Business Information</h3>
            <div className="space-y-3">
              <div>
                <Label>Business Name</Label>
                <Input value={formData.entity_name} onChange={e => setFormData({ ...formData, entity_name: e.target.value })} placeholder="Acme LLC" />
              </div>
              <div>
                <Label>State of Formation</Label>
                <Select value={formData.state} onValueChange={v => setFormData({ ...formData, state: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Business Address</Label>
                <Input value={formData.business_address} onChange={e => setFormData({ ...formData, business_address: e.target.value })} />
              </div>
              <div>
                <Label>Formation Date</Label>
                <Input type="date" value={formData.formation_date} onChange={e => setFormData({ ...formData, formation_date: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="font-semibold text-lg">Review & Submit</h3>
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>Entity:</strong> {ENTITY_TYPES.find(t => t.value === formData.entity_type)?.label}</p>
              <p><strong>Name:</strong> {formData.entity_name}</p>
              <p><strong>State:</strong> {formData.state}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!formData.entity_type || (step === 2 && !formData.entity_name)} className="ml-auto">
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="ml-auto">Create Entity</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}