import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function IRSCorrespondenceTracker() {
  const [correspondence, setCorrespondence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCorrespondence();
  }, []);

  const loadCorrespondence = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('irs_correspondence')
        .select('*')
        .eq('user_id', user.id)
        .order('response_deadline', { ascending: true });

      if (error) throw error;
      setCorrespondence(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading correspondence',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addCorrespondence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('irs_correspondence').insert({
        user_id: user.id,
        correspondence_type: formData.get('type'),
        subject: formData.get('subject'),
        received_date: formData.get('received_date'),
        response_deadline: formData.get('response_deadline'),
        irs_notice_number: formData.get('notice_number'),
        description: formData.get('description'),
        status: 'pending',
      });

      if (error) throw error;

      toast({ title: 'Correspondence added successfully' });
      setShowAddDialog(false);
      loadCorrespondence();
    } catch (error: any) {
      toast({
        title: 'Error adding correspondence',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string, deadline: string) => {
    const daysUntil = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (status === 'responded') return <Badge variant="outline">Responded</Badge>;
    if (daysUntil < 0) return <Badge variant="destructive">Overdue</Badge>;
    if (daysUntil <= 7) return <Badge className="bg-orange-500">Due Soon</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">IRS Correspondence</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Correspondence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add IRS Correspondence</DialogTitle>
            </DialogHeader>
            <form onSubmit={addCorrespondence} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notice">Notice</SelectItem>
                      <SelectItem value="request">Request</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notice Number</Label>
                  <Input name="notice_number" placeholder="CP2000, etc." />
                </div>
              </div>
              <div>
                <Label>Subject</Label>
                <Input name="subject" required placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Received Date</Label>
                  <Input name="received_date" type="date" required />
                </div>
                <div>
                  <Label>Response Deadline</Label>
                  <Input name="response_deadline" type="date" required />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" rows={3} />
              </div>
              <Button type="submit" className="w-full">Add Correspondence</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {correspondence.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{item.subject}</h4>
                    {getStatusBadge(item.status, item.response_deadline)}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Deadline: {new Date(item.response_deadline).toLocaleDateString()}
                    </span>
                    {item.irs_notice_number && (
                      <span>Notice: {item.irs_notice_number}</span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
