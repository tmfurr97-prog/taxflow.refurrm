import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileEdit, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TaxForm {
  id: string;
  form_type: string;
  tax_year: number;
  created_at: string;
  is_amended: boolean;
  amendment_number: number;
}

interface AmendmentSelectorProps {
  onSelectForm: (form: TaxForm) => void;
}

export default function AmendmentSelector({ onSelectForm }: AmendmentSelectorProps) {
  const [forms, setForms] = useState<TaxForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tax_forms')
        .select('id, form_type, tax_year, created_at, is_amended, amendment_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormDisplayName = (formType: string) => {
    const names: Record<string, string> = {
      'schedule-c': 'Schedule C',
      '1040-es': 'Form 1040-ES',
      'state-ca': 'CA 540',
      'state-ny': 'NY IT-201',
      'state-il': 'IL-1040',
      'state-pa': 'PA-40',
      'state-ma': 'MA Form 1'
    };
    return names[formType] || formType;
  };

  if (loading) {
    return <div className="text-center py-8">Loading forms...</div>;
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Select a previously filed form to amend. You can make corrections or additions and generate an amended version.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {forms.map((form) => (
          <Card key={form.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{getFormDisplayName(form.form_type)}</CardTitle>
                {form.is_amended && (
                  <Badge variant="secondary">Amended</Badge>
                )}
              </div>
              <CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Tax Year {form.tax_year}
                  </span>
                  <span className="text-xs">
                    Filed: {new Date(form.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => onSelectForm(form)}
                className="w-full"
                variant="outline"
              >
                <FileEdit className="mr-2 h-4 w-4" />
                Amend This Form
              </Button>
            </CardContent>
          </Card>
        ))}

        {forms.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No tax forms found. Generate a form first before creating amendments.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
