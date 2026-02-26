import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Loader2, Trash2, FileEdit, History, Send } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EFileDialog } from './EFileDialog';


interface TaxForm {
  id: string;
  form_type: string;
  tax_year: number;
  pdf_url: string;
  status: string;
  created_at: string;
  is_amended: boolean;
  amended_form_id: string | null;
  amendment_reason: string | null;
  amendment_number: number;
}


export function TaxFormsList() {
  const [forms, setForms] = useState<TaxForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [efileDialogOpen, setEfileDialogOpen] = useState(false);
  const [selectedFormForEfile, setSelectedFormForEfile] = useState<TaxForm | null>(null);
  const { toast } = useToast();


  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tax_forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (form: TaxForm) => {
    try {
      const { data } = await supabase.storage
        .from('tax-forms')
        .download(form.pdf_url);
      
      if (data) {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${form.form_type}-${form.tax_year}.pdf`;
        link.click();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tax_forms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setForms(forms.filter(f => f.id !== id));
      toast({ title: 'Success', description: 'Form deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEfileClick = (form: TaxForm) => {
    setSelectedFormForEfile(form);
    setEfileDialogOpen(true);
  };

  const getAmendmentHistory = (formId: string) => {
    return forms.filter(f => f.amended_form_id === formId);
  };

  const AmendmentHistoryDialog = ({ form }: { form: TaxForm }) => {
    const amendments = getAmendmentHistory(form.id);
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <History className="h-4 w-4 mr-2" />
            History ({amendments.length})
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amendment History</DialogTitle>
            <DialogDescription>
              View all amendments for this form
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {amendments.map((amendment, idx) => (
              <Card key={amendment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>Amendment #{amendment.amendment_number}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(amendment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">
                    <strong>Reason:</strong> {amendment.amendment_reason}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDownload(amendment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
            {amendments.length === 0 && (
              <p className="text-center text-muted-foreground">No amendments yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };


  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (forms.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tax forms generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {forms.filter(f => !f.amended_form_id).map(form => (
          <Card key={form.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{form.form_type}</h3>
                    {form.is_amended && (
                      <Badge variant="secondary">
                        <FileEdit className="h-3 w-3 mr-1" />
                        Amended
                      </Badge>
                    )}
                    {form.amended_form_id && (
                      <Badge variant="outline">Amendment #{form.amendment_number}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tax Year {form.tax_year} • {new Date(form.created_at).toLocaleDateString()}
                  </p>
                  {form.amendment_reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason: {form.amendment_reason}
                    </p>
                  )}
                </div>
                <Badge>{form.status}</Badge>
              </div>
              <div className="flex gap-2">
                {getAmendmentHistory(form.id).length > 0 && (
                  <AmendmentHistoryDialog form={form} />
                )}
                <Button size="sm" variant="default" onClick={() => handleEfileClick(form)}>
                  <Send className="h-4 w-4 mr-2" /> E-File
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(form)}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(form.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFormForEfile && (
        <EFileDialog
          open={efileDialogOpen}
          onOpenChange={setEfileDialogOpen}
          taxForm={selectedFormForEfile}
        />
      )}
    </>
  );
}

